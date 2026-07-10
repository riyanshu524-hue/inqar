import { useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";

/**
 * Hook for real-time post synchronization across devices
 * Polls for new posts every 3 seconds to simulate real-time updates
 */
export function useRealtimePosts() {
  const utils = trpc.useUtils();
  
  useEffect(() => {
    // Poll for new posts every 3 seconds
    const interval = setInterval(() => {
      utils.posts.getFeedPosts.invalidate();
    }, 3000);

    return () => clearInterval(interval);
  }, [utils.posts.getFeedPosts]);
}

/**
 * Hook for real-time user updates
 * Polls for user profile changes every 5 seconds
 */
export function useRealtimeUser(userId?: number) {
  const utils = trpc.useUtils();
  
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      utils.user.getProfile.invalidate();
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, utils.user.getProfile]);
}

/**
 * Hook for real-time notifications
 * Polls for new notifications every 2 seconds
 */
export function useRealtimeNotifications() {
  const utils = trpc.useUtils();
  
  useEffect(() => {
    const interval = setInterval(() => {
      utils.notifications.getNotifications.invalidate();
    }, 2000);

    return () => clearInterval(interval);
  }, [utils.notifications.getNotifications]);
}
