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

export default function AssignmentTable() {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  const assignmentData = useQuery(
    api.lecturerDetails.getAssignmentData,
    selectedSemester ? { semester: selectedSemester as 1 | 2 } : {}
  ) || { lecturers: [], subjects: [], assignments: {} };

  // Get the grading data to show weights
  // const gradingData = useQuery(
  //   api.lecturerDetails.getGradingData,
  //   selectedSemester ? { semester: selectedSemester as 1 | 2 } : {}
  // ) || { lecturers: [], subjects: [], data: {} };

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Subject Assignments</h2>
        <p className="opacity-90">
          View the automatic subject assignments based on lecturer grades. The
          system assigns subjects to lecturers with the highest comparative
          advantage, ensuring fairness in the allocation process.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Table</CardTitle>
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
                        {assignmentData.subjects.map((subject: string) => (
                          <TableHead key={subject}>{subject}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignmentData.lecturers.map((lecturer: string) => (
                        <TableRow key={lecturer}>
                          <TableCell className="sticky left-0 z-20 bg-background font-medium">
                            {lecturer}
                          </TableCell>
                          {assignmentData.subjects.map((subject: string) => {
                            const isAssigned =
                              assignmentData.assignments[lecturer][subject] ===
                              "Assigned";
                            // const weight = gradingData.data[lecturer]?.[subject]
                            //   ? Number.parseFloat(
                            //       Object.values(
                            //         gradingData.data[lecturer][subject]
                            //       )
                            //         .reduce(
                            //           (
                            //             total: number,
                            //             // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/no-explicit-any
                            //             value: any
                            //           ) => {
                            //             if (typeof value === "number")
                            //               return total + value;
                            //             return total;
                            //           },
                            //           0
                            //         )
                            //         .toFixed(2)
                            //     )
                            //   : 0;

                            return (
                              <TableCell key={`${lecturer}-${subject}`}>
                                <div className="flex flex-col">
                                  {isAssigned ? (
                                    <Badge className="bg-primary self-start mb-1">
                                      Assigned
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-xs mb-1">
                                      Not Assigned
                                    </span>
                                  )}
                                  {/* <span
                                    className={`text-xs ${weight > 0 ? "font-medium" : "text-muted-foreground"}`}
                                  >
                                    Weight: {weight.toFixed(2)}
                                  </span> */}
                                </div>
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
              Please select a semester to view the assignment table
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
