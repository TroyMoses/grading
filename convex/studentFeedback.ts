import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Submit student feedback
export const submitFeedback = mutation({
  args: {
    // Bio data
    date: v.string(),
    school: v.string(),
    department: v.string(),
    semester: v.number(),
    academicYear: v.string(),
    modeOfStudy: v.string(),
    awardType: v.string(),
    yearOfStudy: v.string(),

    // Lecturer and subject
    lecturerId: v.id("lecturers"),
    subjectId: v.id("subjects"),

    // Evaluation scores
    q1: v.number(),
    q2: v.number(),
    q3: v.number(),
    q4: v.number(),
    q5: v.number(),
    q6: v.number(),
    q7: v.number(),
    q8: v.number(),
    q9: v.number(),
    q10: v.number(),
  },
  handler: async (ctx, args) => {
    const {
      date,
      school,
      department,
      semester,
      academicYear,
      modeOfStudy,
      awardType,
      yearOfStudy,
      lecturerId,
      subjectId,
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      q7,
      q8,
      q9,
      q10,
    } = args;

    // Calculate total score
    const totalScore = q1 + q2 + q3 + q4 + q5 + q6 + q7 + q8 + q9 + q10;

    // Insert feedback into database
    const feedbackId = await ctx.db.insert("studentFeedback", {
      date,
      school,
      department,
      semester,
      academicYear,
      modeOfStudy,
      awardType,
      yearOfStudy,
      lecturerId,
      subjectId,
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      q7,
      q8,
      q9,
      q10,
      totalScore,
      createdAt: Date.now(),
    });

    // Calculate average feedback for this lecturer-subject pair
    await updateLecturerFeedback(ctx, lecturerId, subjectId);

    return { success: true, feedbackId };
  },
});

// Helper function to update lecturer feedback based on student evaluations
async function updateLecturerFeedback(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  lecturerId: string,
  subjectId: string
) {
  // Get all feedback for this lecturer-subject pair
  interface Feedback {
    _id: string;
    lecturerId: string;
    subjectId: string;
    totalScore: number;
  }

  const feedbacks: Feedback[] = await ctx.db
    .query("studentFeedback")
    .withIndex(
      "by_lecturer_subject",
      (q: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq: (field: string, value: string) => any;
      }) => q.eq("lecturerId", lecturerId).eq("subjectId", subjectId)
    )
    .collect();

  if (feedbacks.length === 0) return;

  // Calculate average score
  const totalScores = feedbacks.map(
    (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      f: any
    ) => f.totalScore
  );
  const averageScore =
    totalScores.reduce((sum: number, score: number) => sum + score, 0) /
    totalScores.length;

  // Convert to percentage (assuming each question is out of 10, total is out of 100)
  const percentageScore = (averageScore / 100) * 100;

  // Map to feedback range
  let feedbackRange = "";
  if (percentageScore >= 80) {
    feedbackRange = "Above 80";
  } else if (percentageScore >= 70) {
    feedbackRange = "70-79";
  } else if (percentageScore >= 60) {
    feedbackRange = "60-69";
  } else if (percentageScore >= 50) {
    feedbackRange = "50-59";
  } else {
    feedbackRange = "Below 50";
  }

  // Find existing lecturer details
  interface LecturerDetails {
    _id: string;
    lecturerId: string;
    subjectId: string;
    feedback?: string;
  }

  const lecturerDetails: LecturerDetails | null = await ctx.db
    .query("lecturerDetails")
    .filter(
      (q: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        and: (...conditions: any[]) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq: (field: any, value: any) => any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        field: (name: string) => any;
      }) =>
        q.and(
          q.eq(q.field("lecturerId"), lecturerId),
          q.eq(q.field("subjectId"), subjectId)
        )
    )
    .first();

  if (lecturerDetails) {
    // Update existing lecturer details with new feedback
    await ctx.db.patch(lecturerDetails._id, {
      feedback: feedbackRange,
    });
  }
}

// Get feedback statistics for a lecturer-subject pair
export const getFeedbackStats = query({
  args: {
    lecturerId: v.optional(v.id("lecturers")),
    subjectId: v.optional(v.id("subjects")),
  },
  handler: async (ctx, args) => {
    const { lecturerId, subjectId } = args;

    // If either ID is missing, return default values
    if (!lecturerId || !subjectId) {
      return {
        count: 0,
        averageScore: 0,
        percentageScore: 0,
        feedbackRange: "No feedback yet",
      };
    }

    // Get all feedback for this lecturer-subject pair
    const feedbacks = await ctx.db
      .query("studentFeedback")
      .withIndex("by_lecturer_subject", (q) =>
        q.eq("lecturerId", lecturerId).eq("subjectId", subjectId)
      )
      .collect();

    if (feedbacks.length === 0) {
      return {
        count: 0,
        averageScore: 0,
        percentageScore: 0,
        feedbackRange: "No feedback yet",
      };
    }

    // Calculate average score
    const totalScores = feedbacks.map((f) => f.totalScore);
    const averageScore =
      totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length;

    // Convert to percentage
    const percentageScore = (averageScore / 100) * 100;

    // Map to feedback range
    let feedbackRange = "";
    if (percentageScore >= 80) {
      feedbackRange = "Above 80";
    } else if (percentageScore >= 70) {
      feedbackRange = "70-79";
    } else if (percentageScore >= 60) {
      feedbackRange = "60-69";
    } else if (percentageScore >= 50) {
      feedbackRange = "50-59";
    } else {
      feedbackRange = "Below 50";
    }

    return {
      count: feedbacks.length,
      averageScore,
      percentageScore,
      feedbackRange,
    };
  },
});

// Get all departments
export const getDepartments = query({
  handler: async () => {
    return ["Physical Sciences", "Computing and Informatics"];
  },
});

// Get all modes of study
export const getModesOfStudy = query({
  handler: async () => {
    return ["Full-time", "Day", "Evening", "In-Service", "Online"];
  },
});

// Get all award types
export const getAwardTypes = query({
  handler: async () => {
    return [
      "Masters",
      "PG Diploma",
      "Bachelors",
      "Diploma",
      "Certificate",
      "HEC Certificate",
    ];
  },
});

// Get all years of study
export const getYearsOfStudy = query({
  handler: async () => {
    return ["Fourth", "Third", "Second", "First"];
  },
});
