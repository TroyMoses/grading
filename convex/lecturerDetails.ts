import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getLecturerDetails = query({
  handler: async (ctx) => {
    const lecturerDetails = await ctx.db.query("lecturerDetails").collect()
    const lecturers = await ctx.db.query("lecturers").collect()
    const subjects = await ctx.db.query("subjects").collect()

    // Create maps for faster lookups
    const lecturerMap = new Map(lecturers.map((l) => [l._id, l]))
    const subjectMap = new Map(subjects.map((s) => [s._id, s]))

    // Combine the data
    const combinedDetails = lecturerDetails.map((detail) => ({
      ...detail,
      lecturer: lecturerMap.get(detail.lecturerId),
      subject: subjectMap.get(detail.subjectId),
    }))

    return combinedDetails
  },
})

export const getLecturerDetailsByLecturerId = query({
  args: { lecturerId: v.id("lecturers") },
  handler: async (ctx, args) => {
    const lecturerDetails = await ctx.db
      .query("lecturerDetails")
      .filter((q) => q.eq(q.field("lecturerId"), args.lecturerId))
      .collect()

    const subjectIds = [...new Set(lecturerDetails.map((d) => d.subjectId))]

    // Fetch all subjects
    const allSubjects = await ctx.db.query("subjects").collect()

    // Filter subjects manually
    const subjects = allSubjects.filter((subject) => subjectIds.includes(subject._id))

    const subjectMap = new Map(subjects.map((s) => [s._id, s]))

    return lecturerDetails.map((detail) => ({
      ...detail,
      subject: subjectMap.get(detail.subjectId),
    }))
  },
})

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
      v.literal("Below 50"),
    ),
    professionalCertificate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { lecturerId, subjectId, semester, ...details } = args

    // Instead of updating, always insert a new entry
    await ctx.db.insert("lecturerDetails", {
      lecturerId,
      subjectId,
      semester,
      ...details,
    })

    return { success: true }
  },
})

export const getGradingData = query({
  args: {
    semester: v.optional(v.union(v.literal(1), v.literal(2))),
  },
  handler: async (ctx, args) => {
    const lecturers = await ctx.db.query("lecturers").collect()
    const subjects = await ctx.db.query("subjects").collect()
    let lecturerDetails = await ctx.db.query("lecturerDetails").collect()

    // Filter lecturerDetails based on semester if provided
    if (args.semester !== undefined) {
      lecturerDetails = lecturerDetails.filter((detail) => detail.semester === args.semester)
    }

    const data: { [key: string]: { [key: string]: unknown } } = {}
    const semesterSubjects = new Set<string>()

    lecturerDetails.forEach((detail) => {
      const lecturer = lecturers.find((l) => l._id === detail.lecturerId)
      const subject = subjects.find((s) => s._id === detail.subjectId)
      if (lecturer && subject) {
        if (!data[lecturer.name]) {
          data[lecturer.name] = {}
        }
        data[lecturer.name][subject.name] = {
          qualification: detail.qualification,
          experience: detail.experience,
          publications: detail.publications,
          feedback: detail.feedback,
          professionalCertificate: detail.professionalCertificate,
          semester: detail.semester,
        }
        semesterSubjects.add(subject.name)
      }
    })

    return {
      lecturers: lecturers.map((l) => l.name),
      subjects: Array.from(semesterSubjects),
      data,
    }
  },
})

export const getSubjectsByYearAndSemester = query({
  args: {
    year: v.union(v.literal(1), v.literal(2), v.literal(3)),
    semester: v.union(v.literal(1), v.literal(2)),
  },
  handler: async (ctx, args) => {
    const { year, semester } = args
    const subjects = await ctx.db
      .query("subjects")
      .filter((q) => q.eq(q.field("year"), year) && q.eq(q.field("semester"), semester))
      .collect()

    return subjects
  },
})

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

