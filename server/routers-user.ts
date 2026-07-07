import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    
    // Get follower/following counts
    const followersCount = await db.getFollowersCount(ctx.user.id);
    const followingCount = await db.getFollowingCount(ctx.user.id);
    
    return {
      ...ctx.user,
      followersCount,
      followingCount,
    };
  }),

  getProfileByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input }) => {
      const user = await db.getUserByUsername(input.username);
      if (!user) return null;
      
      // Get follower/following counts
      const followersCount = await db.getFollowersCount(user.id);
      const followingCount = await db.getFollowingCount(user.id);
      
      // Don't expose sensitive fields
      const { passwordHash, ...safeUser } = user;
      return {
        ...safeUser,
        followersCount,
        followingCount,
      };
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        avatarUrl: z.string().optional(),
        avatarKey: z.string().optional(),
        isPrivate: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const updated = await db.updateUserProfile(ctx.user.id, input);
      return updated;
    }),
});
