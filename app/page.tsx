"use client";

import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { user, isLoaded: userLoaded } = useUser();
  if (!userLoaded) {
    return <p>Loading user data...</p>;
  }

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = user?.publicMetadata?.role === "admin";
  const isLecturer = user?.publicMetadata?.role === "lecturer";

  if (isAdmin) {
    redirect("/admin-dashboard");
  }

  if (isLecturer) {
    redirect("/lecturer-dashboard");
  }
}
