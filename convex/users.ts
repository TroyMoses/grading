import { ConvexError, v } from "convex/values";
import {
  type MutationCtx,
  type QueryCtx,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";

export async function getUser(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string
) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_tokenIdentifier", (q) =>
      q.eq("tokenIdentifier", tokenIdentifier)
    )
    .first();

  if (!user) {
    throw new ConvexError("expected user to be defined");
  }

  return user;
}

export const createUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    lecName: v.optional(v.string()),
    image: v.string(),
    email: v.string(),
    role: v.optional(v.string()),
  },
  async handler(ctx, args) {
    await ctx.db.insert("users", {
      tokenIdentifier: args.tokenIdentifier,
      name: args.name,
      lecName: args.lecName,
      email: args.email,
      role: args.role,
      image: args.image,
    });
  },
});

export const updateUser = internalMutation({
  args: {
    tokenIdentifier: v.string(),
    name: v.string(),
    lecName: v.optional(v.string()),
    image: v.string(),
    email: v.string(),
    role: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier)
      )
      .first();

    if (!user) {
      throw new ConvexError("no user with this token found");
    }

    await ctx.db.patch(user._id, {
      name: args.name,
      image: args.image,
      email: args.email,
      role: args.role,
      lecName: args.lecName,
    });
  },
});

export const getUserProfile = query({
  args: { userId: v.id("users") },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId);

    return {
      name: user?.name,
      image: user?.image,
    };
  },
});

export const getMe = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await getUser(ctx, identity.tokenIdentifier);

    if (!user) {
      return null;
    }

    return user;
  },
});

// New functions for user management

export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    // Map the users to the format expected by the UI
    return users.map((user) => ({
      id: user._id,
      name: user.name || "No Name",
      email: user.email || "No Email",
      role: user.role || "No Role",
      lecName: user.lecName || "",
      tokenIdentifier: user.tokenIdentifier,
      image: user.image,
      lecturerId: user.lecturerId,
    }));
  },
});

// Function to associate a user with a lecturer
export const associateUserWithLecturer = mutation({
  args: {
    userId: v.id("users"),
    lecturerId: v.id("lecturers"),
  },
  async handler(ctx, args) {
    const { userId, lecturerId } = args;

    // Get the user and lecturer from the database
    const user = await ctx.db.get(userId);
    const lecturer = await ctx.db.get(lecturerId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    if (!lecturer) {
      throw new ConvexError("Lecturer not found");
    }

    // Check if the user's lecName is contained within the lecturer's name
    // This is a more flexible check that allows for partial matches
    if (user.lecName) {
      const usernameLower = user.lecName.toLowerCase();
      const lecturerNameParts = lecturer.name.toLowerCase().split(/\s+/);

      // Check if any part of the lecturer name matches the username
      const nameMatches = lecturerNameParts.some(
        (part) => part === usernameLower
      );

      if (!nameMatches) {
        return {
          success: false,
          message: `Warning: User's username (${user.lecName}) doesn't appear to match any part of lecturer's name (${lecturer.name})`,
        };
      }
    }

    // Update the user with the lecturerId
    await ctx.db.patch(userId, {
      lecturerId: lecturerId,
    });

    // Update the lecturer to mark it as having a user account
    await ctx.db.patch(lecturerId, {
      hasUserAccount: true,
    });

    return {
      success: true,
      message: "User successfully associated with lecturer",
    };
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
  },
  async handler(ctx, args) {
    const { userId, role } = args;

    // Get the user from the database
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Update the user's role in the database
    await ctx.db.patch(userId, {
      role: role,
    });

    return {
      success: true,
      message: `User role updated to ${role}`,
    };
  },
});

// Add a new function to get a user by their Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const tokenIdentifier = `https://winning-sculpin-54.clerk.accounts.dev|${args.clerkId}`;

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", tokenIdentifier)
      )
      .first();

    return user;
  },
});

// Get users who are not associated with any lecturer
export const getUnassociatedUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .filter(
        (q) =>
          q.eq(q.field("role"), "lecturer") &&
          q.eq(q.field("lecturerId"), undefined)
      )
      .collect();

    return users.map((user) => ({
      id: user._id,
      name: user.name || "No Name",
      email: user.email || "No Email",
      lecName: user.lecName || "",
    }));
  },
});

// Get lecturers who are not associated with any user
export const getUnassociatedLecturers = query({
  handler: async (ctx) => {
    const lecturers = await ctx.db
      .query("lecturers")
      .filter((q) =>
        q.or(
          q.eq(q.field("hasUserAccount"), false),
          q.eq(q.field("hasUserAccount"), undefined)
        )
      )
      .collect();

    return lecturers;
  },
});
