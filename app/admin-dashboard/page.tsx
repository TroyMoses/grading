"use client"

import { useQuery } from "convex/react"
import { api } from "../../convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, BookOpen, Award } from "lucide-react"

export default function AdminDashboard() {
  const lecturers = useQuery(api.lecturers.getAllLecturers) || []
  const subjects = useQuery(api.subjects.getAllSubjects) || []

  return (
    <div className="space-y-6">
      <div className="gradient-card rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Lecturer Grading System</h2>
        <p className="opacity-90 max-w-3xl">
          This system helps manage and grade lecturers based on their qualifications, experience, publications,
          feedback, and professional certifications. The system automatically assigns subjects to the most qualified
          lecturers.
        </p>
      </div>

      <h2 className="text-2xl font-semibold">Overview</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lecturers.length}</div>
            <p className="text-xs text-muted-foreground">Registered in the system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
            <p className="text-xs text-muted-foreground">Available for assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Subjects</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Based on grading system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Across all lecturers</p>
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
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">New Lecturer Added</p>
                <p className="text-sm text-muted-foreground">A new lecturer was added to the system</p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">Just now</div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Subject Updated</p>
                <p className="text-sm text-muted-foreground">A subject was updated with new details</p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">2 hours ago</div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Assignments Recalculated</p>
                <p className="text-sm text-muted-foreground">Subject assignments were recalculated</p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">Yesterday</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