// Update the getAssignmentData function with the new assignment logic
export const getAssignmentData = query({
  args: {
    semester: v.optional(v.union(v.literal(1), v.literal(2))),
  },
  handler: async (ctx, args) => {
    const lecturers = await ctx.db.query("lecturers").collect()
    const subjects = await ctx.db.query("subjects").collect()
    let lecturerDetails = await ctx.db.query("lecturerDetails").collect()

    // Filter lecturerDetails based on semester if provided
    if (args.semester !== undefined) {
      lecturerDetails = lecturerDetails.filter((detail) => detail.semester === args.semester)
    }

    // Create a data structure to hold weights for each lecturer-subject pair
    const data: { [key: string]: { [key: string]: number } } = {}
    const semesterSubjects = new Set<string>()

    // Calculate weights for each lecturer-subject pair
    lecturerDetails.forEach((detail) => {
      const lecturer = lecturers.find((l) => l._id === detail.lecturerId)
      const subject = subjects.find((s) => s._id === detail.subjectId)
      if (lecturer && subject) {
        if (!data[lecturer.name]) {
          data[lecturer.name] = {}
        }
        const totalWeight = calculateTotalWeight(detail)
        data[lecturer.name][subject.name] = totalWeight
        semesterSubjects.add(subject.name)
      }
    })

    const sortedSubjects = Array.from(semesterSubjects).sort()
    const lecturerNames = lecturers.map((l) => l.name)

    // Calculate total weight for each lecturer across all subjects
    const lecturerTotalWeights: { name: string; totalWeight: number }[] = lecturerNames.map((lecturer) => {
      const weights = data[lecturer] || {}
      const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
      return { name: lecturer, totalWeight }
    })

    // Sort lecturers by total weight (highest to lowest)
    const sortedLecturers = lecturerTotalWeights.sort((a, b) => b.totalWeight - a.totalWeight).map((l) => l.name)

    // Initialize assignments with "Not Assigned" for all lecturer-subject pairs
    const assignments: { [key: string]: { [key: string]: string } } = {}
    lecturerNames.forEach((lecturer) => {
      assignments[lecturer] = {}
      sortedSubjects.forEach((subject) => {
        assignments[lecturer][subject] = "Not Assigned"
      })
    })

    const maxAssignments = 2
    const assignedCounts: { [key: string]: number } = {}
    lecturerNames.forEach((lecturer) => {
      assignedCounts[lecturer] = 0
    })

    // Keep track of which subjects have been assigned
    const assignedSubjects = new Set<string>()

    // New assignment logic
    // Process each lecturer in order of total weight
    for (const lecturer of sortedLecturers) {
      // Skip if lecturer already has maximum assignments
      if (assignedCounts[lecturer] >= maxAssignments) continue

      // Get all subjects with weights for this lecturer
      const lecturerSubjects = Object.entries(data[lecturer] || {})
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, weight]) => weight > 0) // Only consider subjects with positive weights
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .sort(([, weightA], [, weightB]) => weightB - weightA) // Sort by weight descending

      // Try to assign subjects to this lecturer, starting with their highest weighted subject
      for (const [subject, weight] of lecturerSubjects) {
        // Skip if lecturer already has maximum assignments
        if (assignedCounts[lecturer] >= maxAssignments) break

        // Skip if subject is already assigned to someone else
        if (assignedSubjects.has(subject)) continue

        // Check if this lecturer has the highest weight for this subject
        let hasHighestWeight = true
        let isTied = false
        const tiedLecturers: string[] = []

        for (const otherLecturer of lecturerNames) {
          if (otherLecturer === lecturer) continue // Skip comparing with self

          const otherWeight = data[otherLecturer]?.[subject] || 0

          if (otherWeight > weight) {
            hasHighestWeight = false
            break
          } else if (otherWeight === weight && weight > 0) {
            isTied = true
            tiedLecturers.push(otherLecturer)
          }
        }

        // If there's a tie, the lecturer with the higher total weight gets priority
        // Since we've already sorted lecturers by total weight, this lecturer has priority
        // over any tied lecturers that come later in the sorted list
        if (hasHighestWeight) {
          // If there's a tie, check if any of the tied lecturers comes before this one
          // in the sorted list (meaning they have higher total weight)
          if (isTied) {
            const higherRankedTiedLecturers = tiedLecturers.filter(
              (tiedLecturer) => sortedLecturers.indexOf(tiedLecturer) < sortedLecturers.indexOf(lecturer),
            )

            // If there are tied lecturers with higher total weight, skip this subject
            if (higherRankedTiedLecturers.length > 0) continue
          }

          // Assign the subject to this lecturer
          assignments[lecturer][subject] = "Assigned"
          assignedCounts[lecturer]++
          assignedSubjects.add(subject)
        }
      }
    }

    // Second pass: For any unassigned subjects, assign to the lecturer with the highest weight
    // who hasn't reached their maximum assignments
    for (const subject of sortedSubjects) {
      // Skip if the subject is already assigned
      if (assignedSubjects.has(subject)) continue

      // Find the lecturer with the highest weight who hasn't reached max assignments
      let bestLecturer = null
      let bestWeight = -1

      // Check lecturers in order of total weight
      for (const lecturer of sortedLecturers) {
        if (assignedCounts[lecturer] >= maxAssignments) continue

        const weight = data[lecturer]?.[subject] || 0
        if (weight > bestWeight) {
          bestWeight = weight
          bestLecturer = lecturer
        } else if (weight === bestWeight && weight > 0) {
          // If tied, the lecturer with higher total weight (earlier in sortedLecturers) wins
          // We don't need to do anything here since we're iterating through sortedLecturers
        }
      }

      // Assign the subject if we found an eligible lecturer
      if (bestLecturer && bestWeight > 0) {
        assignments[bestLecturer][subject] = "Assigned"
        assignedCounts[bestLecturer]++
        assignedSubjects.add(subject)
      }
    }

    // Return the sorted lecturers to maintain the order in the UI
    return {
      lecturers: sortedLecturers,
      subjects: sortedSubjects,
      assignments,
      lecturerTotalWeights: Object.fromEntries(
        lecturerTotalWeights.map(({ name, totalWeight }) => [name, totalWeight]),
      ),
    }
  },
})

