"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function StudentFeedback() {
  // Bio data state
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [school, setSchool] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState<number | null>(null);
  const [academicYear, setAcademicYear] = useState("");
  const [modeOfStudy, setModeOfStudy] = useState("");
  const [awardType, setAwardType] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [lecturerId, setLecturerId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  // Evaluation state
  const [scores, setScores] = useState({
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 5,
    q5: 5,
    q6: 5,
    q7: 5,
    q8: 5,
    q9: 5,
    q10: 5,
  });

  // Form validation
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data
  const departments = useQuery(api.studentFeedback.getDepartments) || [];
  const modesOfStudy = useQuery(api.studentFeedback.getModesOfStudy) || [];
  const awardTypes = useQuery(api.studentFeedback.getAwardTypes) || [];
  const yearsOfStudy = useQuery(api.studentFeedback.getYearsOfStudy) || [];
  const lecturers = useQuery(api.lecturers.getAllLecturers) || [];

  // Get subjects filtered by semester
  const allSubjects = useQuery(api.subjects.getAllSubjects) || [];
  const semesterSubjects = semester
    ? allSubjects.filter((subject: { semester: number }) => subject.semester === semester)
    : [];

  // Reset subject selection when semester changes
  useEffect(() => {
    setSubjectId("");
  }, [semester]);

  // Mutations
  const submitFeedback = useMutation(api.studentFeedback.submitFeedback);
  const { toast } = useToast();

  // Check if lecturer and subject are selected to show evaluation section
  useEffect(() => {
    if (lecturerId && subjectId) {
      setShowEvaluation(true);
    } else {
      setShowEvaluation(false);
    }
  }, [lecturerId, subjectId]);

  // Handle score changes
  const handleScoreChange = (
    question: keyof typeof scores,
    value: number[]
  ) => {
    setScores((prev) => ({
      ...prev,
      [question]: value[0],
    }));
  };

  // Calculate total score
  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );
  const percentageScore = (totalScore / 100) * 100;

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lecturerId || !subjectId) {
      toast({
        title: "Error",
        description: "Please select a lecturer and subject.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await submitFeedback({
        date,
        school,
        department,
        semester: semester || 1,
        academicYear,
        modeOfStudy,
        yearOfStudy,
        awardType,
        lecturerId: lecturerId as Id<"lecturers">,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        subjectId,
        q1: scores.q1,
        q2: scores.q2,
        q3: scores.q3,
        q4: scores.q4,
        q5: scores.q5,
        q6: scores.q6,
        q7: scores.q7,
        q8: scores.q8,
        q9: scores.q9,
        q10: scores.q10,
      });

      toast({
        title: "Success",
        description: "Your feedback has been submitted successfully.",
      });

      // Reset form
      setDate(format(new Date(), "yyyy-MM-dd"));
      setSchool("");
      setDepartment("");
      setSemester(null);
      setAcademicYear("");
      setModeOfStudy("");
      setAwardType("");
      setYearOfStudy("");
      setLecturerId("");
      setSubjectId("");
      setScores({
        q1: 5,
        q2: 5,
        q3: 5,
        q4: 5,
        q5: 5,
        q6: 5,
        q7: 5,
        q8: 5,
        q9: 5,
        q10: 5,
      });
      setShowEvaluation(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="text-2xl">Lecturer Evaluation Form</CardTitle>
            <CardDescription className="text-primary-foreground/90">
              The overall purpose of this evaluation tool is to advance the
              quality of training and learning, and to evaluate the excellence
              of services at Bugema University but not to reprimand. Your name
              is not needed for this evaluation and the information given to us
              is treated with concealment.
            </CardDescription>
          </CardHeader>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Bio Data</CardTitle>
              <CardDescription>
                Please provide your information (your name is not required)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Enter your school"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select onValueChange={setDepartment} required>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    onValueChange={(value) => setSemester(Number(value))}
                    required
                  >
                    <SelectTrigger id="semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">One</SelectItem>
                      <SelectItem value="2">Two</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Input
                    id="academicYear"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g., 2023/2024"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modeOfStudy">Mode of Study</Label>
                  <Select onValueChange={setModeOfStudy} required>
                    <SelectTrigger id="modeOfStudy">
                      <SelectValue placeholder="Select mode of study" />
                    </SelectTrigger>
                    <SelectContent>
                      {modesOfStudy.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awardType">Type of Award</Label>
                  <Select onValueChange={setAwardType} required>
                    <SelectTrigger id="awardType">
                      <SelectValue placeholder="Select award type" />
                    </SelectTrigger>
                    <SelectContent>
                      {awardTypes.map((award) => (
                        <SelectItem key={award} value={award}>
                          {award}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearOfStudy">Year of Study</Label>
                  <Select onValueChange={setYearOfStudy} required>
                    <SelectTrigger id="yearOfStudy">
                      <SelectValue placeholder="Select year of study" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearsOfStudy.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lecturer">Lecturer</Label>
                  <Select onValueChange={setLecturerId} required>
                    <SelectTrigger id="lecturer">
                      <SelectValue placeholder="Select lecturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {lecturers.map(
                        (lecturer: { _id: string; name: string }) => (
                          <SelectItem key={lecturer._id} value={lecturer._id}>
                            {lecturer.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select
                    onValueChange={setSubjectId}
                    value={subjectId}
                    disabled={!semester}
                    required
                  >
                    <SelectTrigger id="subject">
                      <SelectValue
                        placeholder={
                          semester ? "Select subject" : "Select semester first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {semesterSubjects.map(
                        (
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          subject: any
                        ) => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  {!semester && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Please select a semester first
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {showEvaluation && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Evaluation of the Lecturer</CardTitle>
                <CardDescription>
                  Please rate the lecturer on a scale of 0-10 for each question
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-6">
                  {[
                    {
                      id: "q1",
                      question:
                        "Provides course outline at the beginning of the semester",
                    },
                    {
                      id: "q2",
                      question: "Began and ended lecturers on time",
                    },
                    {
                      id: "q3",
                      question:
                        "Presented lecture in a clear and well-organized manner",
                    },
                    {
                      id: "q4",
                      question:
                        "Spoke fluently, with a clear and audible voice",
                    },
                    {
                      id: "q5",
                      question:
                        "Learning aids, when used added to my understanding of lecture material",
                    },
                    {
                      id: "q6",
                      question:
                        "Generally classified new and unfamiliar words and phrases",
                    },
                    {
                      id: "q7",
                      question:
                        "Willingly and honestly responded to questions/opinions of class",
                    },
                    {
                      id: "q8",
                      question:
                        "Well prepared for class, did not give many irrelevant examples",
                    },
                    {
                      id: "q9",
                      question:
                        "Emphasized the need for students to learn certain basic facts",
                    },
                    {
                      id: "q10",
                      question:
                        "In general, the course content was relevant to real-life situations",
                    },
                  ].map((item) => (
                    <div key={item.id} className="space-y-3">
                      <div className="flex justify-between">
                        <Label htmlFor={item.id}>{item.question}</Label>
                        <span className="font-medium">
                          {scores[item.id as keyof typeof scores]}/10
                        </span>
                      </div>
                      <Slider
                        id={item.id}
                        min={0}
                        max={10}
                        step={1}
                        value={[scores[item.id as keyof typeof scores]]}
                        onValueChange={(value: number[]) =>
                          handleScoreChange(
                            item.id as keyof typeof scores,
                            value
                          )
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Total Score</h3>
                      <p className="text-sm text-muted-foreground">
                        Sum of all ratings (out of 100)
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{totalScore}/100</div>
                      <div className="text-sm text-muted-foreground">
                        {percentageScore.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
}
