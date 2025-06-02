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
      lecturer: detail.lecturerId
        ? lecturerMap.get(detail.lecturerId)
        : undefined,
      subject: subjectMap.get(detail.subjectId),
    }));

    return combinedDetails;
  },
});

export const getLecturerDetailsByLecturerId = query({
  args: { lecturerId: v.optional(v.id("lecturers")) },
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
    semester: v.union(v.literal(1), v.literal(2)),
    qualification: v.string(),
    experience: v.string(),
    publications: v.string(),
    feedback: v.union(
      v.literal("Above 80"),
      v.literal("70-79"),
      v.literal("60-69"),
      v.literal("50-59"),
      v.literal("Below 50")
    ),
    professionalCertificate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { lecturerId, subjectId, semester, ...details } = args;

    // Check if details for this lecturer-subject-semester combination already exist
    const existingDetails = await ctx.db
      .query("lecturerDetails")
      .filter((q) =>
        q.and(
          q.eq(q.field("lecturerId"), lecturerId),
          q.eq(q.field("subjectId"), subjectId),
          q.eq(q.field("semester"), semester)
        )
      )
      .first();

    if (existingDetails) {
      // Update the existing record instead of creating a new one
      await ctx.db.patch(existingDetails._id, {
        qualification: details.qualification,
        experience: details.experience,
        publications: details.publications,
        feedback: details.feedback,
        professionalCertificate: details.professionalCertificate,
      });

      return { success: true, updated: true, _id: existingDetails._id };
    }

    // If no existing record, insert a new one
    const newDetailsId = await ctx.db.insert("lecturerDetails", {
      lecturerId,
      subjectId,
      semester,
      ...details,
    });

    return { success: true, updated: false, _id: newDetailsId };
  },
});

export const getGradingData = query({
  args: {
    semester: v.optional(v.union(v.literal(1), v.literal(2))),
  },
  handler: async (ctx, args) => {
    const lecturers = await ctx.db.query("lecturers").collect();
    const subjects = await ctx.db.query("subjects").collect();
    let lecturerDetails = await ctx.db.query("lecturerDetails").collect();

    // Filter lecturerDetails based on semester if provided
    if (args.semester !== undefined) {
      lecturerDetails = lecturerDetails.filter(
        (detail) => detail.semester === args.semester
      );
    }

    const data: { [key: string]: { [key: string]: unknown } } = {};
    const semesterSubjects = new Set<string>();

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
          semester: detail.semester,
        };
        semesterSubjects.add(subject.name);
      }
    });

    return {
      lecturers: lecturers.map((l) => l.name),
      subjects: Array.from(semesterSubjects),
      data,
    };
  },
});

export const getSubjectsByYearAndSemester = query({
  args: {
    year: v.union(v.literal(1), v.literal(2), v.literal(3)),
    semester: v.union(v.literal(1), v.literal(2)),
  },
  handler: async (ctx, args) => {
    const { year, semester } = args;
    const subjects = await ctx.db
      .query("subjects")
      .filter(
        (q) =>
          q.eq(q.field("year"), year) && q.eq(q.field("semester"), semester)
      )
      .collect();

    return subjects;
  },
});

export const getSubjectsByLecturerId = query({
  args: { lecturerId: v.optional(v.id("lecturers")) },
  handler: async (ctx, args) => {
    // If no lecturerId is provided, return an empty array
    if (!args.lecturerId) {
      return [];
    }

    // First, get all lecturerDetails for this lecturer
    const lecturerDetails = await ctx.db
      .query("lecturerDetails")
      .filter((q) => q.eq(q.field("lecturerId"), args.lecturerId))
      .collect();

    // Extract all unique subjectIds
    const subjectIds = [
      ...new Set(lecturerDetails.map((detail) => detail.subjectId)),
    ];

    // Fetch all subjects
    const allSubjects = await ctx.db.query("subjects").collect();

    // Filter subjects to only those associated with this lecturer
    const lecturerSubjects = allSubjects.filter((subject) =>
      subjectIds.includes(subject._id)
    );

    return lecturerSubjects;
  },
});

