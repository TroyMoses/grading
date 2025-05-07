import { query } from "./_generated/server";

export const getRecentActivities = query({
  handler: async (ctx) => {
    // Get recent lecturers (added in the last 7 days)
    const recentLecturers = await ctx.db
      .query("lecturers")
      .order("desc")
      .take(5);

    // Get recent subjects (added in the last 7 days)
    const recentSubjects = await ctx.db.query("subjects").order("desc").take(5);

    // Get recent lecturer details (added in the last 7 days)
    const recentLecturerDetails = await ctx.db
      .query("lecturerDetails")
      .order("desc")
      .take(5);

    // Get all lecturers and subjects for reference
    const allLecturers = await ctx.db.query("lecturers").collect();
    const allSubjects = await ctx.db.query("subjects").collect();

    // Create a map for faster lookups
    const lecturerMap = new Map(allLecturers.map((l) => [l._id, l]));
    const subjectMap = new Map(allSubjects.map((s) => [s._id, s]));

    // Combine and format the activities
    const activities = [
      ...recentLecturers.map((lecturer) => ({
        type: "lecturer_added",
        title: "New Lecturer Added",
        description: `${lecturer.name} was added to the system`,
        timestamp: lecturer._creationTime,
        icon: "Users",
      })),
      ...recentSubjects.map((subject) => ({
        type: "subject_added",
        title: "Subject Added",
        description: `${subject.name} was added to the system`,
        timestamp: subject._creationTime,
        icon: "BookOpen",
      })),
      ...recentLecturerDetails.map((detail) => {
        const lecturer = detail.lecturerId ? lecturerMap.get(detail.lecturerId) : undefined;
        const subject = subjectMap.get(detail.subjectId);
        return {
          type: "lecturer_detail_updated",
          title: "Lecturer Details Updated",
          description: `Details updated for ${lecturer?.name || "Unknown"} on ${subject?.name || "Unknown Subject"}`,
          timestamp: detail._creationTime,
          icon: "Award",
        };
      }),
    ];

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => b.timestamp - a.timestamp);

    // Return the 5 most recent activities
    return activities.slice(0, 5);
  },
});
