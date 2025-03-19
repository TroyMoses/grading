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

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Subject Assignments</h2>
        <p className="opacity-90">
          View the automatic subject assignments based on lecturer grades. Each
          lecturer can be assigned a maximum of 2 subjects.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject Assignments</CardTitle>
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
                          {assignmentData.subjects.map((subject: string) => (
                            <TableCell key={`${lecturer}-${subject}`}>
                              {assignmentData.assignments[lecturer][subject] ===
                              "Assigned" ? (
                                <Badge className="bg-primary">Assigned</Badge>
                              ) : (
                                <span className="text-muted-foreground">
                                  Not Assigned
                                </span>
                              )}
                            </TableCell>
                          ))}
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
