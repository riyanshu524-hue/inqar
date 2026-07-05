import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { createUserInSupabase, getUserFromSupabase } from "./supabase-client";
import {
  postsRouter,
  likesRouter,
  commentsRouter,
  savesRouter,
  storiesRouter,
  hashtagsRouter,
} from "./routers-posts";
import { searchRouter, exploreRouter } from "./routers-search";
import {
  marketplaceRouter,
  ordersRouter,
  reviewsRouter,
  sellerStatsRouter,
} from "./routers-marketplace";
import { conversationsRouter, messagesRouter } from "./routers-messaging";
import { aiRouter } from "./routers-ai";
import { vipRouter } from "./routers-vip";
import { notificationsRouter } from "./routers-notifications";
import { adminRouter } from "./routers-admin";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserFromSupabase(input.email);
        if (!user) {
          const newUser = await createUserInSupabase({
            email: input.email,
            name: input.email.split("@")[0],
            username: input.email.split("@")[0],
            passwordHash: "",
          });
          if (newUser) {
            ctx.res.cookie("user-session", newUser.id, getSessionCookieOptions(ctx.req));
            return { user: newUser };
          }
          throw new Error("Failed to create user");
        }
        ctx.res.cookie("user-session", user.id, getSessionCookieOptions(ctx.req));
        return { user };
      }),

    signup: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
      .mutation(async ({ input, ctx }) => {
        const existing = await getUserFromSupabase(input.email);
        if (existing) {
          ctx.res.cookie("user-session", existing.id, getSessionCookieOptions(ctx.req));
          return { user: existing };
        }

        const newUser = await createUserInSupabase({
          email: input.email,
          name: input.email.split("@")[0],
          username: input.email.split("@")[0],
          passwordHash: "",
        });

        if (newUser) {
          ctx.res.cookie("user-session", newUser.id, getSessionCookieOptions(ctx.req));
          return { user: newUser };
        }
        throw new Error("Failed to create user");
      }),

    me: publicProcedure.query(async ({ ctx }) => {
      if (ctx.user) {
        return ctx.user;
      }
      return null;
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie("sb-access-token");
      ctx.res.clearCookie("sb-refresh-token");
      ctx.res.clearCookie("user-session");
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // POSTS
  // ============================================================================
  posts: postsRouter,
  likes: likesRouter,
  comments: commentsRouter,
  saves: savesRouter,
  stories: storiesRouter,
  hashtags: hashtagsRouter,

  // ============================================================================
  // SEARCH & EXPLORE
  // ============================================================================
  search: searchRouter,
  explore: exploreRouter,

  // ============================================================================
  // MARKETPLACE
  // ============================================================================
  marketplace: marketplaceRouter,
  orders: ordersRouter,
  reviews: reviewsRouter,
  sellerStats: sellerStatsRouter,

  // ============================================================================
  // MESSAGING
  // ============================================================================
  conversations: conversationsRouter,
  messages: messagesRouter,

  // ============================================================================
  // AI
  // ============================================================================
  ai: aiRouter,

  // ============================================================================
  // VIP
  // ============================================================================
  vip: vipRouter,

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  notifications: notificationsRouter,

  // ============================================================================
  // ADMIN
  // ============================================================================
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
