import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
  }).index("by_tokenIdentifier", ["tokenIdentifier"]),

  lecturers: defineTable({
    name: v.string(),
    userId: v.string(),
  }),

  lecturerDetails: defineTable({
    lecturerId: v.id("lecturers"),
    subjectId: v.id("subjects"),
    semester: v.number(),
    qualification: v.string(),
    experience: v.string(),
    publications: v.string(),
    feedback: v.string(),
    professionalCertificate: v.boolean(),
  }),

  subjects: defineTable({
    name: v.string(),
    year: v.number(),
    semester: v.number(),
    department: v.string(),
  }),

  feedbacks: defineTable({
    lecturerId: v.id("lecturers"),
    subjectName: v.string(),
    value: v.string(),
  }),

  // New table for student feedback
  studentFeedback: defineTable({
    // Bio data
    date: v.string(),
    school: v.string(),
    department: v.string(),
    semester: v.number(),
    academicYear: v.string(),
    modeOfStudy: v.string(),
    awardType: v.string(),
    yearOfStudy: v.string(),

    // Lecturer and subject
    lecturerId: v.id("lecturers"),
    subjectId: v.id("subjects"),

    // Evaluation scores (10 questions, each out of 10)
    q1: v.number(),
    q2: v.number(),
    q3: v.number(),
    q4: v.number(),
    q5: v.number(),
    q6: v.number(),
    q7: v.number(),
    q8: v.number(),
    q9: v.number(),
    q10: v.number(),

    // Total score
    totalScore: v.number(),

    // Submission timestamp
    createdAt: v.number(),
  }).index("by_lecturer_subject", ["lecturerId", "subjectId"]),
});
