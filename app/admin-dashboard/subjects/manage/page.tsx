"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ManageSubjects() {
  const { toast } = useToast();
  const [year, setYear] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [department, setDepartment] = useState("");
  const [subjects, setSubjects] = useState<string[]>([""]);
  const createSubjects = useMutation(api.subjects.createSubjects);
  const allSubjects = useQuery(api.subjects.getAllSubjects) || [];

  const handleSubjectChange = (index: number, value: string) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const addSubjectField = () => {
    setSubjects([...subjects, ""]);
  };

  const removeSubjectField = (index: number) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubjects({
        year,
        semester,
        department,
        subjects: subjects.filter((s) => s.trim() !== ""),
      });
      setYear(1);
      setSemester(1);
      setSubjects([""]);
      setDepartment("");
      toast({
        title: "Success",
        description: "Subjects added successfully.",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subjects.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={year.toString()}
                  onValueChange={(value) => setYear(Number(value))}
                >
                  <SelectTrigger id="year">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={semester.toString()}
                  onValueChange={(value) => setSemester(Number(value))}
                >
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  type="text"
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
            </div>
            {subjects.map((subject, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={subject}
                  onChange={(e) => handleSubjectChange(index, e.target.value)}
                  placeholder={`Subject ${index + 1}`}
                  required
                />
                {index > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeSubjectField(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <div className="flex gap-5">
              <Button type="button" onClick={addSubjectField}>
                Add Another Subject
              </Button>
              <Button type="submit">Add Subjects</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allSubjects.map(
                (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  subject: any
                ) => (
                  <TableRow key={subject._id}>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.year}</TableCell>
                    <TableCell>{subject.semester}</TableCell>
                    <TableCell>{subject.department}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
