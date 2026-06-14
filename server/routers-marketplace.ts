import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as dbMarketplace from "./db-marketplace";

export const marketplaceRouter = router({
  // Create listing
  createListing: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string(),
        price: z.string(),
        imageUrls: z.array(z.string()),
        imageKeys: z.array(z.string()),
        stock: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await dbMarketplace.createListing({
        sellerId: ctx.user.id,
        title: input.title,
        description: input.description,
        category: input.category,
        price: input.price,
        imageUrls: input.imageUrls,
        imageKeys: input.imageKeys,
        stock: input.stock || 0,
      });

      return listing;
    }),

  // Get listing by ID
  getListing: publicProcedure
    .input(z.object({ listingId: z.number() }))
    .query(async ({ input }) => {
      const listing = await dbMarketplace.getListingById(input.listingId);
      if (!listing) {
        throw new Error("Listing not found");
      }
      return listing;
    }),

  // Get seller listings
  getSellerListings: publicProcedure
    .input(z.object({ sellerId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      const listings = await dbMarketplace.getSellerListings(
        input.sellerId,
        input.limit || 20
      );
      return listings;
    }),

  // Get listings by category
  getByCategory: publicProcedure
    .input(z.object({ category: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      const listings = await dbMarketplace.getListingsByCategory(
        input.category,
        input.limit || 20
      );
      return listings;
    }),

  // Update listing
  updateListing: protectedProcedure
    .input(
      z.object({
        listingId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        stock: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await dbMarketplace.getListingById(input.listingId);
      if (!listing) {
        throw new Error("Listing not found");
      }

      if (listing.sellerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await dbMarketplace.updateListing(input.listingId, {
        title: input.title,
        description: input.description,
        price: input.price,
        stock: input.stock,
      });

      return { success: true };
    }),

  // Delete listing
  deleteListing: protectedProcedure
    .input(z.object({ listingId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const listing = await dbMarketplace.getListingById(input.listingId);
      if (!listing) {
        throw new Error("Listing not found");
      }

      if (listing.sellerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await dbMarketplace.deleteListing(input.listingId);
      return { success: true };
    }),
});

export const ordersRouter = router({
  // Create order
  createOrder: protectedProcedure
    .input(
      z.object({
        listingId: z.number(),
        quantity: z.number(),
        totalPrice: z.string(),
        shippingAddress: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const listing = await dbMarketplace.getListingById(input.listingId);
      if (!listing) {
        throw new Error("Listing not found");
      }

      const order = await dbMarketplace.createOrder({
        buyerId: ctx.user.id,
        sellerId: listing.sellerId,
        listingId: input.listingId,
        quantity: input.quantity,
        totalPrice: input.totalPrice,
        shippingAddress: input.shippingAddress,
      });

      return order;
    }),

  // Get order by ID
  getOrder: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await dbMarketplace.getOrderById(input.orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      // Verify ownership
      if (
        order.buyerId !== ctx.user.id &&
        order.sellerId !== ctx.user.id &&
        ctx.user.role !== "admin"
      ) {
        throw new Error("Unauthorized");
      }

      return order;
    }),

  // Get buyer orders
  getBuyerOrders: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const orders = await dbMarketplace.getBuyerOrders(
        ctx.user.id,
        input.limit || 20
      );
      return orders;
    }),

  // Get seller orders
  getSellerOrders: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const orders = await dbMarketplace.getSellerOrders(
        ctx.user.id,
        input.limit || 20
      );
      return orders;
    }),

  // Update order status
  updateStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        status: z.enum([
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cancelled",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await dbMarketplace.getOrderById(input.orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      if (order.sellerId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await dbMarketplace.updateOrderStatus(input.orderId, input.status);
      return { success: true };
    }),
});

export const reviewsRouter = router({
  // Create review
  createReview: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        listingId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await dbMarketplace.getOrderById(input.orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      if (order.buyerId !== ctx.user.id) {
        throw new Error("Only the buyer can review this order");
      }

      const review = await dbMarketplace.createReview({
        orderId: input.orderId,
        buyerId: ctx.user.id,
        sellerId: order.sellerId,
        listingId: input.listingId,
        rating: input.rating,
        comment: input.comment,
      });

      return review;
    }),

  // Get listing reviews
  getListingReviews: publicProcedure
    .input(z.object({ listingId: z.number() }))
    .query(async ({ input }) => {
      const reviews = await dbMarketplace.getListingReviews(input.listingId);
      return reviews;
    }),

  // Get seller reviews
  getSellerReviews: publicProcedure
    .input(z.object({ sellerId: z.number() }))
    .query(async ({ input }) => {
      const reviews = await dbMarketplace.getSellerReviews(input.sellerId);
      return reviews;
    }),

  // Delete review
  deleteReview: protectedProcedure
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Verify ownership
      await dbMarketplace.deleteReview(input.reviewId);
      return { success: true };
    }),
});

export const sellerStatsRouter = router({
  // Get seller stats
  getStats: publicProcedure
    .input(z.object({ sellerId: z.number() }))
    .query(async ({ input }) => {
      const stats = await dbMarketplace.getSellerStats(input.sellerId);
      return stats;
    }),
});
