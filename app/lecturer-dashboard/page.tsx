"use client"

import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useAuth } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, GraduationCap, Award } from "lucide-react"

export default function LecturerDashboard() {
  const { userId } = useAuth()
  const lecturer = useQuery(api.lecturers.getLecturerByClerkId, { clerkId: userId }) || {}
  const subjects = useQuery(api.lecturerDetails.getSubjectsByLecturerId, { lecturerId: lecturer._id }) || []

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome, {lecturer.name || "Lecturer"}</h2>
        <p className="opacity-90 max-w-3xl">
          View your assigned subjects and details. Your performance is evaluated based on qualifications, experience,
          publications, feedback, and professional certifications.
        </p>
      </div>

      <h2 className="text-2xl font-semibold">Overview</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Across all subjects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Based on performance</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-semibold mt-8">My Subjects</h2>
      {subjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject: any) => (
            <Card key={subject._id}>
              <CardHeader>
                <CardTitle>{subject.name}</CardTitle>
                <CardDescription>Code: {subject.code}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Year:</span>
                    <span className="text-sm font-medium">{subject.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Semester:</span>
                    <span className="text-sm font-medium">{subject.semester}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">No subjects assigned yet.</CardContent>
        </Card>
      )}
    </div>
  )
}

