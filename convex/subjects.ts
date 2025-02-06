import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSubjects = mutation({
  args: {
    year: v.number(),
    semester: v.number(),
    department: v.string(),
    subjects: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { year, semester, department, subjects } = args;
    const createdSubjects = await Promise.all(
      subjects.map(async (subjectName) => {
        return await ctx.db.insert("subjects", {
          name: subjectName,
          year,
          semester,
          department,
        });
      })
    );
    return createdSubjects;
  },
});

export const getAllSubjects = query({
  handler: async (ctx) => {
    return await ctx.db.query("subjects").collect();
  },
});

export const getSubjectsBySemester = query({
  args: { semester: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subjects")
      .filter((q) => q.and(
        q.eq(q.field("semester"), args.semester)
      ))
      .collect();
  },
});



