"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function LecturerDashboardLayout({
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

  const isLecturer = user?.publicMetadata?.role === "lecturer";

  if (!isLecturer) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r">
        <ScrollArea className="h-full">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Lecturer Dashboard</h2>
            <nav className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/lecturer-dashboard">Dashboard</a>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <a href="/lecturer-dashboard/subjects">My Subjects</a>
              </Button>
            </nav>
          </div>
        </ScrollArea>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <ScrollArea className="h-full">{children}</ScrollArea>
      </main>
    </div>
  );
}
