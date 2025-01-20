import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Save details for a lecturer for a specific subject
export const saveDetails = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    subjectName: v.string(),
    experience: v.string(),
    publications: v.string(),
    feedback: v.string(),
    certificate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { lecturerId, subjectName, experience, publications, feedback, certificate } = args;

    // Fetch the lecturer
    const lecturer = await ctx.db.get(lecturerId);
    if (!lecturer) {
      throw new Error("Lecturer not found");
    }

    // Update or add details for the subject
    const updatedDetails = {
      ...lecturer.details,
      [subjectName]: { experience, publications, feedback, certificate },
    };

    // Patch the lecturer document with updated details
    await ctx.db.patch(lecturerId, { details: updatedDetails });

    return { success: true, message: `Details updated for ${subjectName}` };
  },
});
