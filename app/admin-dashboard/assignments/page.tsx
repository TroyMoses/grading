"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AssignmentTable() {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)

  const assignmentData = useQuery(
    api.lecturerDetails.getAssignmentData,
    selectedSemester ? { semester: selectedSemester as 1 | 2 } : {},
  ) || { lecturers: [], subjects: [], assignments: {} }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="semester">Select Semester</Label>
            <Select onValueChange={(value) => setSelectedSemester(Number(value))}>
              <SelectTrigger id="semester">
                <SelectValue placeholder="Select a semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {selectedSemester && (
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-40 bg-background z-10" />
            <ScrollArea className="w-[1000px] whitespace-nowrap rounded-md border">
              <div className="min-w-max">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 z-20 bg-background">Lecturers</TableHead>
                      {assignmentData.subjects.map((subject: string) => (
                        <TableHead key={subject}>{subject}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignmentData.lecturers.map((lecturer: string) => (
                      <TableRow key={lecturer}>
                        <TableCell className="sticky left-0 z-20 bg-background">{lecturer}</TableCell>
                        {assignmentData.subjects.map((subject: string) => (
                          <TableCell key={`${lecturer}-${subject}`}>
                            {assignmentData.assignments[lecturer][subject]}
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
        )}
      </CardContent>
    </Card>
  )
}

