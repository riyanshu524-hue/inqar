import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as dbPosts from "./db-posts";
import * as db from "./db";

export const postsRouter = router({
  // Create a new post
  createPost: protectedProcedure
    .input(
      z.object({
        caption: z.string().optional(),
        mediaUrls: z.array(z.string()),
        mediaKeys: z.array(z.string()),
        hashtags: z.array(z.string()).optional(),
        location: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const post = await dbPosts.createPost({
        userId: ctx.user.id,
        caption: input.caption,
        mediaUrls: input.mediaUrls,
        mediaKeys: input.mediaKeys,
        hashtags: input.hashtags || [],
        location: input.location,
      });

      return post;
    }),

  // Get post by ID
  getPost: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input, ctx }) => {
      const post = await dbPosts.getPostById(input.postId);
      if (!post) {
        throw new Error("Post not found");
      }

      // Check if current user liked or saved
      let liked = false;
      let saved = false;
      if (ctx.user) {
        liked = await dbPosts.hasUserLikedPost(post.id, ctx.user.id);
        saved = await dbPosts.hasUserSavedPost(post.id, ctx.user.id);
      }

      return {
        ...post,
        liked,
        saved,
      };
    }),

  // Get user's posts
  getUserPosts: publicProcedure
    .input(z.object({ userId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      const posts = await dbPosts.getUserPosts(input.userId, input.limit);
      return posts;
    }),

  // Get feed posts
  getFeedPosts: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      // Get list of users the current user is following
      // TODO: Implement proper feed algorithm
      const posts = await dbPosts.getUserPosts(ctx.user.id, input.limit);
      return posts;
    }),

  // Delete post
  deletePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const post = await dbPosts.getPostById(input.postId);
      if (!post) {
        throw new Error("Post not found");
      }

      if (post.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await dbPosts.deletePost(input.postId);
      return { success: true };
    }),
});

export const likesRouter = router({
  // Like a post
  likePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await dbPosts.likePost(input.postId, ctx.user.id);
      return { success: true };
    }),

  // Unlike a post
  unlikePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await dbPosts.unlikePost(input.postId, ctx.user.id);
      return { success: true };
    }),

  // Check if user liked post
  hasLiked: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const liked = await dbPosts.hasUserLikedPost(input.postId, ctx.user.id);
      return { liked };
    }),

  // Get likes count
  getLikesCount: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const count = await dbPosts.getPostLikesCount(input.postId);
      return { count };
    }),
});

export const commentsRouter = router({
  // Create comment
  createComment: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        content: z.string(),
        parentCommentId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await dbPosts.createComment({
        postId: input.postId,
        userId: ctx.user.id,
        content: input.content,
        parentCommentId: input.parentCommentId,
      });

      return comment;
    }),

  // Get post comments
  getComments: publicProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const comments = await dbPosts.getPostComments(input.postId);
      return comments;
    }),

  // Delete comment
  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.number(), postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Verify ownership
      await dbPosts.deleteComment(input.commentId, input.postId);
      return { success: true };
    }),
});

export const savesRouter = router({
  // Save post
  savePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await dbPosts.savePost(input.postId, ctx.user.id);
      return { success: true };
    }),

  // Unsave post
  unsavePost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await dbPosts.unsavePost(input.postId, ctx.user.id);
      return { success: true };
    }),

  // Check if saved
  hasSaved: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const saved = await dbPosts.hasUserSavedPost(input.postId, ctx.user.id);
      return { saved };
    }),
});

export const storiesRouter = router({
  // Create story
  createStory: protectedProcedure
    .input(
      z.object({
        mediaUrl: z.string(),
        mediaKey: z.string(),
        mediaType: z.enum(["image", "video"]),
        caption: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const story = await dbPosts.createStory({
        userId: ctx.user.id,
        mediaUrl: input.mediaUrl,
        mediaKey: input.mediaKey,
        mediaType: input.mediaType,
        caption: input.caption,
        expiresAt,
      });

      return story;
    }),

  // Get user stories
  getUserStories: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const stories = await dbPosts.getUserStories(input.userId);
      return stories;
    }),

  // Get story by ID
  getStory: publicProcedure
    .input(z.object({ storyId: z.number() }))
    .query(async ({ input }) => {
      const story = await dbPosts.getStoryById(input.storyId);
      if (!story) {
        throw new Error("Story not found");
      }
      return story;
    }),

  // Add story view
  viewStory: protectedProcedure
    .input(z.object({ storyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await dbPosts.addStoryView(input.storyId, ctx.user.id);
      return { success: true };
    }),

  // Get story viewers
  getViewers: publicProcedure
    .input(z.object({ storyId: z.number() }))
    .query(async ({ input }) => {
      const viewers = await dbPosts.getStoryViewers(input.storyId);
      return viewers;
    }),

  // Get views count
  getViewsCount: publicProcedure
    .input(z.object({ storyId: z.number() }))
    .query(async ({ input }) => {
      const count = await dbPosts.getStoryViewsCount(input.storyId);
      return { count };
    }),

  // Delete story
  deleteStory: protectedProcedure
    .input(z.object({ storyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const story = await dbPosts.getStoryById(input.storyId);
      if (!story) {
        throw new Error("Story not found");
      }

      if (story.userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await dbPosts.deleteStory(input.storyId);
      return { success: true };
    }),
});

export const hashtagsRouter = router({
  // Get trending hashtags
  getTrending: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      const hashtags = await dbPosts.getTrendingHashtags(input.limit || 10);
      return hashtags;
    }),

  // Get hashtag by name
  getByName: publicProcedure
    .input(z.object({ tag: z.string() }))
    .query(async ({ input }) => {
      const hashtag = await dbPosts.getHashtagByName(input.tag);
      if (!hashtag) {
        throw new Error("Hashtag not found");
      }
      return hashtag;
    }),

  // Get posts by hashtag
  getPosts: publicProcedure
    .input(z.object({ hashtagId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      const posts = await dbPosts.getPostsByHashtag(
        input.hashtagId,
        input.limit || 20
      );
      return posts;
    }),
});
