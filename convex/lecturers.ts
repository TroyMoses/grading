import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Lecturer } from "../lib/types";

// Fetch all lecturers
export const getAllLecturers = query({
  handler: async (ctx) => {
    return await ctx.db.query("lecturers").collect();
  },
});

// Fetch a specific lecturer by userId
export const getLecturer = query({
  args: { userId: v.string() },
  handler: async (ctx, args): Promise<Lecturer | null> => {
    return await ctx.db
      .query("lecturers")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();
  },
});

// Create a new lecturer
export const createLecturer = mutation({
  args: {
    name: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if a lecturer with the same name already exists
    const existingLecturerByName = await ctx.db
      .query("lecturers")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingLecturerByName) {
      return {
        error: "A lecturer with this name already exists",
        _id: existingLecturerByName._id,
      };
    }

    // If no duplicates found, insert the new lecturer
    const lecturerId = await ctx.db.insert("lecturers", {
      name: args.name,
      userId: args.userId,
    });
    return { _id: lecturerId }
  },
});
