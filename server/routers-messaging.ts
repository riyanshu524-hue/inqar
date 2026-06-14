import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as dbMessaging from "./db-messaging";

export const conversationsRouter = router({
  // Get user conversations
  getUserConversations: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const conversations = await dbMessaging.getUserConversations(
        ctx.user.id,
        input.limit || 20
      );
      return conversations;
    }),

  // Get conversation by ID
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const conversation = await dbMessaging.getConversationById(
        input.conversationId
      );
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      // Verify user is participant
      if (
        conversation.user1Id !== ctx.user.id &&
        conversation.user2Id !== ctx.user.id
      ) {
        throw new Error("Unauthorized");
      }

      return conversation;
    }),

  // Get or create conversation with another user
  getOrCreateConversation: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.id === input.userId) {
        throw new Error("Cannot create conversation with yourself");
      }

      let conversation = await dbMessaging.getConversationBetween(
        ctx.user.id,
        input.userId
      );

      if (!conversation) {
        await dbMessaging.createConversation({
          user1Id: ctx.user.id,
          user2Id: input.userId,
        });
        conversation = await dbMessaging.getConversationBetween(
          ctx.user.id,
          input.userId
        );
      }

      return conversation;
    }),
});

export const messagesRouter = router({
  // Get conversation messages
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number(), limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      // Verify user is in conversation
      const conversation = await dbMessaging.getConversationById(
        input.conversationId
      );
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      if (
        conversation.user1Id !== ctx.user.id &&
        conversation.user2Id !== ctx.user.id
      ) {
        throw new Error("Unauthorized");
      }

      const messages = await dbMessaging.getConversationMessages(
        input.conversationId,
        input.limit || 50
      );
      return messages;
    }),

  // Send message
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        content: z.string(),
        mediaUrl: z.string().optional(),
        mediaKey: z.string().optional(),
        mediaType: z.enum(["image", "video"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user is in conversation
      const conversation = await dbMessaging.getConversationById(
        input.conversationId
      );
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      if (
        conversation.user1Id !== ctx.user.id &&
        conversation.user2Id !== ctx.user.id
      ) {
        throw new Error("Unauthorized");
      }

      const message = await dbMessaging.createMessage({
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        content: input.content,
        mediaUrl: input.mediaUrl,
        mediaKey: input.mediaKey,
        mediaType: input.mediaType,
      });

      return message;
    }),

  // Delete message
  deleteMessage: protectedProcedure
    .input(z.object({ messageId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const message = await dbMessaging.getMessageById(input.messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      if (message.senderId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await dbMessaging.deleteMessage(input.messageId);
      return { success: true };
    }),

  // Edit message
  editMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.number(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await dbMessaging.getMessageById(input.messageId);
      if (!message) {
        throw new Error("Message not found");
      }

      if (message.senderId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      await dbMessaging.updateMessage(input.messageId, {
        content: input.content,
      });

      return { success: true };
    }),
});
