import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as dbNotifications from "./db-notifications";

export const notificationsRouter = router({
  // Get user notifications
  getNotifications: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const notifications = await dbNotifications.getUserNotifications(
        ctx.user.id,
        input.limit || 20
      );
      return notifications;
    }),

  // Get unread notifications
  getUnreadNotifications: protectedProcedure.query(async ({ ctx }) => {
    const notifications = await dbNotifications.getUnreadNotifications(
      ctx.user.id
    );
    return notifications;
  }),

  // Get unread count
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const unread = await dbNotifications.getUnreadNotifications(ctx.user.id);
    return { count: unread.length };
  }),

  // Mark notification as read
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await dbNotifications.markNotificationAsRead(input.notificationId);
      return { success: true };
    }),

  // Mark all notifications as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await dbNotifications.markAllNotificationsAsRead(ctx.user.id);
    return { success: true };
  }),

  // Delete notification
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await dbNotifications.deleteNotification(input.notificationId);
      return { success: true };
    }),

  // Delete all notifications
  deleteAll: protectedProcedure.mutation(async ({ ctx }) => {
    await dbNotifications.deleteAllNotifications(ctx.user.id);
    return { success: true };
  }),
});
