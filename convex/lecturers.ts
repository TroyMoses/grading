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
    const lecturerId = await ctx.db.insert("lecturers", {
      name: args.name, userId: args.userId
    });
    return lecturerId
  },
});

