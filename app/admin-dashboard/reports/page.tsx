"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/search-input";
import { Badge } from "@/components/ui/badge";

export default function AssignmentReports() {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all preferences to debug
  const allPreferences =
    useQuery(api.lecturerPreferences.debugGetAllPreferences) || [];

  const assignmentData: {
    lecturers: string[];
    subjects: string[];
    assignments: Record<string, { [key: string]: string }>;
    lecturerTotalWeights: Record<string, number>;
    assignedCreditHours: Record<string, number>;
    preferences: Record<string, Record<string, string>>;
  } = useQuery(
    api.lecturerDetails.getAssignmentData,
    selectedSemester ? { semester: selectedSemester as 1 | 2 } : {}
  ) ?? {
    lecturers: [],
    subjects: [],
    assignments: {},
    lecturerTotalWeights: {},
    assignedCreditHours: {},
    preferences: {},
  };

  // Get all subjects to access credit hours
  const allSubjects = useQuery(api.subjects.getAllSubjects) || [];

  // Get all lecturers to map IDs to names
  const allLecturers = useQuery(api.lecturers.getAllLecturers) || [];
  // const lecturerMap = new Map(allLecturers.map((l) => [l._id, l.name]));

  // Create a map of subject names to credit hours
  const subjectCreditHoursMap = new Map();
  allSubjects.forEach((subject: { name: string; creditHours?: number }) => {
    subjectCreditHoursMap.set(subject.name, subject.creditHours || 3);
  });

  // Create a map of subject names to IDs
  const subjectNameToIdMap = new Map();
  allSubjects.forEach((subject: { _id: string; name: string }) => {
    subjectNameToIdMap.set(subject.name, subject._id);
  });

  // Process the data to get lecturers with assigned subjects
  const lecturersWithAssignments = selectedSemester
    ? assignmentData.lecturers
        .map((lecturer: string) => {
          // Get all assigned subjects for this lecturer
          const assignedSubjects = Object.entries(
            (
              assignmentData.assignments as Record<
                string,
                { [key: string]: string }
              >
            )[lecturer] || {}
          )
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, status]) => status === "Assigned")
            .map(([subject]) => subject);

          // Only include lecturers with at least one assignment
          if (assignedSubjects.length === 0) return null;

          // Calculate total credit hours
          const totalCreditHours = assignedSubjects.reduce((total, subject) => {
            return total + (subjectCreditHoursMap.get(subject) || 3);
          }, 0);

          // Find lecturer ID from name
          const lecturerId = allLecturers.find((l) => l.name === lecturer)?._id;

          return {
            name: lecturer,
            lecturerId,
            subjects: assignedSubjects,
            totalCreditHours,
            totalWeight: assignmentData.lecturerTotalWeights[lecturer] || 0,
          };
        })
        .filter(Boolean)
    : [];

  // Filter lecturers based on search query
  const filteredLecturers = lecturersWithAssignments.filter(
    (lecturer) =>
      lecturer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecturer?.subjects.some((subject) =>
        subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // Function to get preference for a lecturer and subject
  const getPreference = (lecturerName: string, subjectName: string) => {
    // Find the lecturer ID
    const lecturer = allLecturers.find((l) => l.name === lecturerName);
    if (!lecturer) return null;

    // Find the subject ID
    const subjectId = subjectNameToIdMap.get(subjectName);
    if (!subjectId) return null;

    // Find the preference
    const preference = allPreferences.find(
      (p) =>
        p.lecturerId === lecturer._id &&
        p.subjectId === subjectId &&
        p.semester === selectedSemester
    );

    return preference?.preference || null;
  };

  // Function to export data as CSV
  const exportToCSV = () => {
    if (filteredLecturers.length === 0) return;

    // Create CSV content
    const headers = [
      "Lecturer",
      "Assigned Subjects",
      "Total Credit Hours",
      "Total Weight",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredLecturers
        .filter(
          (lecturer): lecturer is NonNullable<typeof lecturer> =>
            lecturer !== null
        )
        .map(
          (lecturer) =>
            `"${lecturer.name}","${lecturer.subjects.join(", ")}","${lecturer.totalCreditHours}","${lecturer.totalWeight.toFixed(2)}"`
        ),
    ].join("\n");

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `lecturer_assignments_semester_${selectedSemester}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to get badge variant based on preference
  const getPreferenceBadgeVariant = (preference: number | null) => {
    if (preference === null) return "outline";
    if (preference === 1) return "default";
    if (preference === 2) return "secondary";
    if (preference === 3) return "outline";
    if (preference === 4) return "destructive";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Lecturer Assignment Report</h2>
        <p className="opacity-90">
          This report shows lecturers who have been assigned subjects based on
          the grading system. Each lecturer can be assigned subjects between
          18-21 credit hours. Select a semester to view the assignments.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assigned Subjects Report</CardTitle>
          <div className="flex items-center gap-4">
            <div className="w-72">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search lecturers or subjects..."
              />
            </div>
            {filteredLecturers.length > 0 && (
              <Button
                onClick={exportToCSV}
                size="sm"
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 max-w-xs">
            <Label htmlFor="semester">Select Semester</Label>
            <Select
              onValueChange={(value) => setSelectedSemester(Number(value))}
            >
              <SelectTrigger id="semester" className="mt-1">
                <SelectValue placeholder="Select a semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedSemester ? (
            filteredLecturers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lecturer</TableHead>
                    <TableHead>Assigned Subjects</TableHead>
                    <TableHead>Credit Hours</TableHead>
                    <TableHead>Total Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLecturers
                    .filter(
                      (lecturer): lecturer is NonNullable<typeof lecturer> =>
                        lecturer !== null
                    )
                    .map((lecturer) => (
                      <TableRow key={lecturer.name}>
                        <TableCell className="font-medium">
                          {lecturer.name}
                        </TableCell>
                        <TableCell>
                          <ul className="list-disc pl-5">
                            {lecturer.subjects.map((subject) => {
                              const preference = getPreference(
                                lecturer.name,
                                subject
                              );
                              return (
                                <li
                                  key={subject}
                                  className="flex items-center gap-2 mb-1"
                                >
                                  <span>
                                    {subject} (
                                    {subjectCreditHoursMap.get(subject) || 3}{" "}
                                    cr)
                                  </span>
                                  {preference !== null && (
                                    <Badge
                                      variant={getPreferenceBadgeVariant(
                                        preference
                                      )}
                                    >
                                      Preference: {preference}
                                    </Badge>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </TableCell>
                        <TableCell>{lecturer.totalCreditHours} / 21</TableCell>
                        <TableCell>{lecturer.totalWeight.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No lecturers with assignments found for this semester
              </div>
            )
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Please select a semester to view the assignment report
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
