import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as dbAdmin from "./db-admin";

// Admin-only procedure wrapper
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return next({ ctx });
});

export const adminRouter = router({
  // ============================================================================
  // DASHBOARD
  // ============================================================================

  getDashboardStats: adminProcedure.query(async () => {
    const stats = await dbAdmin.getDashboardStats();
    return stats;
  }),

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  getAllUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const users = await dbAdmin.getAllUsers(
        input.limit || 50,
        input.offset || 0
      );
      return users;
    }),

  getUserStats: adminProcedure.query(async () => {
    const stats = await dbAdmin.getUserStats();
    return stats;
  }),

  promoteToAdmin: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await dbAdmin.promoteUserToAdmin(input.userId);
      return { success: true };
    }),

  demoteToUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await dbAdmin.demoteAdminToUser(input.userId);
      return { success: true };
    }),

  // ============================================================================
  // POST MANAGEMENT
  // ============================================================================

  getAllPosts: adminProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const posts = await dbAdmin.getAllPosts(
        input.limit || 50,
        input.offset || 0
      );
      return posts;
    }),

  getPostStats: adminProcedure.query(async () => {
    const stats = await dbAdmin.getPostStats();
    return stats;
  }),

  deletePost: adminProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      await dbAdmin.deletePost(input.postId);
      return { success: true };
    }),

  // ============================================================================
  // MARKETPLACE MANAGEMENT
  // ============================================================================

  getAllMarketplaceListings: adminProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const listings = await dbAdmin.getAllMarketplaceListings(
        input.limit || 50,
        input.offset || 0
      );
      return listings;
    }),

  getMarketplaceStats: adminProcedure.query(async () => {
    const stats = await dbAdmin.getMarketplaceStats();
    return stats;
  }),

  deleteMarketplaceListing: adminProcedure
    .input(z.object({ listingId: z.number() }))
    .mutation(async ({ input }) => {
      await dbAdmin.deleteMarketplaceListing(input.listingId);
      return { success: true };
    }),

  // ============================================================================
  // VIP MANAGEMENT
  // ============================================================================

  getAllVipApplications: adminProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const applications = await dbAdmin.getAllVipApplications(
        input.limit || 50,
        input.offset || 0
      );
      return applications;
    }),

  getPendingVipApplications: adminProcedure.query(async () => {
    const applications = await dbAdmin.getPendingVipApplications();
    return applications;
  }),

  getVipStats: adminProcedure.query(async () => {
    const stats = await dbAdmin.getVipStats();
    return stats;
  }),
});
