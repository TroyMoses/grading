"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { Id } from "@/convex/_generated/dataModel";

export default function LecturerPreferences() {
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [preferences, setPreferences] = useState<{
    [key: string]: number | null;
  }>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get user from Convex database
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Get lecturer using the lecturerId from the user record
  const lecturer = useQuery(
    api.lecturers.getLecturerById,
    convexUser?.lecturerId ? { id: convexUser.lecturerId } : "skip"
  );

  // Get subjects with preferences for the selected semester
  const subjectsWithPreferences = useQuery(
    api.lecturerPreferences.getSubjectsWithPreferences,
    selectedSemester && lecturer
      ? {
          lecturerId: lecturer._id as Id<"lecturers">,
          semester: selectedSemester,
        }
      : "skip"
  );

  // Debug query to see all preferences
  const allPreferences = useQuery(
    api.lecturerPreferences.debugGetAllPreferences
  );

  // Mutation to set preferences
  const savePreferences = useMutation(
    api.lecturerPreferences.saveLecturerPreferences
  );

  // Log debug information
  useEffect(() => {
    console.log("Debug info:");
    console.log("User:", user?.id);
    console.log("Convex User:", convexUser);
    console.log("Lecturer:", lecturer);
    console.log("Selected Semester:", selectedSemester);
    console.log("Subjects with preferences:", subjectsWithPreferences);
    console.log("All preferences in DB:", allPreferences);
  }, [
    user,
    convexUser,
    lecturer,
    selectedSemester,
    subjectsWithPreferences,
    allPreferences,
  ]);

  // Initialize preferences when data loads
  useEffect(() => {
    if (subjectsWithPreferences) {
      const initialPreferences: { [key: string]: number | null } = {};
      subjectsWithPreferences.forEach((subject) => {
        initialPreferences[subject._id] = subject.preference;
      });
      setPreferences(initialPreferences);
      setHasChanges(false);
      console.log("Initialized preferences:", initialPreferences);
    }
  }, [subjectsWithPreferences]);

  const handlePreferenceChange = (subjectId: string, preference: string) => {
    const newPreferences = { ...preferences };

    if (preference === "none") {
      newPreferences[subjectId] = null;
    } else {
      newPreferences[subjectId] = Number.parseInt(preference);
    }

    console.log("Preference changed:", {
      subjectId,
      preference,
      newPreferences,
    });

    setPreferences(newPreferences);
    setHasChanges(true);
  };

  const handleSavePreferences = async () => {
    if (!lecturer || !selectedSemester || !subjectsWithPreferences) {
      console.log("Missing required data:", {
        lecturer,
        selectedSemester,
        subjectsWithPreferences,
      });
      return;
    }

    setIsSaving(true);

    try {
      // Prepare preferences data for all subjects in the semester
      const preferencesData = subjectsWithPreferences.map((subject) => ({
        subjectId: subject._id as Id<"subjects">,
        preference: preferences[subject._id] || undefined,
      }));

      console.log("Saving preferences data:", {
        lecturerId: lecturer._id,
        semester: selectedSemester,
        preferences: preferencesData,
      });

      const result = await savePreferences({
        lecturerId: lecturer._id as Id<"lecturers">,
        semester: selectedSemester,
        preferences: preferencesData,
      });

      console.log("Save result:", result);

      if (result.success) {
        toast({
          title: "Success",
          description: "Your preferences have been saved successfully.",
        });
        setHasChanges(false);
      } else {
        throw new Error(result.error || "Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description:
          "Failed to save preferences: " +
          (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getPreferenceColor = (preference: number) => {
    switch (preference) {
      case 1:
        return "bg-green-500";
      case 2:
        return "bg-blue-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-orange-500";
      case 5:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!convexUser?.lecturerId) {
    return (
      <div className="space-y-6">
        <div className="gradient-card rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Subject Preferences</h2>
          <p className="opacity-90">
            Your account has not been associated with a lecturer profile yet.
            Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Subject Preferences</h2>
        <p className="opacity-90">
          Set your preferences for subjects by semester. Use 1 for highest
          preference, 2 for second preference, and so on. These preferences will
          be considered during subject assignment.
        </p>
      </div>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>User ID:</strong> {user?.id}
            </p>
            <p>
              <strong>Convex User:</strong> {convexUser ? "Found" : "Not found"}
            </p>
            <p>
              <strong>Lecturer ID:</strong> {lecturer?._id}
            </p>
            <p>
              <strong>Lecturer Name:</strong> {lecturer?.name}
            </p>
            <p>
              <strong>Total Preferences in DB:</strong>{" "}
              {allPreferences?.length || 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Set Subject Preferences</CardTitle>
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Label htmlFor="semester" className="sr-only">
                Select Semester
              </Label>
              <Select
                onValueChange={(value) => setSelectedSemester(Number(value))}
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasChanges && (
              <Button onClick={handleSavePreferences} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedSemester ? (
            subjectsWithPreferences && subjectsWithPreferences.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Credit Hours</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Current Preference</TableHead>
                    <TableHead>Set Preference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectsWithPreferences.map((subject) => (
                    <TableRow key={subject._id}>
                      <TableCell className="font-medium">
                        {subject.name}
                      </TableCell>
                      <TableCell>{subject.creditHours || 3}</TableCell>
                      <TableCell>{subject.department}</TableCell>
                      <TableCell>
                        {preferences[subject._id] ? (
                          <Badge
                            className={getPreferenceColor(
                              preferences[subject._id]!
                            )}
                          >
                            {preferences[subject._id]}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not set</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={preferences[subject._id]?.toString() || "none"}
                          onValueChange={(value) =>
                            handlePreferenceChange(subject._id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No preference</SelectItem>
                            <SelectItem value="1">1st Choice</SelectItem>
                            <SelectItem value="2">2nd Choice</SelectItem>
                            <SelectItem value="3">3rd Choice</SelectItem>
                            <SelectItem value="4">4th Choice</SelectItem>
                            <SelectItem value="5">5th Choice</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No subjects found for this semester
              </div>
            )
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Please select a semester to view and set preferences
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSemester && subjectsWithPreferences && (
        <Card>
          <CardHeader>
            <CardTitle>Preference Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">1</Badge>
                <span className="text-sm">Highest Preference</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500">2</Badge>
                <span className="text-sm">Second Preference</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500">3</Badge>
                <span className="text-sm">Third Preference</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500">4</Badge>
                <span className="text-sm">Fourth Preference</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500">5</Badge>
                <span className="text-sm">Fifth Preference</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
