"use client";

import type React from "react";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
import { Button } from "@/components/ui/button";
import { Edit2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SearchInput } from "@/components/search-input";
import { Id } from "@/convex/_generated/dataModel";

export default function ManageLecturersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  interface Lecturer {
    _id: string;
    name: string;
    // Add other properties of the lecturer object as needed
  }

  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(
    null
  );
  const [editedName, setEditedName] = useState("");

  const lecturers = useQuery(api.lecturers.getAllLecturers) || [];
  const subjects = useQuery(api.subjects.getAllSubjects) || [];
  const lecturerDetails =
    useQuery(api.lecturerDetails.getLecturerDetails) || [];
  const updateLecturerName = useMutation(api.lecturers.updateLecturerName);

  // Filter lecturers based on search query
  const filteredLecturers = lecturers.filter((lecturer: Lecturer) =>
    lecturer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewClick = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setEditedName(lecturer.name);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLecturerName({
        id: selectedLecturer?._id as Id<"lecturers">,
        name: editedName,
      });

      toast({
        title: "Success",
        description: "Lecturer name updated successfully.",
      });
      setIsEditDialogOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lecturer name.",
        variant: "destructive",
      });
    }
  };

  // Get lecturer details for the selected lecturer
  interface LecturerDetail {
    lecturerId: string;
    subjectId: string;
    qualification: string;
    experience: string;
    publications: string;
    feedback: string;
    professionalCertificate: boolean;
    subjectName?: string; // Add subjectName as an optional property
  }

  const getLecturerDetailsForView = (lecturerId: string) => {
    return lecturerDetails
      .filter((detail: LecturerDetail) => detail.lecturerId === lecturerId)
      .map((detail: LecturerDetail) => {
        const subject = subjects.find(
          (s: { _id: string; name: string }) => s._id === detail.subjectId
        );
        return {
          ...detail,
          subjectName: subject?.name || "Unknown Subject",
        };
      });
  };

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Manage Lecturers</h2>
        <p className="opacity-90">
          View all lecturers in the system. You can view their details or edit
          their names.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lecturers</CardTitle>
          <div className="w-72">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search lecturers..."
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLecturers.map((lecturer: Lecturer) => (
                <TableRow key={lecturer._id}>
                  <TableCell className="font-medium">{lecturer.name}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleViewClick(lecturer)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleEditClick(lecturer)}
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Lecturer Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Lecturer Details: {selectedLecturer?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedLecturer && (
            <div className="mt-4">
              {getLecturerDetailsForView(selectedLecturer._id).length > 0 ? (
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
                    {getLecturerDetailsForView(selectedLecturer._id).map(
                      (detail: LecturerDetail) => (
                        <TableRow
                          key={`${detail.lecturerId}-${detail.subjectId}`}
                        >
                          <TableCell>{detail.subjectName}</TableCell>
                          <TableCell>{detail.qualification}</TableCell>
                          <TableCell>{detail.experience}</TableCell>
                          <TableCell>{detail.publications}</TableCell>
                          <TableCell>{detail.feedback}</TableCell>
                          <TableCell>
                            {detail.professionalCertificate ? "Yes" : "No"}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No details available for this lecturer
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Lecturer Name Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Lecturer</DialogTitle>
          </DialogHeader>
          {selectedLecturer && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lecturer-name">Lecturer Name</Label>
                <Input
                  id="lecturer-name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
