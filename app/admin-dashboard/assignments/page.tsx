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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/search-input";

export default function AssignmentTable() {
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
    assignedCreditHours: {},
  };

  // Get the grading data to show weights
  const gradingData = useQuery(
    api.lecturerDetails.getGradingData,
    selectedSemester ? { semester: selectedSemester as 1 | 2 } : {}
  ) || { lecturers: [], subjects: [], data: {} };

  // Get all subjects to access credit hours
  const allSubjects = useQuery(api.subjects.getAllSubjects) || [];

  // Get all lecturers for ID mapping
  const allLecturers = useQuery(api.lecturers.getAllLecturers) || [];

  // Get all preferences to show alongside assignments
  const allPreferences =
    useQuery(api.lecturerPreferences.debugGetAllPreferences) || [];

  // Create a map of subject names to credit hours
  const subjectCreditHoursMap = new Map();
  allSubjects.forEach((subject: { name: string; creditHours?: number }) => {
    subjectCreditHoursMap.set(subject.name, subject.creditHours || 3);
  });

  // Create maps for efficient lookups
  const lecturerNameToIdMap = new Map();
  const subjectNameToIdMap = new Map();

  allLecturers.forEach((lecturer: { _id: string; name: string }) => {
    lecturerNameToIdMap.set(lecturer.name, lecturer._id);
  });

  allSubjects.forEach((subject: { _id: string; name: string }) => {
    subjectNameToIdMap.set(subject.name, subject._id);
  });

  // Function to get preference for a lecturer-subject pair
  const getPreference = (lecturerName: string, subjectName: string) => {
    const lecturerId = lecturerNameToIdMap.get(lecturerName);
    const subjectId = subjectNameToIdMap.get(subjectName);

    if (!lecturerId || !subjectId) return null;

    type Preference = {
      lecturerId: string;
      subjectId: string;
      semester: number;
      preference: number;
    };

    const preference = allPreferences.find(
      (pref: Preference) =>
        pref.lecturerId === lecturerId &&
        pref.subjectId === subjectId &&
        pref.semester === selectedSemester
    );

    return preference?.preference || null;
  };

  // Function to get preference badge variant
  const getPreferenceBadgeVariant = (preference: number) => {
    switch (preference) {
      case 1:
        return "default"; // Blue
      case 2:
        return "secondary"; // Gray
      case 3:
        return "outline"; // White with border
      case 4:
        return "destructive"; // Red
      case 5:
        return "outline"; // White with border
      default:
        return "outline";
    }
  };

  // Filter lecturers based on search query
  const filteredLecturers = assignmentData.lecturers.filter(
    (lecturer: string) =>
      lecturer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Subject Assignments</h2>
        <p className="opacity-90">
          View the automatic subject assignments based on lecturer grades.
          Lecturers are sorted by their total weight across all subjects. In
          case of a tie, the lecturer with the higher total weight gets
          priority. Each lecturer can be assigned subjects between 18-21 credit
          hours. Preferences are shown for assigned subjects.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Assignment Table</CardTitle>
          <div className="w-72">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search lecturers..."
            />
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
            <div className="relative rounded-md border">
              <div className="absolute left-0 top-0 bottom-0 w-64 bg-background z-10" />
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="min-w-max">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 z-20 bg-background w-64">
                          Lecturers (Sorted by Total Weight)
                        </TableHead>
                        {assignmentData.subjects.map((subject: string) => (
                          <TableHead key={subject}>
                            {subject} ({subjectCreditHoursMap.get(subject) || 3}{" "}
                            cr)
                          </TableHead>
                        ))}
                        <TableHead>Credit Hours</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLecturers.map((lecturer: string) => (
                        <TableRow key={lecturer}>
                          <TableCell className="sticky left-0 z-20 bg-background font-medium w-64">
                            <div className="flex flex-col">
                              <span>{lecturer}</span>
                              <span className="text-xs text-muted-foreground">
                                Total Weight:{" "}
                                {(
                                  assignmentData.lecturerTotalWeights[
                                    lecturer
                                  ] || 0
                                ).toFixed(2)}
                              </span>
                            </div>
                          </TableCell>
                          {assignmentData.subjects.map((subject: string) => {
                            const isAssigned =
                              assignmentData.assignments[lecturer][subject] ===
                              "Assigned";
                            const weight = gradingData.data[lecturer]?.[subject]
                              ? Object.entries(
                                  gradingData.data[lecturer][subject]
                                )
                                  .filter(([key]) => key !== "semester")
                                  .reduce((total, [criteria, value]) => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    return (
                                      total +
                                      calculateWeight(
                                        criteria,
                                        value as
                                          | string
                                          | number
                                          | boolean
                                          | undefined
                                      )
                                    );
                                  }, 0)
                              : 0;
                            // Return

                            // Get preference only for assigned subjects
                            const preference = isAssigned
                              ? getPreference(lecturer, subject)
                              : null;

                            return (
                              <TableCell key={`${lecturer}-${subject}`}>
                                <div className="flex flex-col gap-1">
                                  {isAssigned ? (
                                    <Badge className="bg-primary self-start">
                                      Assigned
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">
                                      Not Assigned
                                    </span>
                                  )}
                                  <span
                                    className={`text-xs ${weight > 0 ? "font-medium" : "text-muted-foreground"}`}
                                  >
                                    Weight: {weight.toFixed(2)}
                                  </span>
                                  {/* Show preference only for assigned subjects */}
                                  {isAssigned && preference && (
                                    <Badge
                                      variant={getPreferenceBadgeVariant(
                                        preference
                                      )}
                                      className="self-start text-xs"
                                    >
                                      Preference: {preference}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                            );
                          })}
                          <TableCell>
                            <Badge
                              variant={
                                assignmentData.assignedCreditHours[lecturer] > 0
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {assignmentData.assignedCreditHours[lecturer] ||
                                0}{" "}
                              / 21
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Please select a semester to view the assignment table
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to calculate weight for a specific criteria
function calculateWeight(
  criteria: string,
  value: string | number | boolean | undefined
): number {
  if (value === undefined) return 0;

  // Normalize the value for consistent mapping
  const normalizedValue = value.toString().trim();

  const weights = {
    feedback: 2,
    qualification: 3,
    publications: 3,
    experience: 2,
    professionalCertificate: 1,
  };

  const scales: { [key: string]: { [key: string]: number } } = {
    feedback: {
      "Above 80": 5,
      "70-79": 4,
      "60-69": 3,
      "50-59": 2,
      "Below 50": 1,
    },
    qualification: {
      "Degree[align]": 1,
      "Degree[not align]": 0,
      "Degree-Master[align]": 2,
      "Degree-Master[not align]": 1,
      "Degree-Master-PhD[align]": 3,
      "Degree-Master-PhD[not align]": 2,
      "Degree-Master-PhD-Senior-Lecturer[align]": 4,
      "Degree-Master-PhD-Professor": 5,
      Professor: 6,
    },
    publications: { None: 0, "1-2": 1, "3-4": 2, "5-6": 3, "7-8": 4, "9+": 5 },
    experience: { "0": 1, "1-3": 2, "4-6": 3, "7-9": 4, "10+": 5 },
    professionalCertificate: { true: 1, false: 0 },
  };

  const weight = weights[criteria as keyof typeof weights] || 0;
  const scale = scales[criteria]?.[normalizedValue] || 0;

  return weight * scale;
}
