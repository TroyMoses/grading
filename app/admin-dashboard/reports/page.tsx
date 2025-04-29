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

export default function AssignmentReports() {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const assignmentData = useQuery(
    api.lecturerDetails.getAssignmentData,
    selectedSemester ? { semester: selectedSemester as 1 | 2 } : {}
  ) || {
    lecturers: [],
    subjects: [],
    assignments: {},
    lecturerTotalWeights: {},
  };

  // Process the data to get lecturers with maximum assignments
  const lecturersWithMaxAssignments = selectedSemester
    ? assignmentData.lecturers
        .map((lecturer: string) => {
          // Get all assigned subjects for this lecturer
          const assignedSubjects = Object.entries(
            assignmentData.assignments[lecturer] || {}
          )
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, status]) => status === "Assigned")
            .map(([subject]) => subject);

          // Only include lecturers with the maximum number of assignments (2)
          return assignedSubjects.length === 2
            ? {
                name: lecturer,
                subject1: assignedSubjects[0] || "-",
                subject2: assignedSubjects[1] || "-",
                totalWeight: assignmentData.lecturerTotalWeights[lecturer] || 0,
              }
            : null;
        })
        .filter(Boolean)
    : [];

  // Filter lecturers based on search query
  const filteredLecturers = lecturersWithMaxAssignments.filter(
    (lecturer) =>
      lecturer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecturer?.subject1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecturer?.subject2.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to export data as CSV
  const exportToCSV = () => {
    if (filteredLecturers.length === 0) return;

    // Create CSV content
    const headers = ["Lecturer", "Subject 1", "Subject 2", "Total Weight"];
    const csvContent = [
      headers.join(","),
      ...filteredLecturers
        .filter(
          (lecturer): lecturer is NonNullable<typeof lecturer> =>
            lecturer !== null
        )
        .map(
          (lecturer) =>
            `"${lecturer.name}","${lecturer.subject1}","${lecturer.subject2}","${lecturer.totalWeight.toFixed(2)}"`
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

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Lecturer Assignment Report</h2>
        <p className="opacity-90">
          This report shows lecturers who have been assigned the maximum number
          of subjects (2) based on the grading system. Select a semester to view
          the assignments.
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
                    <TableHead>Subject 1</TableHead>
                    <TableHead>Subject 2</TableHead>
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
                        <TableCell>{lecturer.subject1}</TableCell>
                        <TableCell>{lecturer.subject2}</TableCell>
                        <TableCell>{lecturer.totalWeight.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No lecturers with maximum assignments found for this semester
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
