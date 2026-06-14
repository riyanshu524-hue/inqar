import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as dbSearch from "./db-search";

export const searchRouter = router({
  // Search users by username
  searchUsers: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      if (input.query.length < 2) {
        return [];
      }
      const users = await dbSearch.searchUsers(input.query, input.limit || 20);
      return users;
    }),

  // Search users by name
  searchUsersByName: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      if (input.query.length < 2) {
        return [];
      }
      const users = await dbSearch.searchUsersByName(
        input.query,
        input.limit || 20
      );
      return users;
    }),

  // Search posts
  searchPosts: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      if (input.query.length < 2) {
        return [];
      }
      const posts = await dbSearch.searchPosts(input.query, input.limit || 20);
      return posts;
    }),

  // Search hashtags
  searchHashtags: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      if (input.query.length < 1) {
        return [];
      }
      const hashtags = await dbSearch.searchHashtags(
        input.query,
        input.limit || 20
      );
      return hashtags;
    }),

  // Global search (combines users, posts, and hashtags)
  globalSearch: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      if (input.query.length < 2) {
        return { users: [], posts: [], hashtags: [] };
      }

      const [users, posts, hashtags] = await Promise.all([
        dbSearch.searchUsers(input.query, 5),
        dbSearch.searchPosts(input.query, 5),
        dbSearch.searchHashtags(input.query, 5),
      ]);

      return { users, posts, hashtags };
    }),
});

export const exploreRouter = router({
  // Get trending posts
  getTrendingPosts: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      const posts = await dbSearch.getTrendingPosts(input.limit || 20);
      return posts;
    }),

  // Get trending users
  getTrendingUsers: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      const users = await dbSearch.getTrendingUsers(input.limit || 10);
      return users;
    }),

  // Get trending hashtags
  getTrendingHashtags: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      const hashtags = await dbSearch.getTrendingHashtags(
        input.limit || 10
      );
      return hashtags;
    }),

  // Get recommended users (for authenticated users)
  getRecommendedUsers: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const users = await dbSearch.getRecommendedUsers(
        ctx.user.id,
        input.limit || 10
      );
      return users;
    }),

  // Get explore page data (trending + recommendations)
  getExploreData: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      const [trendingPosts, trendingUsers, trendingHashtags] =
        await Promise.all([
          dbSearch.getTrendingPosts(input.limit || 20),
          dbSearch.getTrendingUsers(input.limit || 10),
          dbSearch.getTrendingHashtags(input.limit || 10),
        ]);

      return {
        trendingPosts,
        trendingUsers,
        trendingHashtags,
      };
    }),
});