// A helper function to calculate total weight
function calculateTotalWeight(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
detail: any): number {
  let totalWeight = 0
  totalWeight += calculateWeight("feedback", detail.feedback)
  totalWeight += calculateWeight("qualification", detail.qualification)
  totalWeight += calculateWeight("publications", detail.publications)
  totalWeight += calculateWeight("experience", detail.experience)
  totalWeight += calculateWeight("professionalCertificate", detail.professionalCertificate)
  return totalWeight
}

// Include the calculateWeight function here as well
function calculateWeight(criteria: string, value: string | number | boolean | undefined): number {
  if (value === undefined) return 0

  // Normalizing the value for consistent mapping
  const normalizedValue = value.toString().trim()

  const weights = {
    feedback: 2,
    qualification: 3,
    publications: 3,
    experience: 2,
    professionalCertificate: 1,
  }

  const scales: { [key: string]: { [key: string]: number } } = {
    feedback: {
      "Above 80": 5,
      "70-79": 4,
      "60-69": 3,
      "50-59": 2,
      "Below 50": 1,
    },
    qualification: {
      "Degree": 1,
      "Degree-Master[not align]": 2,
      "Degree-Master[align]": 3,
      "Degree-Master-PhD[not align]": 4,
      "Degree-Master-PhD[align]": 5,
      "Professor": 6,
    },
    publications: { None: 0, "1-2": 1, "3-4": 2, "5-6": 3, "7-8": 4, "9+": 5 },
    experience: { "0": 1, "1-3": 2, "4-6": 3, "7-9": 4, "10+": 5 },
    professionalCertificate: { true: 1, false: 0 },
  }

  const weight = weights[criteria as keyof typeof weights] || 0
  const scale = scales[criteria]?.[normalizedValue] || 0

  return weight * scale
}
