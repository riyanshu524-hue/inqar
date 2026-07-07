import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ENV } from "./_core/env";

// Simple in-memory store for blocked users (in production, use database)
// Format: { userId: [blockedUserIds...] }
const blockedUsers = new Map<number, Set<number>>();

export const blockRouter = router({
  // Get list of blocked users
  getBlockedUsers: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    
    const blocked = blockedUsers.get(ctx.user.id) || new Set();
    return Array.from(blocked);
  }),

  // Block a user
  blockUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      if (ctx.user.id === input.userId) {
        throw new Error("Cannot block yourself");
      }

      if (!blockedUsers.has(ctx.user.id)) {
        blockedUsers.set(ctx.user.id, new Set());
      }
      
      blockedUsers.get(ctx.user.id)!.add(input.userId);
      return { success: true };
    }),

  // Unblock a user
  unblockUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const blocked = blockedUsers.get(ctx.user.id);
      if (blocked) {
        blocked.delete(input.userId);
      }
      
      return { success: true };
    }),

  // Check if a user is blocked
  isBlocked: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) return false;

      const blocked = blockedUsers.get(ctx.user.id);
      return blocked?.has(input.userId) ?? false;
    }),
});