// Update the getAssignmentData function with the new assignment logic
export const getAssignmentData = query({
  args: {
    semester: v.optional(v.union(v.literal(1), v.literal(2))),
  },
  handler: async (ctx, args) => {
    const lecturers = await ctx.db.query("lecturers").collect();
    const subjects = await ctx.db.query("subjects").collect();
    let lecturerDetails = await ctx.db.query("lecturerDetails").collect();

    // Filter lecturerDetails based on semester if provided
    if (args.semester !== undefined) {
      lecturerDetails = lecturerDetails.filter(
        (detail) => detail.semester === args.semester
      );
    }

    // Create a data structure to hold weights for each lecturer-subject pair
    const data: { [key: string]: { [key: string]: number } } = {};
    const semesterSubjects = new Set<string>();

    // Map to store credit hours for each subject
    const subjectCreditHours: { [key: string]: number } = {};

    // Map to store preferences for each lecturer-subject pair
    const preferences: { [key: string]: { [key: string]: number | null } } = {};

    // Fetch lecturer preferences for the semester
    let lecturerPreferences = await ctx.db
      .query("lecturerPreferences")
      .collect();
    if (args.semester !== undefined) {
      lecturerPreferences = lecturerPreferences.filter(
        (pref) => pref.semester === args.semester
      );
    }

    // Fill the subject credit hours map
    subjects.forEach((subject) => {
      subjectCreditHours[subject.name] = subject.creditHours || 3; // Default to 3 if not set
    });

    // Initialize preferences map
    lecturers.forEach((lecturer) => {
      preferences[lecturer.name] = {};
    });

    // Fill preferences map
    lecturerPreferences.forEach((pref) => {
      const lecturer = lecturers.find((l) => l._id === pref.lecturerId);
      const subject = subjects.find((s) => s._id === pref.subjectId);
      if (lecturer && subject) {
        preferences[lecturer.name][subject.name] = pref.preference;
      }
    });

    // Calculate weights for each lecturer-subject pair
    lecturerDetails.forEach((detail) => {
      const lecturer = lecturers.find((l) => l._id === detail.lecturerId);
      const subject = subjects.find((s) => s._id === detail.subjectId);
      if (lecturer && subject) {
        if (!data[lecturer.name]) {
          data[lecturer.name] = {};
        }
        const totalWeight = calculateTotalWeight(detail);
        data[lecturer.name][subject.name] = totalWeight;
        semesterSubjects.add(subject.name);

        // Initialize preference if not set
        if (!preferences[lecturer.name][subject.name]) {
          preferences[lecturer.name][subject.name] = null;
        }
      }
    });

    const sortedSubjects = Array.from(semesterSubjects).sort();
    const lecturerNames = lecturers.map((l) => l.name);

    // Calculate total weight for each lecturer across all subjects
    const lecturerTotalWeights: { name: string; totalWeight: number }[] =
      lecturerNames.map((lecturer) => {
        const weights = data[lecturer] || {};
        const totalWeight = Object.values(weights).reduce(
          (sum, weight) => sum + weight,
          0
        );
        return { name: lecturer, totalWeight };
      });

    // Sort lecturers by total weight (highest to lowest)
    const sortedLecturers = lecturerTotalWeights
      .sort((a, b) => b.totalWeight - a.totalWeight)
      .map((l) => l.name);

    // Initialize assignments with "Not Assigned" for all lecturer-subject pairs
    const assignments: { [key: string]: { [key: string]: string } } = {};
    lecturerNames.forEach((lecturer) => {
      assignments[lecturer] = {};
      sortedSubjects.forEach((subject) => {
        assignments[lecturer][subject] = "Not Assigned";
      });
    });

    // Maximum credit hours per lecturer (can be 18 - 21)
    const MAX_CREDIT_HOURS = 21;

    // New assignment logic based on credit hours
    // First, create a priority queue of lecturer-subject pairs based on weights
    const assignmentPairs: {
      lecturer: string;
      subject: string;
      weight: number;
    }[] = [];

    // Build the assignment pairs list
    for (const lecturer of lecturerNames) {
      for (const subject of sortedSubjects) {
        const weight = data[lecturer]?.[subject] || 0;
        if (weight > 0) {
          assignmentPairs.push({ lecturer, subject, weight });
        }
      }
    }

    // Sort the pairs by weight (highest first)
    assignmentPairs.sort((a, b) => b.weight - a.weight);

    const assignedSubjects = new Set<string>();

    // Track assigned credit hours for each lecturer
    const assignedCreditHours: { [key: string]: number } = {};
    lecturerNames.forEach((lecturer) => {
      assignedCreditHours[lecturer] = 0;
    });

    // Process the pairs in order of weight
    for (const { lecturer, subject } of assignmentPairs) {
      // Skip if subject is already assigned
      if (assignedSubjects.has(subject)) continue;

      // Get credit hours for this subject
      const subjectCredits = subjectCreditHours[subject] || 3;

      // Skip if adding this subject would exceed the maximum credit hours
      if (assignedCreditHours[lecturer] + subjectCredits > MAX_CREDIT_HOURS)
        continue;

      // Assign the subject to this lecturer
      assignments[lecturer][subject] = "Assigned";
      assignedCreditHours[lecturer] += subjectCredits;
      assignedSubjects.add(subject);
    }

    // If there are still unassigned subjects, try to assign them to lecturers
    // who haven't reached their maximum credit hours
    for (const subject of sortedSubjects) {
      // Skip if the subject is already assigned
      if (assignedSubjects.has(subject)) continue;

      // Get the subject's credit hours
      const subjectCredits = subjectCreditHours[subject] || 3;

      // Find the lecturer with the highest weight who hasn't reached max credit hours
      let bestLecturer = null;
      let bestWeight = -1;

      // Check all lecturers
      for (const lecturer of lecturerNames) {
        // Skip if adding this subject would exceed the maximum credit hours
        if (assignedCreditHours[lecturer] + subjectCredits > MAX_CREDIT_HOURS)
          continue;

        const weight = data[lecturer]?.[subject] || 0;
        if (weight > bestWeight) {
          bestWeight = weight;
          bestLecturer = lecturer;
        }
      }

      // Assign the subject if we found an eligible lecturer
      if (bestLecturer) {
        assignments[bestLecturer][subject] = "Assigned";
        assignedCreditHours[bestLecturer] += subjectCredits;
        assignedSubjects.add(subject);
      }
    }

    // Return the sorted lecturers to maintain the order in the UI
    return {
      lecturers: sortedLecturers,
      subjects: sortedSubjects,
      assignments,
      lecturerTotalWeights: Object.fromEntries(
        lecturerTotalWeights.map(({ name, totalWeight }) => [name, totalWeight])
      ),
      assignedCreditHours, // Include the credit hours information
    };
  },
});

