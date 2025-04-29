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
import { SearchInput } from "@/components/search-input";
import { Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Id } from "@/convex/_generated/dataModel";

export default function ManageSubjects() {
  const { toast } = useToast();
  const [year, setYear] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [department, setDepartment] = useState("");
  const [subjects, setSubjects] = useState<string[]>([""]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const createSubjects = useMutation(api.subjects.createSubjects);
  const updateSubject = useMutation(api.subjects.updateSubject);
  const allSubjects = useQuery(api.subjects.getAllSubjects) || [];

  // Filter subjects based on search query
  const filteredSubjects = allSubjects.filter((subject: Subject) => {
    return (
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

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
      const result = await createSubjects({
        year,
        semester,
        department,
        subjects: subjects.filter((s) => s.trim() !== ""),
      });
      // Handle the response
      if (result.createdSubjects && result.createdSubjects.length > 0) {
        toast({
          title: "Success",
          description: result.message || "Subjects added successfully.",
        });
      } else {
        toast({
          title: "Information",
          description: result.message || "No new subjects were added.",
          variant: "default",
        });
      }

      // Reset form
      setYear(1);
      setSemester(1);
      setSubjects([""]);
      setDepartment("");

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subjects.",
        variant: "destructive",
      });
    }
  };

  interface Subject {
    _id: Id<"subjects">;
    name: string;
    year: number;
    semester: number;
    department: string;
  }

  const handleEditClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSubject({
        id: selectedSubject?._id as Id<"subjects">,
        name: selectedSubject?.name as string,
        year: selectedSubject?.year as number,
        semester: selectedSubject?.semester as number,
        department: selectedSubject?.department as string,
      });

      toast({
        title: "Success",
        description: "Subject updated successfully.",
      });
      setIsEditDialogOpen(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subject.",
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Existing Subjects</CardTitle>
          <div className="w-72">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search subjects..."
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject Name</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.map((subject: Subject) => (
                <TableRow key={subject._id}>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.year}</TableCell>
                  <TableCell>{subject.semester}</TableCell>
                  <TableCell>{subject.department}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(subject)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          {selectedSubject && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Subject Name</Label>
                <Input
                  id="edit-name"
                  value={selectedSubject.name}
                  onChange={(e) =>
                    setSelectedSubject({
                      ...selectedSubject,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Select
                    value={selectedSubject.year.toString()}
                    onValueChange={(value) =>
                      setSelectedSubject({
                        ...selectedSubject,
                        year: Number(value),
                      })
                    }
                  >
                    <SelectTrigger id="edit-year">
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
                  <Label htmlFor="edit-semester">Semester</Label>
                  <Select
                    value={selectedSubject.semester.toString()}
                    onValueChange={(value) =>
                      setSelectedSubject({
                        ...selectedSubject,
                        semester: Number(value),
                      })
                    }
                  >
                    <SelectTrigger id="edit-semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Input
                    id="edit-department"
                    value={selectedSubject.department}
                    onChange={(e) =>
                      setSelectedSubject({
                        ...selectedSubject,
                        department: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
