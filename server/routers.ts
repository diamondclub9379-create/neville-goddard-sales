import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME, calcVolumeDiscount } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createBlogPost,
  createOrder,
  createProduct,
  deleteBlogPost,
  deleteBundleDeal,
  deleteProduct,
  generateOrderNumber,
  getBlogPostBySlug,
  getBlogPosts,
  getBundleDeals,
  getOrderById,
  getOrders,
  getOrdersByEmail,
  getOrdersWithItems,
  getOrderSummaryKPIs,
  getProductBySlug,
  getProducts,
  getReviewsByBookId,
  getSalesAnalytics,
  updateBlogPost,
  updateOrderNotes,
  updateOrderSlip,
  updateOrderStatus,
  updateProduct,
  upsertBundleDeal,
} from "./db";
import Stripe from "stripe";
import { ENV } from "./_core/env";
import { notifyOwner } from "./_core/notification";
import { sendOrderConfirmationEmail } from "./email";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Public order submission ─────────────────────────────────────────────
  orders: router({
    create: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email(),
        customerPhone: z.string().min(1),
        customerAddress: z.string().min(1),
        paymentMethod: z.enum(["bank-transfer", "credit-card"]),
        items: z.array(z.object({
          bookId: z.number(),
          bookTitleTh: z.string(),
          bookTitleEn: z.string(),
          bookImage: z.string(),
          unitPrice: z.number(),
          quantity: z.number().min(1),
        })),
        bundleDealId: z.number().optional(),
        // Volume discount fields (computed server-side for security, but accept for reference)
        discountAmount: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        // Compute subtotal from raw book prices (unitPrice already = book price, no pre-discount)
        const subtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        // Server-side authoritative volume discount calculation
        const volumeCalc = calcVolumeDiscount(subtotal);
        const discountAmount = volumeCalc.discountAmount;
        const shippingFee = volumeCalc.shippingFee;
        const discountTier = volumeCalc.tier;
        const totalAmount = subtotal - discountAmount + shippingFee;
        const orderNumber = generateOrderNumber();

        const order = await createOrder(
          {
            orderNumber,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            customerAddress: input.customerAddress,
            paymentMethod: input.paymentMethod,
            status: "pending",
            subtotal: subtotal.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            shippingFee: shippingFee.toFixed(2),
            discountTier: discountTier ?? undefined,
            bundleDealId: input.bundleDealId ?? null,
            emailSent: 0,
          },
          input.items.map(item => ({
            bookId: item.bookId,
            bookTitleTh: item.bookTitleTh,
            bookTitleEn: item.bookTitleEn,
            bookImage: item.bookImage,
            unitPrice: item.unitPrice.toFixed(2),
            quantity: item.quantity,
            subtotal: (item.unitPrice * item.quantity).toFixed(2),
          }))
        );

        // Notify owner of new order
        try {
          await notifyOwner({
            title: `คำสั่งซื้อใหม่ #${orderNumber}`,
            content: `${input.customerName} สั่งซื้อ ${input.items.length} รายการ รวม ฿${totalAmount.toFixed(2)}`,
          });
        } catch (e) {
          console.warn("[Notification] Failed to notify owner:", e);
        }

        // Send confirmation email to customer + notification to owner
        try {
          await sendOrderConfirmationEmail({
            orderNumber,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            customerPhone: input.customerPhone,
            customerAddress: input.customerAddress,
            paymentMethod: input.paymentMethod,
            items: input.items.map(item => ({
              titleTh: item.bookTitleTh,
              titleEn: item.bookTitleEn,
              quantity: item.quantity,
              price: item.unitPrice,
            })),
            total: totalAmount,
            createdAt: new Date(),
          });
        } catch (e) {
          console.warn("[Email] Failed to send order confirmation:", e);
        }

        return { orderNumber, orderId: order.id };
      }),

    getByNumber: publicProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(async ({ input }) => {
        const allOrders = await getOrders({ search: input.orderNumber, limit: 1 });
        if (!allOrders.orders[0]) throw new TRPCError({ code: "NOT_FOUND" });
        return getOrderById(allOrders.orders[0].id);
      }),

    // Customer: get own orders by their logged-in email
    getMyOrders: protectedProcedure
      .query(async ({ ctx }) => {
        const email = ctx.user.email;
        if (!email) return [];
        return getOrdersByEmail(email);
      }),
  }),

  // ─── Bundle deals (public read) ──────────────────────────────────────────────────────
  bundleDeals: router({
    list: publicProcedure.query(() => getBundleDeals(true)),
  }),

  // ─── Admin procedures ──────────────────────────────────────────────────────
  admin: router({
    // Orders management
    listOrders: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        return getOrders(input);
      }),

    getOrder: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        return order;
      }),

    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled"]),
        trackingNumber: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.id, input.status, input.trackingNumber);
        return { success: true };
      }),

    updateNotes: adminProcedure
      .input(z.object({ id: z.number(), notes: z.string() }))
      .mutation(async ({ input }) => {
        await updateOrderNotes(input.id, input.notes);
        return { success: true };
      }),

    // Analytics
    analytics: adminProcedure
      .input(z.object({
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
      }))
      .query(async ({ input }) => {
        return getSalesAnalytics(input.dateFrom, input.dateTo);
      }),

    // Bundle deals management
    listBundleDeals: adminProcedure.query(() => getBundleDeals(false)),

    upsertBundleDeal: adminProcedure
      .input(z.object({
        id: z.number().optional(),
        name: z.string().min(1),
        nameTh: z.string().min(1),
        description: z.string().optional(),
        descriptionTh: z.string().optional(),
        minBooks: z.number().min(1),
        discountPercent: z.number().min(0).max(100),
        isActive: z.number().default(1),
      }))
      .mutation(async ({ input }) => {
        const id = await upsertBundleDeal({
          ...input,
          discountPercent: input.discountPercent.toFixed(2),
        } as any);
        return { id };
      }),

    deleteBundleDeal: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBundleDeal(input.id);
        return { success: true };
      }),

    // Order Summary
    orderSummaryKPIs: adminProcedure.query(() => getOrderSummaryKPIs()),

    orderSummaryList: adminProcedure
      .input(z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        dateFrom: z.coerce.date().optional(),
        dateTo: z.coerce.date().optional(),
        page: z.number().default(1),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => getOrdersWithItems(input)),

    uploadSlip: adminProcedure
      .input(z.object({
        orderId: z.number(),
        slipUrl: z.string().url(),
      }))
      .mutation(async ({ input }) => {
        await updateOrderSlip(input.orderId, input.slipUrl);
        return { success: true };
      }),
  }),

  // ─── Stripe payment ──────────────────────────────────────────────────────────
  stripe: router({
    createCheckoutSession: publicProcedure
      .input(z.object({
        orderId: z.number(),
        orderNumber: z.string(),
        items: z.array(z.object({
          bookTitleTh: z.string(),
          bookImage: z.string(),
          unitPrice: z.number(),
          quantity: z.number(),
        })),
        totalAmount: z.number(),
        customerEmail: z.string().email(),
        customerName: z.string(),
        origin: z.string(),
      }))
      .mutation(async ({ input }) => {
        const stripe = new Stripe(ENV.stripeSecretKey);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "payment",
          customer_email: input.customerEmail,
          allow_promotion_codes: true,
          client_reference_id: input.orderId.toString(),
          metadata: {
            order_id: input.orderId.toString(),
            order_number: input.orderNumber,
            customer_email: input.customerEmail,
            customer_name: input.customerName,
          },
          line_items: input.items.map(item => ({
            price_data: {
              currency: "thb",
              product_data: {
                name: item.bookTitleTh,
                images: [item.bookImage],
              },
              unit_amount: Math.round(item.unitPrice * 100),
            },
            quantity: item.quantity,
          })),
          success_url: `${input.origin}/order-success?orderNumber=${input.orderNumber}&payment=stripe`,
          cancel_url: `${input.origin}/?cancelled=1`,
        });
        return { url: session.url };
      }),
  }),

  // ─── Product Management (Admin) ─────────────────────────────────────────────
  products: router({
    list: publicProcedure.query(async () => {
      return getProducts({ isActive: true });
    }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getProductBySlug(input.slug);
      }),
    reviewsByBookId: publicProcedure
      .input(z.object({ bookId: z.number() }))
      .query(async ({ input }) => {
        return getReviewsByBookId(input.bookId);
      }),
    admin: router({
      create: adminProcedure
        .input(z.object({
          titleTh: z.string(),
          titleEn: z.string().optional(),
          slug: z.string(),
          description: z.string().optional(),
          descriptionTh: z.string().optional(),
          price: z.string(),
          discountPrice: z.string().optional(),
          imageUrl: z.string(),
          purchaseLink: z.string().optional(),
          category: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          return createProduct(input as any);
        }),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          titleTh: z.string().optional(),
          titleEn: z.string().optional(),
          slug: z.string().optional(),
          description: z.string().optional(),
          descriptionTh: z.string().optional(),
          price: z.string().optional(),
          discountPrice: z.string().optional(),
          imageUrl: z.string().optional(),
          purchaseLink: z.string().optional(),
          category: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...updates } = input;
          await updateProduct(id, updates as any);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await deleteProduct(input.id);
          return { success: true };
        }),
    }),
  }),

  // ─── Blog Management (Admin) ────────────────────────────────────────────────
  blog: router({
    list: publicProcedure
      .input(z.object({ page: z.number().optional(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getBlogPosts({ isPublished: true, page: input.page, limit: input.limit });
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return getBlogPostBySlug(input.slug);
      }),
    admin: router({
      create: adminProcedure
        .input(z.object({
          title: z.string(),
          slug: z.string(),
          content: z.string(),
          excerpt: z.string().optional(),
          imageUrl: z.string().optional(),
          category: z.string().optional(),
          author: z.string().optional(),
          isPublished: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          return createBlogPost({
            ...input,
            publishedAt: new Date(),
          });
        }),
      update: adminProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().optional(),
          slug: z.string().optional(),
          content: z.string().optional(),
          excerpt: z.string().optional(),
          imageUrl: z.string().optional(),
          category: z.string().optional(),
          author: z.string().optional(),
          isPublished: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...updates } = input;
          await updateBlogPost(id, updates);
          return { success: true };
        }),
      delete: adminProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => {
          await deleteBlogPost(input.id);
          return { success: true };
        }),
    }),
  }),
});
export type AppRouter = typeof appRouter;
