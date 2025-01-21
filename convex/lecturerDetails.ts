import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getLecturerDetails = query({
  handler: async (ctx) => {
    const lecturerDetails = await ctx.db.query("lecturerDetails").collect();
    const lecturers = await ctx.db.query("lecturers").collect();
    const subjects = await ctx.db.query("subjects").collect();

    // Create maps for faster lookups
    const lecturerMap = new Map(lecturers.map((l) => [l._id, l]));
    const subjectMap = new Map(subjects.map((s) => [s._id, s]));

    // Combine the data
    const combinedDetails = lecturerDetails.map((detail) => ({
      ...detail,
      lecturer: lecturerMap.get(detail.lecturerId),
      subject: subjectMap.get(detail.subjectId),
    }));

    return combinedDetails;
  },
});

export const getLecturerDetailsByLecturerId = query({
  args: { lecturerId: v.id("lecturers") },
  handler: async (ctx, args) => {
    const lecturerDetails = await ctx.db
      .query("lecturerDetails")
      .filter((q) => q.eq(q.field("lecturerId"), args.lecturerId))
      .collect();

    const subjectIds = [...new Set(lecturerDetails.map((d) => d.subjectId))];

    // Fetch all subjects
    const allSubjects = await ctx.db.query("subjects").collect();

    // Filter subjects manually
    const subjects = allSubjects.filter((subject) =>
      subjectIds.includes(subject._id)
    );

    const subjectMap = new Map(subjects.map((s) => [s._id, s]));

    return lecturerDetails.map((detail) => ({
      ...detail,
      subject: subjectMap.get(detail.subjectId),
    }));
  },
});

export const updateLecturerDetails = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    subjectId: v.id("subjects"),
    qualification: v.string(),
    experience: v.string(),
    publications: v.string(),
    feedback: v.string(),
    professionalCertificate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { lecturerId, subjectId, ...details } = args;
    const existingDetails = await ctx.db
      .query("lecturerDetails")
      .filter(
        (q) =>
          q.eq(q.field("lecturerId"), lecturerId) &&
          q.eq(q.field("subjectId"), subjectId)
      )
      .first();

    if (existingDetails) {
      await ctx.db.patch(existingDetails._id, details);
    } else {
      await ctx.db.insert("lecturerDetails", {
        lecturerId,
        subjectId,
        ...details,
      });
    }

    return { success: true };
  },
});

export const getGradingData = query({
  handler: async (ctx) => {
    const lecturers = await ctx.db.query("lecturers").collect();
    const subjects = await ctx.db.query("subjects").collect();
    const lecturerDetails = await ctx.db.query("lecturerDetails").collect();

    const data: { [key: string]: { [key: string]: unknown } } = {};

    lecturerDetails.forEach((detail) => {
      const lecturer = lecturers.find((l) => l._id === detail.lecturerId);
      const subject = subjects.find((s) => s._id === detail.subjectId);
      if (lecturer && subject) {
        if (!data[lecturer.name]) {
          data[lecturer.name] = {};
        }
        data[lecturer.name][subject.name] = {
          qualification: detail.qualification,
          experience: detail.experience,
          publications: detail.publications,
          feedback: detail.feedback,
          professionalCertificate: detail.professionalCertificate,
        };
      }
    });

    return {
      lecturers: lecturers.map((l) => l.name),
      subjects: subjects.map((s) => s.name),
      data,
    };
  },
});

export const getSubjectsByLecturerId = query({
  args: { lecturerId: v.id("lecturers") },
  handler: async (ctx, args) => {
    // First, get all lecturerDetails for this lecturer
    const lecturerDetails = await ctx.db
      .query("lecturerDetails")
      .filter((q) => q.eq(q.field("lecturerId"), args.lecturerId))
      .collect()

    // Extract all unique subjectIds
    const subjectIds = [...new Set(lecturerDetails.map((detail) => detail.subjectId))]

    // Fetch all subjects
    const allSubjects = await ctx.db.query("subjects").collect()

    // Filter subjects to only those associated with this lecturer
    const lecturerSubjects = allSubjects.filter((subject) => subjectIds.includes(subject._id))

    return lecturerSubjects
  },
})