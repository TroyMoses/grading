"use client";

import { useState } from "react";
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
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditLecturerDetailsForm } from "@/components/edit-lecturer-details-form";
import { Id } from "@/convex/_generated/dataModel";

export default function ViewLecturers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  interface LecturerDetail {
    lecturerId: string;
    subjectId: string;
    qualification: string;
    experience: string;
    publications: string;
    feedback: string;
    professionalCertificate: boolean;
    lecturerName?: string;
    subjectName?: string;
  }

  const [selectedDetail, setSelectedDetail] = useState<LecturerDetail | null>(
    null
  );

  interface Lecturer {
    _id: string;
    name: string;
    // Add other properties of the lecturer object if needed
  }

  const lecturers: Lecturer[] = useQuery(api.lecturers.getAllLecturers) || [];
  // Removed unused 'lecturer' variable
  const lecturerDetails =
    useQuery(api.lecturerDetails.getLecturerDetails) || [];

  const subjects = useQuery(api.subjects.getAllSubjects) || [];

  interface Subject {
    _id: Id<"subjects">;
    _creationTime: number;
    name: string;
    semester: number;
    year: number;
    department: string;
  }

  // Filter lecturer details based on search query
  const filteredDetails = lecturerDetails.filter((detail: LecturerDetail) => {
    const lecturer = lecturers.find(
      (l: Lecturer) => l._id === detail.lecturerId
    );
    const subject = subjects.find((s: Subject) => s._id === detail.subjectId);

    const lecturerName = lecturer?.name || "";
    const subjectName = subject?.name || "";

    return (
      lecturerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subjectName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleEditClick = (detail: LecturerDetail) => {
    setSelectedDetail(detail);
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>View Lecturers</CardTitle>
        <div className="w-72">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by lecturer or subject..."
          />
        </div>
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
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDetails.map((detail: LecturerDetail) => {
              const lecturer = lecturers.find(
                (l: Lecturer) => l._id === detail.lecturerId
              );
              const subject = subjects.find(
                (s: Subject) => s._id === detail.subjectId
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleEditClick({
                          ...detail,
                          lecturerName: lecturer?.name,
                          subjectName: subject?.name,
                        })
                      }
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Lecturer Details</DialogTitle>
          </DialogHeader>
          {selectedDetail && (
            <EditLecturerDetailsForm
              detail={selectedDetail}
              onClose={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
