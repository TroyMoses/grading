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
      "Degree": 1,
      "Degree-Master[not align]": 2,
      "Degree-Master[align]": 3,
      "Degree-Master-PhD[not align]": 4,
      "Degree-Master-PhD[align]": 5,
      "Professor": 6,
    },
    publications: { None: 0, "1-2": 1, "3-4": 2, "5-6": 3, "7-8": 4, "9+": 5 },
    experience: { "0": 1, "1-3": 2, "4-6": 3, "7-9": 4, "10+": 5 },
    professionalCertificate: { true: 1, false: 0 },
  };

  // Debugging logs to check mappings
  console.log(`Calculating weight for: ${criteria} with value: ${normalizedValue}`);

  const weight = weights[criteria] || 0;
  const scale = scales[criteria]?.[normalizedValue] || 0;

  console.log(`Mapped weight: ${weight}, scale: ${scale}, product: ${weight * scale}`);
  return weight * scale;
}

export default function SubjectsGradingTable() {
  const gradingData = useQuery(api.lecturerDetails.getGradingData) || {
    lecturers: [],
    subjects: [],
    data: {},
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subjects Grading Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lecturers</TableHead>
              {gradingData.subjects.map((subject: string) => (
                <TableHead key={subject}>{subject}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {gradingData.lecturers.map((lecturer: string) => (
              <TableRow key={lecturer}>
                <TableCell>{lecturer}</TableCell>
                {gradingData.subjects.map((subject: string) => {
                  const lecturerSubjectData =
                    gradingData.data[lecturer]?.[subject];
                  let totalWeight = 0;
                  if (lecturerSubjectData) {
                    totalWeight += calculateWeight(
                      "feedback",
                      lecturerSubjectData.feedback
                    );
                    totalWeight += calculateWeight(
                      "qualification",
                      lecturerSubjectData.qualification
                    );
                    totalWeight += calculateWeight(
                      "publications",
                      lecturerSubjectData.publications
                    );
                    totalWeight += calculateWeight(
                      "experience",
                      lecturerSubjectData.experience
                    );
                    totalWeight += calculateWeight(
                      "professionalCertificate",
                      lecturerSubjectData.professionalCertificate
                    );
                  }
                  return (
                    <TableCell key={`${lecturer}-${subject}`}>
                      {totalWeight.toFixed(2)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
