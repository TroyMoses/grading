import { query } from "./_generated/server";

export const getAllFeedbacks = query({
  handler: async (ctx) => {
    return await ctx.db.query("feedbacks").collect();
  },
});