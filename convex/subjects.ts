import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSubjects = mutation({
  args: {
    year: v.number(),
    semester: v.number(),
    department: v.string(),
    subjects: v.array(
      v.object({
        name: v.string(),
        creditHours: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { year, semester, department, subjects } = args;

    // Get all existing subjects to check against
    const existingSubjects = await ctx.db
      .query("subjects")
      .filter((q) =>
        q.and(
          q.eq(q.field("year"), year),
          q.eq(q.field("semester"), semester),
          q.eq(q.field("department"), department)
        )
      )
      .collect();

    const existingSubjectNames = new Set(
      existingSubjects.map((subject) => subject.name)
    );

    // Filter out subjects that already exist
    const newSubjects = subjects.filter(
      (subject) => !existingSubjectNames.has(subject.name)
    );

    // Return early if all subjects already exist
    if (newSubjects.length === 0) {
      return {
        message: "All subjects already exist",
        createdSubjects: [],
        existingSubjects: subjects
          .map((subject) => {
            const existingSubject = existingSubjects.find(
              (s) => s.name === subject.name
            );
            return existingSubject ? existingSubject._id : null;
          })
          .filter(Boolean),
      };
    }

    // Insert only new subjects
    const createdSubjects = await Promise.all(
      newSubjects.map(async (subject) => {
        return await ctx.db.insert("subjects", {
          name: subject.name,
          creditHours: subject.creditHours,
          year,
          semester,
          department,
        });
      })
    );
    return {
      message:
        newSubjects.length < subjects.length
          ? "Some subjects were already in the database and were skipped"
          : "All subjects added successfully",
      createdSubjects,
      existingSubjects: subjects
        .filter((subject) => existingSubjectNames.has(subject.name))
        .map((subject) => {
          const existingSubject = existingSubjects.find(
            (s) => s.name === subject.name
          );
          return existingSubject ? existingSubject._id : null;
        })
        .filter(Boolean),
    };
  },
});

export const updateSubject = mutation({
  args: {
    id: v.id("subjects"),
    name: v.string(),
    year: v.number(),
    semester: v.number(),
    department: v.string(),
    creditHours: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, name, year, semester, department, creditHours } = args;

    // Check if a subject with the same name already exists (excluding the current subject)
    const existingSubject = await ctx.db
      .query("subjects")
      .filter((q) =>
        q.and(
          q.eq(q.field("name"), name),
          q.eq(q.field("year"), year),
          q.eq(q.field("semester"), semester),
          q.eq(q.field("department"), department),
          q.neq(q.field("_id"), id)
        )
      )
      .first();

    if (existingSubject) {
      return {
        success: false,
        message:
          "A subject with the same name already exists for this year, semester, and department",
      };
    }

    // Update the subject
    await ctx.db.patch(id, {
      name,
      year,
      semester,
      department,
      creditHours,
    });

    return {
      success: true,
      message: "Subject updated successfully",
    };
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
      .filter((q) => q.and(q.eq(q.field("semester"), args.semester)))
      .collect();
  },
});
