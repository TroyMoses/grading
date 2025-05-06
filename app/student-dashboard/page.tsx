"use client";

import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StudentDashboard() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome, {user?.firstName || "Student"}
        </h2>
        <p className="opacity-90 max-w-3xl">
          Welcome to the Lecturer Grading System. As a student, you can provide
          feedback on your lecturers to help improve the quality of education.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lecturer Evaluation</CardTitle>
            <CardDescription>
              Provide feedback on your lecturers
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start">
            <p className="mb-4 text-muted-foreground">
              Your feedback helps us evaluate lecturers and improve the quality
              of education. All feedback is confidential.
            </p>
            <Button asChild>
              <Link
                href="/student-feedback"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Submit Feedback
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Courses</CardTitle>
            <CardDescription>View your enrolled courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 border rounded-md bg-muted/20">
              <div className="flex flex-col items-center text-center p-4">
                <BookOpen className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  Course information will be available soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
