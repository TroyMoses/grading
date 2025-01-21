"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AddLecturer() {
  const { toast } = useToast();
  const { user } = useUser();
  const [name, setName] = useState("");
  const createLecturer = useMutation(api.lecturers.createLecturer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLecturer({ name, userId: user?.id ?? "" });
      setName("");
      toast({
        title: "Success",
        description: "Lecturer added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add lecturer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Lecturer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Lecturer Name</Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Add Lecturer</Button>
        </form>
      </CardContent>
    </Card>
  );
}
