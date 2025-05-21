"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Id } from "@/convex/_generated/dataModel";

export default function LecturerAssignments() {
  const { user } = useUser();
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  // Get user from Convex database
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get lecturer using the lecturerId from the user record
  const lecturer = useQuery(
    api.lecturers.getLecturerById,
    convexUser?.lecturerId ? { id: convexUser.lecturerId } : "skip"
  );

  // Get assignment data
  const queryResult = useQuery(
    api.lecturerDetails.getAssignmentData,
    selectedSemester ? { semester: selectedSemester as 1 | 2 } : {}
  );

  const assignmentData = useMemo(() => {
    return (
      queryResult || {
        lecturers: [],
        subjects: [],
        assignments: {},
        lecturerTotalWeights: {},
        assignedCreditHours: {},
      }
    );
  }, [queryResult]);

  // Get all subjects to access credit hours
  const allSubjectsQuery = useQuery(api.subjects.getAllSubjects);
  const allSubjects = useMemo(() => allSubjectsQuery || [], [allSubjectsQuery]);

  // Create a map of subject names to credit hours
  const subjectCreditHoursMap = useMemo(() => {
    const map = new Map();
    allSubjects.forEach((subject: { name: string; creditHours?: number }) => {
      map.set(subject.name, subject.creditHours || 3);
    });
    return map;
  }, [allSubjects]);

  // Get lecturer details for weight information
  const lecturerDetailsQuery = useQuery(
    api.lecturerDetails.getLecturerDetailsByLecturerId,
    lecturer ? { lecturerId: lecturer._id as Id<"lecturers"> } : "skip"
  );

  const lecturerDetails = lecturerDetailsQuery || [];

  // Filter assignments for this lecturer
  const lecturerName = lecturer?.name || "";
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [totalCreditHours, setTotalCreditHours] = useState<number>(0);

  useEffect(() => {
    if (
      selectedSemester &&
      lecturerName &&
      assignmentData?.subjects &&
      assignmentData?.assignments
    ) {
      const filteredSubjects = assignmentData.subjects.filter(
        (subject) =>
          assignmentData.assignments[lecturerName] &&
          assignmentData.assignments[lecturerName][subject] === "Assigned"
      );
      setAssignedSubjects(filteredSubjects);
      // Calculate total credit hours
      const creditHours = filteredSubjects.reduce((total, subject) => {
        return total + (subjectCreditHoursMap.get(subject) || 3);
      }, 0);
      setTotalCreditHours(creditHours);
    } else {
      setAssignedSubjects([]);
    }
  }, [selectedSemester, lecturerName, assignmentData, subjectCreditHoursMap]);

  // Get weight for each subject
  const getSubjectWeight = (subjectName: string) => {
    const detail = lecturerDetails?.find(
      (d: { subject?: { name: string } }) => d.subject?.name === subjectName
    );
    if (!detail) return 0;

    let totalWeight = 0;
    totalWeight += calculateWeight("feedback", detail.feedback);
    totalWeight += calculateWeight("qualification", detail.qualification);
    totalWeight += calculateWeight("publications", detail.publications);
    totalWeight += calculateWeight("experience", detail.experience);
    totalWeight += calculateWeight(
      "professionalCertificate",
      detail.professionalCertificate
    );

    return totalWeight;
  };

  if (!convexUser?.lecturerId) {
    return (
      <div className="space-y-6">
        <div className="gradient-card rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">My Subject Assignments</h2>
          <p className="opacity-90">
            Your account has not been associated with a lecturer profile yet.
            Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">My Subject Assignments</h2>
        <p className="opacity-90">
          View the subjects assigned to you based on the grading system.
          Assignments are determined by your qualifications, experience,
          publications, feedback, and professional certifications. You can be
          assigned subjects up to a maximum of 18-21 credit hours.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Assignments</CardTitle>
          <div className="w-48">
            <Label htmlFor="semester" className="sr-only">
              Select Semester
            </Label>
            <Select
              onValueChange={(value) => setSelectedSemester(Number(value))}
            >
              <SelectTrigger id="semester">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {selectedSemester ? (
            assignedSubjects.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Credit Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Your Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignedSubjects.map((subject) => (
                      <TableRow key={subject}>
                        <TableCell className="font-medium">{subject}</TableCell>
                        <TableCell>
                          {subjectCreditHoursMap.get(subject) || 3}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary">Assigned</Badge>
                        </TableCell>
                        <TableCell>
                          {getSubjectWeight(subject).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={1} className="font-bold">
                        Total Credit Hours
                      </TableCell>
                      <TableCell colSpan={3} className="font-bold">
                        {totalCreditHours} / 21
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                {lecturer
                  ? "No subjects assigned to you for this semester"
                  : "Your lecturer profile is not set up yet. Please contact an administrator."}
              </div>
            )
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Please select a semester to view your assignments
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
