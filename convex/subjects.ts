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

export const getSubjectsByYearAndSemester = query({
  args: { year: v.number(), semester: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subjects")
      .filter((q) => q.and(
        q.eq(q.field("year"), args.year),
        q.eq(q.field("semester"), args.semester)
      ))
      .collect();
  },
});

export const assignSubject = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    subjectName: v.string(),
  },
  handler: async (ctx, args) => {
    const lecturer = await ctx.db.get(args.lecturerId);
    if (!lecturer) {
      throw new Error("Lecturer not found");
    }
    // Check if the subject exists in the database
    const subject = await ctx.db.query("subjects").filter((q) => q.eq(q.field("name"), args.subjectName)).first();

    if (!subject) {
      throw new Error("Subject not found");
    }

    // Ensure `assignedSubjects` array exists
    const assignedSubjects = lecturer.assignedSubjects || [];
    
    // Check if the subject is already assigned
    if (assignedSubjects.includes(args.subjectName)) {
      throw new Error("Subject already assigned to this lecturer");
    }
    
     // Add the subject directly to the `assignedSubjects` array
     await ctx.db.patch(args.lecturerId, {
      assignedSubjects: [...assignedSubjects, args.subjectName],
    });
    
    return { success: true, message: `${subject.name} assigned to ${lecturer.name}` };
  },
});

export const unassignSubject = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    subjectName: v.string(),
  },
  handler: async (ctx, args) => {
    const lecturer = await ctx.db.get(args.lecturerId);
    if (!lecturer) {
      throw new Error("Lecturer not found");
    }

    // Ensure `assignedSubjects` array exists
    const assignedSubjects = lecturer.assignedSubjects || [];

    const updatedSubjects = assignedSubjects.filter(
      (subject) => subject !== args.subjectName
    );

    await ctx.db.patch(args.lecturerId, { assignedSubjects: updatedSubjects });

    return { success: true, message: `Subject "${args.subjectName}" unassigned.` };
  },
});


