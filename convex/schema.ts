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
});
