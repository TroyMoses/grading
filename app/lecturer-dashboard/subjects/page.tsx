"use client";

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

export default function LecturerSubjects() {
  const { user } = useUser();
  // Get the user from Convex database
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Only query for subjects if the user has a lecturerId
  const subjects =
    useQuery(
      api.lecturerDetails.getSubjectsByLecturerId,
      convexUser?.lecturerId ? { lecturerId: convexUser.lecturerId } : "skip"
    ) || [];

  // Similarly, only query for lecturer details if the user has a lecturerId
  const lecturerDetails =
    useQuery(
      api.lecturerDetails.getLecturerDetailsByLecturerId,
      convexUser?.lecturerId ? { lecturerId: convexUser.lecturerId } : "skip"
    ) || [];

  if (!convexUser?.lecturerId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            Your account has not been associated with a lecturer profile yet.
            Please contact an administrator.
          </div>
        </CardContent>
      </Card>
    );
  }

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
