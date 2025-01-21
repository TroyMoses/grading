"use client";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { userId } = useAuth();
  console.log("UserId: ", userId);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Lecturer Grading System</h1>
      <SignedIn>
        <Button className="mb-2">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>

        <Button>
          <SignOutButton>Sign Out</SignOutButton>
        </Button>

      </SignedIn>

      <SignedOut>
        <Button>
          <SignInButton>Sign In</SignInButton>
        </Button>
      </SignedOut>
    </main>
  );
}
