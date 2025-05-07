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

// Fetch a specific lecturer by ID
export const getLecturerById = query({
  args: { id: v.id("lecturers") },
  handler: async (ctx, args): Promise<Lecturer | null> => {
    return await ctx.db.get(args.id);
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
    return { _id: lecturerId };
  },
});

// Update lecturer name
export const updateLecturerName = mutation({
  args: {
    id: v.id("lecturers"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, name } = args;

    // Check if a lecturer with the same name already exists
    const existingLecturer = await ctx.db
      .query("lecturers")
      .filter((q) =>
        q.and(q.eq(q.field("name"), name), q.neq(q.field("_id"), id))
      )
      .first();

    if (existingLecturer) {
      return {
        success: false,
        message: "A lecturer with this name already exists",
      };
    }

    // Update the lecturer name
    await ctx.db.patch(id, { name });

    return {
      success: true,
      message: "Lecturer name updated successfully",
    };
  },
});

export const getLecturerByClerkId = query({
  args: { clerkId: v.string() },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handler: async (ctx, args) => {
    // In a real implementation, we would look up the lecturer by the Clerk user ID
    // For now, we'll return the first lecturer as a placeholder
    const lecturers = await ctx.db.query("lecturers").collect();
    return lecturers.length > 0 ? lecturers[0] : null;
  },
});
