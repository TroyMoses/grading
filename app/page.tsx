"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function Home() {
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

  // Check user roles from Convex database
  const isAdmin = convexUser?.role === "admin";
  const isLecturer = convexUser?.role === "lecturer";
  const isStudent = convexUser?.role === "student";

  if (isAdmin) {
    redirect("/admin-dashboard");
  }

  if (isLecturer) {
    redirect("/lecturer-dashboard");
  }

  if (isStudent) {
    redirect("/student-dashboard");
  }

  // If no role is assigned yet
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Welcome to the Lecturer Grading System
        </h1>
        <p className="mb-4">
          Your account has been created, but a role has not been assigned yet.
        </p>
        <p>Please contact an administrator to assign you a role.</p>
      </div>
    </div>
  );
}
