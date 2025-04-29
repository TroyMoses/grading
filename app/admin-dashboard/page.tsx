"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Award } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

  const lecturers = useQuery(api.lecturers.getAllLecturers) || [];
  const subjects = useQuery(api.subjects.getAllSubjects) || [];
  const recentActivities = useQuery(api.activities.getRecentActivities) || [];

  // Get assignment data based on selected semester
  const assignmentData = useQuery(
    api.lecturerDetails.getAssignmentData,
    selectedSemester ? { semester: selectedSemester as 1 | 2 } : {}
  ) || {
    lecturers: [],
    subjects: [],
    assignments: {},
    lecturerTotalWeights: {},
  };

  // Calculate the number of lecturers with maximum assignments (2)
  const lecturersWithMaxAssignments = selectedSemester
    ? assignmentData.lecturers.filter((lecturer: string) => {
        const assignedSubjects = Object.entries(
          assignmentData.assignments[lecturer] || {}
        ).filter(([, status]) => status === "Assigned").length;
        return assignedSubjects === 2;
      }).length
    : 0;

  // Calculate the total number of assigned subjects
  const totalAssignedSubjects = selectedSemester
    ? assignmentData.lecturers.reduce((total: number, lecturer: string) => {
        const assignedSubjects = Object.entries(
          assignmentData.assignments[lecturer] || {}
        ).filter(([, status]) => status === "Assigned").length;
        return total + assignedSubjects;
      }, 0)
    : 0;

  // Map activity icons to components
  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case "Users":
        return <Users className="h-4 w-4 text-primary" />;
      case "BookOpen":
        return <BookOpen className="h-4 w-4 text-primary" />;
      case "Award":
        return <Award className="h-4 w-4 text-primary" />;
      default:
        return <GraduationCap className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Lecturer Grading System</h2>
        <p className="opacity-90 max-w-3xl">
          This system helps manage and grade lecturers based on their
          qualifications, experience, publications, feedback, and professional
          certifications. The system automatically assigns subjects to the most
          qualified lecturers.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Overview</h2>

        <div className="w-48">
          <Label htmlFor="dashboard-semester" className="sr-only">
            Select Semester
          </Label>
          <Select onValueChange={(value) => setSelectedSemester(Number(value))}>
            <SelectTrigger id="dashboard-semester">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Semester 1</SelectItem>
              <SelectItem value="2">Semester 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Lecturers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturers.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subjects
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">
              Available for assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Lecturers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedSemester ? lecturersWithMaxAssignments : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedSemester
                ? `Lecturers with max assignments in Semester ${selectedSemester}`
                : "Select a semester to view data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Subjects
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedSemester ? totalAssignedSubjects : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedSemester
                ? `Total subjects assigned in Semester ${selectedSemester}`
                : "Select a semester to view data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold mt-8">Recent Activity</h2>
      <Card>
        <CardHeader>
          <CardTitle>System Updates</CardTitle>
          <CardDescription>Recent changes to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    {getActivityIcon(activity.icon)}
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <div className="ml-auto text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No recent activities found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
