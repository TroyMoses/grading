"use client";

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
import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      Degree: 1,
      "Degree-Master[not align]": 2,
      "Degree-Master[align]": 3,
      "Degree-Master-PhD[not align]": 4,
      "Degree-Master-PhD[align]": 5,
      Professor: 6,
    },
    publications: { None: 0, "1-2": 1, "3-4": 2, "5-6": 3, "7-8": 4, "9+": 5 },
    experience: { "0": 1, "1-3": 2, "4-6": 3, "7-9": 4, "10+": 5 },
    professionalCertificate: { true: 1, false: 0 },
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  const weight = weights[criteria] || 0;
  const scale = scales[criteria]?.[normalizedValue] || 0;

  return weight * scale;
}

export default function SubjectsGradingTable() {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  const gradingData = useQuery(
    api.lecturerDetails.getGradingData,
    selectedSemester ? { semester: selectedSemester as 1 | 2 } : {} // ✅ Only pass if defined
  ) || { lecturers: [], subjects: [], data: {} };

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Subjects Grading Table</h2>
        <p className="opacity-90">
          View the grading scores for all lecturers across different subjects.
          Select a semester to filter the results.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subjects Grading Table</CardTitle>
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
              <div className="absolute left-0 top-0 bottom-0 w-40 bg-background z-10" />
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="min-w-max">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 z-20 bg-background">
                          Lecturers
                        </TableHead>
                        {gradingData.subjects.map((subject: string) => (
                          <TableHead key={subject}>{subject}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gradingData.lecturers.map((lecturer: string) => (
                        <TableRow key={lecturer}>
                          <TableCell className="sticky left-0 z-20 bg-background font-medium">
                            {lecturer}
                          </TableCell>
                          {gradingData.subjects.map((subject: string) => {
                            const lecturerSubjectData =
                              gradingData.data[lecturer]?.[subject];
                            let totalWeight = 0;
                            if (lecturerSubjectData) {
                              totalWeight += calculateWeight(
                                "feedback",
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                //@ts-expect-error
                                lecturerSubjectData.feedback
                              );
                              totalWeight += calculateWeight(
                                "qualification",
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                //@ts-expect-error
                                lecturerSubjectData.qualification
                              );
                              totalWeight += calculateWeight(
                                "publications",
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                //@ts-expect-error
                                lecturerSubjectData.publications
                              );
                              totalWeight += calculateWeight(
                                "experience",
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                //@ts-expect-error
                                lecturerSubjectData.experience
                              );
                              totalWeight += calculateWeight(
                                "professionalCertificate",
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                //@ts-expect-error
                                lecturerSubjectData.professionalCertificate
                              );
                            }
                            return (
                              <TableCell key={`${lecturer}-${subject}`}>
                                <span
                                  className={
                                    totalWeight > 0
                                      ? "font-medium"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {totalWeight.toFixed(2)}
                                </span>
                              </TableCell>
                            );
                          })}
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
              Please select a semester to view the grading table
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
