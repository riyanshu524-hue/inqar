import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// VIP subscription products
const VIP_PRODUCTS = {
  REGULAR_VIP: {
    name: "Regular VIP",
    price: 999, // $9.99 in cents
    interval: "month" as const,
    description: "Get exclusive features and priority support",
  },
  GOVERNMENT_VIP: {
    name: "Government VIP",
    price: 1999, // $19.99 in cents
    interval: "month" as const,
    description: "Premium government verification and exclusive benefits",
  },
};

export const vipRouter = router({
  // Get current user's VIP subscription
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
      renewalDate: subscription?.renewalDate ?? null,
    };
  }),

  // Create checkout session for VIP subscription
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["regular", "government"]),
        returnUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user already has active subscription
        const existing = await db.getVipSubscription(ctx.user.id);
        if (existing?.isActive) {
          throw new Error(
            "You already have an active VIP subscription. Please cancel it first."
          );
        }

        const product =
          input.tier === "government"
            ? VIP_PRODUCTS.GOVERNMENT_VIP
            : VIP_PRODUCTS.REGULAR_VIP;

        // Create or get Stripe customer
        let stripeCustomerId = existing?.stripeCustomerId;
        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email || undefined,
            name: ctx.user.name || undefined,
            metadata: {
              userId: ctx.user.id.toString(),
            },
          });
          stripeCustomerId = customer.id;
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: product.name,
                  description: product.description,
                },
                unit_amount: product.price,
                recurring: {
                  interval: product.interval,
                  interval_count: 1,
                },
              },
              quantity: 1,
            },
          ],
          mode: "subscription",
          success_url: input.returnUrl
            ? `${input.returnUrl}?success=true`
            : `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/vip?success=true`,
          cancel_url: input.returnUrl
            ? `${input.returnUrl}?cancelled=true`
            : `${process.env.VITE_FRONTEND_URL || "http://localhost:3000"}/vip?cancelled=true`,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            userId: ctx.user.id.toString(),
            tier: input.tier,
          },
        });

        return {
          success: true,
          sessionUrl: session.url,
          sessionId: session.id,
        };
      } catch (error) {
        console.error("[VIP] Checkout error:", error);
        throw error;
      }
    }),

  // Cancel VIP subscription
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const subscription = await db.getVipSubscription(ctx.user.id);
      if (!subscription || !subscription.stripeSubscriptionId) {
        throw new Error("No active subscription found");
      }

      // Cancel Stripe subscription
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update local subscription
      await db.updateVipSubscription(ctx.user.id, {
        isActive: false,
      });

      return { success: true };
    } catch (error) {
      console.error("[VIP] Cancellation error:", error);
      throw error;
    }
  }),

  // Get Government VIP application status
  getGovernmentVipApplication: protectedProcedure.query(async ({ ctx }) => {
    const application = await db.getGovernmentVipApplication(ctx.user.id);
    return application || null;
  }),

  // Submit Government VIP application
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

  // Get all pending Government VIP applications (admin only)
  getPendingApplications: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const applications = await db.getPendingGovernmentVipApplications();
    return applications;
  }),

  // Approve Government VIP application (admin only)
  approveApplication: protectedProcedure
    .input(z.object({ applicationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      // Get application by ID - fetch from pending list and find by ID
      const allApplications = await db.getPendingGovernmentVipApplications();
      const application = allApplications.find((a) => a.id === input.applicationId);
      if (!application) {
        throw new Error("Application not found");
      }

      // Update application status
      await db.approveGovernmentVipApplication(input.applicationId);

      // Create VIP subscription for user
      const renewalDate = new Date();
      renewalDate.setFullYear(renewalDate.getFullYear() + 1); // 1 year validity

      await db.createVipSubscription({
        userId: application.userId,
        tier: "government",
        isActive: true,
        renewalDate,
      });

      return { success: true };
    }),

  // Reject Government VIP application (admin only)
  rejectApplication: protectedProcedure
    .input(
      z.object({
        applicationId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      // Get application by ID - fetch from pending list and find by ID
      const allApplications = await db.getPendingGovernmentVipApplications();
      const application = allApplications.find((a) => a.id === input.applicationId);
      if (!application) {
        throw new Error("Application not found");
      }

      // Update application status
      await db.declineGovernmentVipApplication(
        input.applicationId,
        input.reason || "Application rejected"
      );

      return { success: true };
    }),
});
