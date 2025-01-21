import { UserButton } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Lecturers</CardTitle>
            <CardDescription>Number of registered lecturers</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">15</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Subjects</CardTitle>
            <CardDescription>Number of available subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">20</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Grade</CardTitle>
            <CardDescription>Overall average grade</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">3.8</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

