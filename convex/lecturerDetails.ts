import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const updateLecturerDetails = mutation({
  args: {
    lecturerId: v.id("lecturers"),
    subjectId: v.id("subjects"),
    experience: v.string(),
    publications: v.string(),
    feedback: v.number(),
    professionalCertificate: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { lecturerId, subjectId, ...details } = args
    const existingDetails = await ctx.db
      .query("lecturerDetails")
      .filter((q) => q.eq(q.field("lecturerId"), lecturerId) && q.eq(q.field("subjectId"), subjectId))
      .first()

    if (existingDetails) {
      await ctx.db.patch(existingDetails._id, details)
    } else {
      await ctx.db.insert("lecturerDetails", {
        lecturerId, subjectId, ...details,
        qualification: ""
      })
    }
  },
})

export const getGradingData = query({
  handler: async (ctx) => {
    const lecturers = await ctx.db.query("lecturers").collect()
    const subjects = await ctx.db.query("subjects").collect()
    const lecturerDetails = await ctx.db.query("lecturerDetails").collect()

    const data: { [key: string]: { [key: string]: unknown } } = {}

    lecturerDetails.forEach((detail) => {
      const lecturer = lecturers.find((l) => l._id === detail.lecturerId)
      const subject = subjects.find((s) => s._id === detail.subjectId)
      if (lecturer && subject) {
        if (!data[lecturer.name]) {
          data[lecturer.name] = {}
        }
        data[lecturer.name][subject.name] = {
          experience: detail.experience,
          publications: detail.publications,
          feedback: detail.feedback,
          professionalCertificate: detail.professionalCertificate,
        }
      }
    })

    return {
      lecturers: lecturers.map((l) => l.name),
      subjects: subjects.map((s) => s.name),
      data,
    }
  },
})

