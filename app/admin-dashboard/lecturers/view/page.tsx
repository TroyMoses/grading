"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ViewLecturers() {
  const lecturers = useQuery(api.lecturers.getAllLecturers) || [];
  const subjects = useQuery(api.subjects.getAllSubjects) || [];
  const lecturerDetails =
    useQuery(api.lecturerDetails.getLecturerDetails) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Lecturers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lecturer</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Publications</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Professional Certificate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lecturerDetails.map(
              (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                detail: any
              ) => {
                const lecturer = lecturers.find(
                  (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    l: any
                  ) => l._id === detail.lecturerId
                );
                const subject = subjects.find(
                  (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    s: any
                  ) => s._id === detail.subjectId
                );
                return (
                  <TableRow key={`${detail.lecturerId}-${detail.subjectId}`}>
                    <TableCell>{lecturer?.name}</TableCell>
                    <TableCell>{subject?.name}</TableCell>
                    <TableCell>{detail.qualification}</TableCell>
                    <TableCell>{detail.experience}</TableCell>
                    <TableCell>{detail.publications}</TableCell>
                    <TableCell>{detail.feedback}</TableCell>
                    <TableCell>
                      {detail.professionalCertificate ? "Yes" : "No"}
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
