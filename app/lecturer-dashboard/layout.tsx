"use client";

import type React from "react";

import { UserButton, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sidebar } from "@/components/sidebar";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function LecturerDashboardLayout({
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

  // Check if user is lecturer from Convex database and has a lecturerId
  const isLecturer = convexUser?.role === "lecturer";
  const hasLecturerId = Boolean(convexUser?.lecturerId);

  if (!isLecturer) {
    redirect("/");
  }

  // If the user is a lecturer but doesn't have an associated lecturerId
  if (isLecturer && !hasLecturerId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md p-6 border rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Account Not Fully Set Up</h1>
          <p className="mb-4">
            Your account has been created and assigned the lecturer role, but it
            hasn{"'"}t been associated with a lecturer profile yet.
          </p>
          <p className="mb-4">
            Please contact an administrator to complete your account setup by
            associating your user account with your lecturer profile.
          </p>
          <div className="mt-6 flex justify-center">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    );
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
