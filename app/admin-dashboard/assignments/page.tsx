"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function AssignmentTable() {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)

  const assignmentData = useQuery(
    api.lecturerDetails.getAssignmentData,
    selectedSemester ? { semester: selectedSemester as 1 | 2 } : {},
  ) || { lecturers: [], subjects: [], assignments: {}, lecturerTotalWeights: {} }

  // Get the grading data to show weights
  const gradingData = useQuery(
    api.lecturerDetails.getGradingData,
    selectedSemester ? { semester: selectedSemester as 1 | 2 } : {},
  ) || { lecturers: [], subjects: [], data: {} }

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Subject Assignments</h2>
        <p className="opacity-90">
          View the automatic subject assignments based on lecturer grades. Lecturers are sorted by their total weight
          across all subjects. In case of a tie, the lecturer with the higher total weight gets priority. Each subject
          is assigned to exactly one lecturer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 max-w-xs">
            <Label htmlFor="semester">Select Semester</Label>
            <Select onValueChange={(value) => setSelectedSemester(Number(value))}>
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
                          <TableHead key={subject}>{subject}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignmentData.lecturers.map((lecturer: string) => (
                        <TableRow key={lecturer}>
                          <TableCell className="sticky left-0 z-20 bg-background font-medium w-64">
                            <div className="flex flex-col">
                              <span>{lecturer}</span>
                              <span className="text-xs text-muted-foreground">
                                Total Weight: {(assignmentData.lecturerTotalWeights[lecturer] || 0).toFixed(2)}
                              </span>
                            </div>
                          </TableCell>
                          {assignmentData.subjects.map((subject: string) => {
                            const isAssigned = assignmentData.assignments[lecturer][subject] === "Assigned"
                            const weight = gradingData.data[lecturer]?.[subject]
                              ? Object.entries(gradingData.data[lecturer][subject])
                                  .filter(([key]) => key !== "semester")
                                  .reduce((total, [criteria, value]) => {
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    return total + calculateWeight(criteria, value as any)
                                  }, 0)
                              : 0

                            return (
                              <TableCell key={`${lecturer}-${subject}`}>
                                <div className="flex flex-col">
                                  {isAssigned ? (
                                    <Badge className="bg-primary self-start mb-1">Assigned</Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-xs mb-1">Not Assigned</span>
                                  )}
                                  <span className={`text-xs ${weight > 0 ? "font-medium" : "text-muted-foreground"}`}>
                                    Weight: {weight.toFixed(2)}
                                  </span>
                                </div>
                              </TableCell>
                            )
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
  )
}

// Helper function to calculate weight for a specific criteria
function calculateWeight(criteria: string, value: string | number | boolean | undefined): number {
  if (value === undefined) return 0

  // Normalize the value for consistent mapping
  const normalizedValue = value.toString().trim()

  const weights = {
    feedback: 2,
    qualification: 3,
    publications: 3,
    experience: 2,
    professionalCertificate: 1,
  }

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
  }

  const weight = weights[criteria as keyof typeof weights] || 0
  const scale = scales[criteria]?.[normalizedValue] || 0

  return weight * scale
}
