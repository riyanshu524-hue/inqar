import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // USER PROFILE ROUTES
  // ============================================================================

  user: router({
    // Get current user profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) {
        throw new Error("User not found");
      }

      const followersCount = await db.getFollowersCount(user.id);
      const followingCount = await db.getFollowingCount(user.id);

      return {
        ...user,
        followersCount,
        followingCount,
      };
    }),

    // Get user profile by username
    getProfileByUsername: publicProcedure
      .input(z.object({ username: z.string() }))
      .query(async ({ input, ctx }) => {
        const user = await db.getUserByUsername(input.username);
        if (!user) {
          throw new Error("User not found");
        }

        const followersCount = await db.getFollowersCount(user.id);
        const followingCount = await db.getFollowingCount(user.id);

        // Check if current user is following this user
        let isFollowing = false;
        if (ctx.user) {
          isFollowing = await db.isFollowing(ctx.user.id, user.id);
        }

        // If account is private and user is not following, don't return full profile
        if (user.isPrivate && !isFollowing && ctx.user?.id !== user.id) {
          return {
            id: user.id,
            username: user.username,
            name: user.name,
            avatarUrl: user.avatarUrl,
            isPrivate: true,
            followersCount,
            followingCount,
            restricted: true,
          };
        }

        return {
          ...user,
          followersCount,
          followingCount,
          isFollowing,
          restricted: false,
        };
      }),

    // Update user profile
    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          bio: z.string().optional(),
          isPrivate: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);

        const updatedUser = await db.getUserById(ctx.user.id);
        return updatedUser;
      }),

    // Update avatar
    updateAvatar: protectedProcedure
      .input(
        z.object({
          avatarUrl: z.string(),
          avatarKey: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, {
          avatarUrl: input.avatarUrl,
          avatarKey: input.avatarKey,
        });

        const updatedUser = await db.getUserById(ctx.user.id);
        return updatedUser;
      }),
  }),

  // ============================================================================
  // FOLLOW SYSTEM ROUTES
  // ============================================================================

  follow: router({
    // Follow a user
    followUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.id === input.userId) {
          throw new Error("Cannot follow yourself");
        }

        const isAlreadyFollowing = await db.isFollowing(
          ctx.user.id,
          input.userId
        );
        if (isAlreadyFollowing) {
          throw new Error("Already following this user");
        }

        await db.followUser(ctx.user.id, input.userId);

        return { success: true };
      }),

    // Unfollow a user
    unfollowUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.unfollowUser(ctx.user.id, input.userId);

        return { success: true };
      }),

    // Check if following
    isFollowing: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        const following = await db.isFollowing(ctx.user.id, input.userId);
        return { isFollowing: following };
      }),

    // Get followers count
    getFollowersCount: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const count = await db.getFollowersCount(input.userId);
        return { count };
      }),

    // Get following count
    getFollowingCount: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const count = await db.getFollowingCount(input.userId);
        return { count };
      }),
  }),

  // ============================================================================
  // VIP SUBSCRIPTION ROUTES
  // ============================================================================

  vip: router({
    // Get VIP subscription status
    getSubscription: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await db.getVipSubscription(ctx.user.id);
      return subscription || null;
    }),

    // Check if user is VIP
    isVip: protectedProcedure.query(async ({ ctx }) => {
      const subscription = await db.getVipSubscription(ctx.user.id);
      return {
        isVip: subscription?.isActive ?? false,
        tier: subscription?.tier ?? null,
      };
    }),

    // Get government VIP application status
    getGovernmentVipApplication: protectedProcedure.query(async ({ ctx }) => {
      const application = await db.getGovernmentVipApplication(ctx.user.id);
      return application || null;
    }),

    // Submit government VIP application
    submitGovernmentVipApplication: protectedProcedure
      .input(
        z.object({
          firstName: z.string(),
          lastName: z.string(),
          age: z.number().optional(),
          dateOfBirth: z.date().optional(),
          position: z.string(),
          department: z.string(),
          reason: z.string(),
          idCardUrl: z.string(),
          idCardKey: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check if already has application
        const existing = await db.getGovernmentVipApplication(ctx.user.id);
        if (existing) {
          throw new Error("You already have a government VIP application");
        }

        const application = await db.createGovernmentVipApplication({
          userId: ctx.user.id,
          ...input,
        });

        return application;
      }),
  }),
});

export type AppRouter = typeof appRouter;
