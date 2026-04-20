import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** OAuth identifier — Google `sub` claim. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orders table - stores customer orders
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  customerAddress: text("customerAddress").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["bank-transfer", "promptpay", "credit-card"]).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "processing", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  bundleDealId: int("bundleDealId"),
  shippingFee: decimal("shippingFee", { precision: 10, scale: 2 }).default("0").notNull(),
  discountTier: varchar("discountTier", { length: 32 }),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  notes: text("notes"),
  emailSent: int("emailSent").default(0).notNull(),
  slipUrl: text("slipUrl"),
  slipUploadedAt: timestamp("slipUploadedAt"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table - stores individual books in each order
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  bookId: int("bookId").notNull(),
  bookTitleTh: varchar("bookTitleTh", { length: 255 }).notNull(),
  bookTitleEn: varchar("bookTitleEn", { length: 255 }).notNull(),
  bookImage: text("bookImage").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  quantity: int("quantity").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Bundle deals table - stores discount packages
 */
export const bundleDeals = mysqlTable("bundleDeals", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nameTh: varchar("nameTh", { length: 255 }).notNull(),
  description: text("description"),
  descriptionTh: text("descriptionTh"),
  minBooks: int("minBooks").notNull(),
  discountPercent: decimal("discountPercent", { precision: 5, scale: 2 }).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BundleDeal = typeof bundleDeals.$inferSelect;
export type InsertBundleDeal = typeof bundleDeals.$inferInsert;

/**
 * Book reviews table - stores customer reviews per book
 */
export const bookReviews = mysqlTable("bookReviews", {
  id: int("id").autoincrement().primaryKey(),
  bookId: int("bookId").notNull(),
  reviewerName: varchar("reviewerName", { length: 100 }).notNull(),
  rating: int("rating").notNull(), // 1-5
  content: text("content").notNull(),
  isVerified: int("isVerified").default(1).notNull(), // 1 = verified purchase
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BookReview = typeof bookReviews.$inferSelect;
export type InsertBookReview = typeof bookReviews.$inferInsert;

/**
 * Products table - stores books/products for sale
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  titleTh: varchar("titleTh", { length: 255 }).notNull(),
  titleEn: varchar("titleEn", { length: 255 }),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  descriptionTh: text("descriptionTh"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: decimal("discountPrice", { precision: 10, scale: 2 }),
  imageUrl: text("imageUrl").notNull(), // S3 CDN URL
  purchaseLink: text("purchaseLink"), // Gumroad or other platform link
  category: varchar("category", { length: 100 }), // e.g., "manifestation", "love", "money"
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Blog posts table - stores articles/blog content
 */
export const blogPosts = mysqlTable("blogPosts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(), // Rich text HTML content
  excerpt: text("excerpt"), // Short preview text
  imageUrl: text("imageUrl"), // Featured image S3 URL
  category: varchar("category", { length: 100 }), // e.g., "teaching", "technique", "inspiration"
  author: varchar("author", { length: 100 }), // Author name
  isPublished: int("isPublished").default(1).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"), // Separate from createdAt for scheduling
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;