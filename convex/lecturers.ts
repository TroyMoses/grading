import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Fetch all lecturers
export const getAllLecturers = query({
  handler: async (ctx) => {
    return await ctx.db.query("lecturers").collect();
  },
});

// Fetch a specific lecturer by userId
export const getLecturer = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
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
    qualification: v.string(),
    experience: v.string(),
    publications: v.string(),
    feedback: v.optional(v.string()), // New field for feedback
    certificate: v.optional(v.boolean()), // New field for professional certificate
    subjects: v.array(v.string()),
    assignedSubjects: v.optional(v.array(v.string())),
    averageWeight: v.optional(v.number()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const averageWeight = calculateAverageWeight(
      args.qualification,
      args.experience,
      args.publications,
      args.feedback,
      args.certificate
    );
    return await ctx.db.insert("lecturers", { ...args, averageWeight });
  },
});

// Update an existing lecturer
export const updateLecturer = mutation({
  args: {
    _id: v.id("lecturers"),
    name: v.string(),
    qualification: v.string(),
    experience: v.string(),
    publications: v.string(),
    feedback: v.optional(v.string()),
    certificate: v.optional(v.boolean()),
    subjects: v.array(v.string()),
    assignedSubjects: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const averageWeight = calculateAverageWeight(
      args.qualification,
      args.experience,
      args.publications,
      args.feedback,
      args.certificate
    );
    return await ctx.db.patch(args._id, { ...args, averageWeight });
  },
});

// Helper function to calculate average weight
function calculateAverageWeight(
  qualification: string,
  experience: string,
  publications: string,
  feedback: string | undefined,
  certificate: boolean | undefined
): number {
  // Qualification weights
  const qualificationWeights = {
    "Degree": 1,
    "Degree-Master[not align]": 2,
    "Degree-Master[align]": 3,
    "Degree-Master-PhD[not align]": 4,
    "Degree-Master-PhD[align]": 5,
    "Professor": 6,
  };

  // Experience weights
  const experienceWeights = {
    "0": 1,
    "1-3": 2,
    "4-6": 3,
    "7-9": 4,
    "10+": 5,
  };

  // Publications weights
  const publicationWeights = {
    "None": 0,
    "1 to 2 papers": 1,
    "3 to 4 papers": 2,
    "5 to 6 papers": 3,
    "7 to 8 papers": 4,
    "9 and above": 5,
  };

  // Feedback weights
  const feedbackWeights = {
    "Excellent": 5,
    "Very Good": 4,
    "Good": 3,
    "Fair": 2,
    "Poor": 1,
  };

  // Calculate weights
  const qualificationWeight = qualificationWeights[qualification as keyof typeof qualificationWeights] || 0;
  const experienceWeight = experienceWeights[experience as keyof typeof experienceWeights] || 0;
  const publicationWeight = publicationWeights[publications as keyof typeof publicationWeights] || 0;
  const feedbackWeight = feedbackWeights[feedback as keyof typeof feedbackWeights] || 0;
  const certificateWeight = certificate ? 1 : 0;

  // Apply factors to calculate total weight
  const totalWeight =
    feedbackWeight * 2 +
    qualificationWeight * 3 +
    publicationWeight * 3 +
    experienceWeight * 2 +
    certificateWeight * 1;

  // Return the average weight
  return totalWeight / 10; // Divide by the total factor sum (2 + 3 + 3 + 2 + 1)
}
