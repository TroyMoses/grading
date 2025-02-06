/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function ManageLecturers() {
  const { toast } = useToast();
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  const lecturers = useQuery(api.lecturers.getAllLecturers) || [];
  const subjects =
    useQuery(api.subjects.getSubjectsBySemester, {
      semester: selectedSemester || 0,
    }) || [];

  const updateLecturerDetails = useMutation(
    api.lecturerDetails.updateLecturerDetails
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const details = {
      lecturerId: selectedLecturerId,
      subjectId: selectedSubjectId,
      semester: selectedSemester,
      qualification: formData.get("qualification") as string,
      experience: formData.get("experience") as string,
      publications: formData.get("publications") as string,
      feedback: formData.get("feedback") as string,
      professionalCertificate: formData.get("professionalCertificate") === "on",
    };
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      await updateLecturerDetails(details);
      toast({
        title: "Success",
        description: "Lecturer details updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lecturer details.",
        variant: "destructive",
      });
    }
  };

  const years = [1, 2, 3];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Lecturers</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lecturer">Select Lecturer</Label>
              <Select onValueChange={(value) => setSelectedLecturerId(value)}>
                <SelectTrigger id="lecturer">
                  <SelectValue placeholder="Select a lecturer" />
                </SelectTrigger>
                <SelectContent>
                  {lecturers.map(
                    (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      lecturer: any
                    ) => (
                      <SelectItem key={lecturer._id} value={lecturer._id}>
                        {lecturer.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Select Semester</Label>
              <Select
                onValueChange={(value) => setSelectedSemester(Number(value))}
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select a semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Select Subject</Label>
              <Select onValueChange={(value) => setSelectedSubjectId(value)}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(
                    (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      subject: any
                    ) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedLecturerId && selectedSubjectId && selectedSemester && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Select name="qualification">
                  <SelectTrigger id="qualification">
                    <SelectValue placeholder="Select qualification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Degree">Degree</SelectItem>
                    <SelectItem value="Degree-Master[not align]">
                      Degree-Master (not align)
                    </SelectItem>
                    <SelectItem value="Degree-Master[align]">
                      Degree-Master (align)
                    </SelectItem>
                    <SelectItem value="Degree-Master-PhD[not align]">
                      Degree-Master-PhD (not align)
                    </SelectItem>
                    <SelectItem value="Degree-Master-PhD[align]">
                      Degree-Master-PhD (align)
                    </SelectItem>
                    <SelectItem value="Professor">Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Select name="experience">
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 year</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="4-6">4-6 years</SelectItem>
                    <SelectItem value="7-9">7-9 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publications">Publications</Label>
                <Select name="publications">
                  <SelectTrigger id="publications">
                    <SelectValue placeholder="Select publications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    <SelectItem value="1-2">1-2 papers</SelectItem>
                    <SelectItem value="3-4">3-4 papers</SelectItem>
                    <SelectItem value="5-6">5-6 papers</SelectItem>
                    <SelectItem value="7-8">7-8 papers</SelectItem>
                    <SelectItem value="9+">9+ papers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Select name="feedback">
                  <SelectTrigger id="feedback">
                    <SelectValue placeholder="Select feedback" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Above 80">Above 80</SelectItem>
                    <SelectItem value="70-79">70-79</SelectItem>
                    <SelectItem value="60-69">60-69</SelectItem>
                    <SelectItem value="50-59">50-59</SelectItem>
                    <SelectItem value="Below 50">Below 50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex items-center space-x-2">
                <Checkbox
                  id="professionalCertificate"
                  name="professionalCertificate"
                />
                <Label htmlFor="professionalCertificate">
                  Professional Certificate
                </Label>
              </div>
              <div className="col-span-2">
                <Button type="submit">Update Lecturer Details</Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