// A helper function to calculate total weight
function calculateTotalWeight(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detail: any
): number {
  let totalWeight = 0;
  totalWeight += calculateWeight("feedback", detail.feedback);
  totalWeight += calculateWeight("qualification", detail.qualification);
  totalWeight += calculateWeight("publications", detail.publications);
  totalWeight += calculateWeight("experience", detail.experience);
  totalWeight += calculateWeight(
    "professionalCertificate",
    detail.professionalCertificate
  );
  return totalWeight;
}

// Include the calculateWeight function here as well
function calculateWeight(
  criteria: string,
  value: string | number | boolean | undefined
): number {
  if (value === undefined) return 0;

  // Normalizing the value for consistent mapping
  const normalizedValue = value.toString().trim();

  const weights = {
    feedback: 2,
    qualification: 3,
    publications: 3,
    experience: 2,
    professionalCertificate: 1,
  };

  const scales: { [key: string]: { [key: string]: number } } = {
    feedback: {
      "Above 80": 5,
      "70-79": 4,
      "60-69": 3,
      "50-59": 2,
      "Below 50": 1,
    },
    qualification: {
      "Degree[align]": 1,
      "Degree[not align]": 0,
      "Degree-Master[align]": 2,
      "Degree-Master[not align]": 1,
      "Degree-Master-PhD[align]": 3,
      "Degree-Master-PhD[not align]": 2,
      "Degree-Master-PhD-Senior-Lecturer[align]": 4,
      "Degree-Master-PhD-Professor": 5,
      Professor: 6,
    },
    publications: { None: 0, "1-2": 1, "3-4": 2, "5-6": 3, "7-8": 4, "9+": 5 },
    experience: { "0": 1, "1-3": 2, "4-6": 3, "7-9": 4, "10+": 5 },
    professionalCertificate: { true: 1, false: 0 },
  };

  const weight = weights[criteria as keyof typeof weights] || 0;
  const scale = scales[criteria]?.[normalizedValue] || 0;

  return weight * scale;
}
