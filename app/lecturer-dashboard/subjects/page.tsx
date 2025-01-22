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
import { Lecturer, LecturerDetail, Subject } from "../../../lib/types";

export default function LecturerSubjects() {
  const { userId } = useAuth();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-expect-error
  const lecturer: Lecturer | null =
    useQuery(api.lecturers.getLecturer, { userId: userId ?? "" }) || {};
  const subjects: Subject[] =
    useQuery(api.lecturerDetails.getSubjectsByLecturerId, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      lecturerId: lecturer._id,
    }) || [];
  const lecturerDetails: LecturerDetail[] =
    useQuery(api.lecturerDetails.getLecturerDetailsByLecturerId, {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      lecturerId: lecturer._id,
    }) || [];

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
            {subjects.map(
              (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                subject: any
              ) => {
                const detail = lecturerDetails.find(
                  (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    d: any
                  ) => d.subjectId === subject._id
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
              }
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
