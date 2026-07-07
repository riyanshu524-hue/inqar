import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const followRouter = router({
  followUser: protectedProcedure
    .input(z.object({ followingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      if (ctx.user.id === input.followingId) {
        throw new Error("Cannot follow yourself");
      }

      try {
        const result = await db.followUser(ctx.user.id, input.followingId);
        return result;
      } catch (error: any) {
        if (error.message?.includes("unique")) {
          throw new Error("Already following this user");
        }
        throw error;
      }
    }),

  unfollowUser: protectedProcedure
    .input(z.object({ followingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const result = await db.unfollowUser(ctx.user.id, input.followingId);
      return result;
    }),

  isFollowing: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) return false;

      const result = await db.isFollowing(ctx.user.id, input.userId);
      return result;
    }),

  getFollowersCount: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const count = await db.getFollowersCount(input.userId);
      return count;
    }),

  getFollowingCount: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const count = await db.getFollowingCount(input.userId);
      return count;
    }),
});
