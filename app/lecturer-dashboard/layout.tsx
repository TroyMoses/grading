"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/sidebar";

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
      <Sidebar role="lecturer" />
      <div className="flex-1 ml-[var(--sidebar-width)]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Lecturer Dashboard</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <ScrollArea className="h-full">{children}</ScrollArea>
        </main>
      </div>
    </div>
  );
}
