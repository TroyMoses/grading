"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function LecturerSubjects() {
  const { userId } = useAuth();
  const lecturer = useQuery(api.lecturers.getLecturer, { userId: userId ?? "" }) || {};
  const subjects =
    useQuery(api.lecturerDetails.getSubjectsByLecturerId, { lecturerId: lecturer._id }) || [];
  const lecturerDetails =
    useQuery(api.lecturerDetails.getLecturerDetailsByLecturerId, { lecturerId: lecturer._id }) ||
    [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Subjects</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Qualification</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Publications</TableHead>
              <TableHead>Feedback</TableHead>
              <TableHead>Professional Certificate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject: any) => {
              const detail = lecturerDetails.find(
                (d: any) => d.subjectId === subject._id
              );
              return (
                <TableRow key={subject._id}>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{detail?.qualification}</TableCell>
                  <TableCell>{detail?.experience}</TableCell>
                  <TableCell>{detail?.publications}</TableCell>
                  <TableCell>{detail?.feedback}</TableCell>
                  <TableCell>
                    {detail?.professionalCertificate ? "Yes" : "No"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
