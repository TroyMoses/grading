"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded: userLoaded } = useUser();
  if (!userLoaded) {
    return <p>Loading user data...</p>;
  }

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = user?.publicMetadata?.role === "admin";

  if (!isAdmin) {
    redirect("/lecturer-dashboard");
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r">
        <ScrollArea className="h-full">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Admin Dashboard</h2>
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/admin-dashboard">Dashboard</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/admin-dashboard/lecturers">Manage Lecturers</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/admin-dashboard/lecturers/add">Add Lecturer</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/admin-dashboard/lecturers/view">View Lecturers</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/admin-dashboard/subjects/manage">Manage Subjects</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/admin-dashboard/subjects">Grading Table</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/admin-dashboard/assignments">Subject Assignments</a>
              </Button>
            </nav>
          </div>
        </ScrollArea>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <ScrollArea className="h-full">{children}</ScrollArea>
        <Toaster />
      </main>
    </div>
  )
}