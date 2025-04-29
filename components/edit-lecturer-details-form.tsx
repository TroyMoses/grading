"use client";

import type React from "react";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Button } from "@/components/ui/button";
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

interface EditLecturerDetailsFormProps {
  detail: any;
  onClose: () => void;
}

export function EditLecturerDetailsForm({
  detail,
  onClose,
}: EditLecturerDetailsFormProps) {
  const { toast } = useToast();
  const [qualification, setQualification] = useState(
    detail.qualification || ""
  );
  const [experience, setExperience] = useState(detail.experience || "");
  const [publications, setPublications] = useState(detail.publications || "");
  const [feedback, setFeedback] = useState(detail.feedback || "");
  const [professionalCertificate, setProfessionalCertificate] = useState(
    detail.professionalCertificate || false
  );

  const updateLecturerDetails = useMutation(
    api.lecturerDetails.updateLecturerDetails
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateLecturerDetails({
        lecturerId: detail.lecturerId,
        subjectId: detail.subjectId,
        semester: detail.semester,
        qualification,
        experience,
        publications,
        feedback,
        professionalCertificate,
      });

      toast({
        title: "Success",
        description: "Lecturer details updated successfully.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lecturer details.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Lecturer</Label>
          <Input value={detail.lecturerName} disabled className="bg-muted/50" />
        </div>
        <div>
          <Label>Subject</Label>
          <Input value={detail.subjectName} disabled className="bg-muted/50" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="qualification">Qualification</Label>
          <Select value={qualification} onValueChange={setQualification}>
            <SelectTrigger id="qualification">
              <SelectValue placeholder="Select qualification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Degree[align]">Degree (align)</SelectItem>
              <SelectItem value="Degree[not align]">
                Degree (not align)
              </SelectItem>
              <SelectItem value="Degree-Master[align]">
                Degree-Master (align)
              </SelectItem>
              <SelectItem value="Degree-Master[not align]">
                Degree-Master (not align)
              </SelectItem>
              <SelectItem value="Degree-Master-PhD[align]">
                Degree-Master-PhD (align)
              </SelectItem>
              <SelectItem value="Degree-Master-PhD[not align]">
                Degree-Master-PhD (not align)
              </SelectItem>
              <SelectItem value="Degree-Master-PhD-Senior-Lecturer[align]">
                Degree-Master-PhD-Senior-Lecturer (align)
              </SelectItem>
              <SelectItem value="Degree-Master-PhD-Professor">
                Degree-Master-PhD-Professor
              </SelectItem>
              <SelectItem value="Professor">Professor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Experience</Label>
          <Select value={experience} onValueChange={setExperience}>
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
          <Select value={publications} onValueChange={setPublications}>
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
          <Select value={feedback} onValueChange={setFeedback}>
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
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="professionalCertificate"
          checked={professionalCertificate}
          onCheckedChange={(checked) =>
            setProfessionalCertificate(checked === true)
          }
        />
        <Label htmlFor="professionalCertificate">
          Professional Certificate
        </Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Update</Button>
      </div>
    </form>
  );
}
