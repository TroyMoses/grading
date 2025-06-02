import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Debug function to check if preferences exist
export const debugGetAllPreferences = query({
  args: {},
  handler: async (ctx) => {
    const preferences = await ctx.db.query("lecturerPreferences").collect();
    console.log("All preferences in database:", preferences);
    return preferences;
  },
});

// Get all subjects for a semester with lecturer's preferences
export const getSubjectsWithPreferences = query({
  args: {
    lecturerId: v.id("lecturers"),
    semester: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("Getting subjects with preferences for:", args);

    // Get all subjects for the semester
    const subjects = await ctx.db
      .query("subjects")
      .filter((q) => q.eq(q.field("semester"), args.semester))
      .collect();

    console.log("Found subjects:", subjects.length);

    // Get lecturer's preferences
    const preferences = await ctx.db
      .query("lecturerPreferences")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", args.lecturerId))
      .filter((q) => q.eq(q.field("semester"), args.semester))
      .collect();

    console.log("Found preferences:", preferences);

    // Create a map of subject preferences
    const preferenceMap = new Map(
      preferences.map((p) => [p.subjectId, p.preference])
    );

    // Combine subjects with preferences
    const result = subjects.map((subject) => ({
      ...subject,
      preference: preferenceMap.get(subject._id) || null,
    }));

    console.log("Final result:", result);
    return result;
  },
});

export const savePreference = internalMutation({
  args: {
    lecturerId: v.id("lecturers"),
    subjectId: v.id("subjects"),
    preference: v.optional(v.number()),
    semester: v.number(),
  },
  handler: async (ctx, args) => {
    console.log("Saving preference:", args);

    try {
      // Check if preference already exists
      const existingPreference = await ctx.db
        .query("lecturerPreferences")
        .withIndex("by_lecturer_subject", (q) =>
          q.eq("lecturerId", args.lecturerId).eq("subjectId", args.subjectId)
        )
        .first();

      console.log("Existing preference:", existingPreference);

      if (args.preference === undefined || args.preference === null) {
        // Remove preference if it exists
        if (existingPreference) {
          await ctx.db.delete(existingPreference._id);
          console.log("Deleted preference");
          return { success: true, action: "removed" };
        }
        return { success: true, action: "no_change" };
      }

      if (existingPreference) {
        // Update existing preference
        const result = await ctx.db.patch(existingPreference._id, {
          preference: args.preference,
          semester: args.semester,
        });
        console.log("Updated preference:", result);
        return { success: true, action: "updated" };
      } else {
        // Create new preference
        const result = await ctx.db.insert("lecturerPreferences", {
          lecturerId: args.lecturerId,
          subjectId: args.subjectId,
          preference: args.preference,
          semester: args.semester,
        });
        console.log("Created new preference:", result);
        return { success: true, action: "created", id: result };
      }
    } catch (error) {
      console.error("Error saving preference:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

// Batch save all preferences for a lecturer in a semester
import type { MutationCtx } from "./_generated/server";

import type { Id } from "./_generated/dataModel";

const saveLecturerPreferencesHandler = async (
  ctx: MutationCtx,
  args: {
    lecturerId: Id<"lecturers">;
    semester: number;
    preferences: Array<{
      subjectId: Id<"subjects">;
      preference?: number;
    }>;
  }
): Promise<{
  success: boolean;
  results?: {
    success: boolean;
    action?: string;
    id?: string;
    error?: string;
  }[];
  error?: string;
}> => {
  console.log("Batch saving preferences:", args);

  try {
    const results = [];
    for (const pref of args.preferences) {
      const result = await ctx.runMutation(
        internal.lecturerPreferences.savePreference,
        {
          lecturerId: args.lecturerId,
          subjectId: pref.subjectId,
          preference: pref.preference,
          semester: args.semester,
        }
      );
      results.push(result);
    }

    console.log("Batch save results:", results);
    return { success: true, results };
  } catch (error) {
    console.error("Error in batch save:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export const saveLecturerPreferences = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    semester: v.number(),
    preferences: v.array(
      v.object({
        subjectId: v.id("subjects"),
        preference: v.optional(v.number()),
      })
    ),
  },
  handler: saveLecturerPreferencesHandler,
});

// Get all preferences for a lecturer
export const getLecturerPreferences = query({
  args: {
    lecturerId: v.id("lecturers"),
    semester: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let preferences = await ctx.db
      .query("lecturerPreferences")
      .withIndex("by_lecturer", (q) => q.eq("lecturerId", args.lecturerId))
      .collect();

    // Filter by semester if provided
    if (args.semester !== undefined) {
      preferences = preferences.filter((p) => p.semester === args.semester);
    }

    // Get all subjects to include subject details
    const subjects = await ctx.db.query("subjects").collect();
    const subjectMap = new Map(subjects.map((s) => [s._id, s]));

    return preferences.map((pref) => ({
      ...pref,
      subject: subjectMap.get(pref.subjectId),
    }));
  },
});

// Get preference for a specific lecturer-subject pair
export const getLecturerSubjectPreference = query({
  args: {
    lecturerId: v.id("lecturers"),
    subjectId: v.id("subjects"),
  },
  handler: async (ctx, args) => {
    const preference = await ctx.db
      .query("lecturerPreferences")
      .withIndex("by_lecturer_subject", (q) =>
        q.eq("lecturerId", args.lecturerId).eq("subjectId", args.subjectId)
      )
      .first();

    return preference?.preference || null;
  },
});
