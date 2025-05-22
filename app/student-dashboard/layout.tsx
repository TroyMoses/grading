"use client";

import type React from "react";

import { UserButton, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/sidebar";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded: userLoaded } = useUser();

  // Get the user from Convex database
  const convexUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const isUserLoading = !userLoaded || (user && convexUser === undefined);

  if (isUserLoading) {
    return <p>Loading user data...</p>;
  }

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user is student from Convex database
  const isStudent = convexUser?.role === "student";
  const isAdmin = convexUser?.role === "admin";

  if (!isStudent && !isAdmin) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role="student" />
      <div className="flex-1 ml-[var(--sidebar-width)]">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Student Dashboard</h1>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <ScrollArea className="h-full">{children}</ScrollArea>
          <Toaster />
        </main>
      </div>
    </div>
  );
}
