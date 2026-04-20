import { and, count, desc, eq, gte, like, lte, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { bookReviews, blogPosts, bundleDeals, InsertBlogPost, InsertBundleDeal, InsertOrder, InsertOrderItem, InsertProduct, InsertUser, orderItems, orders, products, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function getUserCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const [row] = await db.select({ cnt: count() }).from(users);
  return row?.cnt ?? 0;
}

export async function promoteUserToAdmin(openId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role: 'admin' }).where(eq(users.openId, openId));
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    // Determine if this user should be admin:
    // 1. Always admin if their email is listed in ADMIN_EMAILS
    // 2. Admin if they are the very first user ever registered
    let shouldBeAdmin = Boolean(user.email && ENV.adminEmails.includes(user.email));
    if (!shouldBeAdmin) {
      const existingUser = await getUserByOpenId(user.openId);
      if (!existingUser) {
        // New user — check if they are the first one
        const userCount = await getUserCount();
        if (userCount === 0) {
          shouldBeAdmin = true;
          console.log(`[Auth] First user ${user.openId} auto-promoted to admin`);
        }
      } else {
        // Existing user — preserve their current role (don't downgrade admins)
        if (existingUser.role === 'admin') shouldBeAdmin = true;
      }
    }

    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (shouldBeAdmin) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Order helpers ───────────────────────────────────────────────────────────

export function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${year}${month}${day}${random}`;
}

export async function createOrder(
  order: Omit<InsertOrder, 'id' | 'createdAt' | 'updatedAt'>,
  items: Omit<InsertOrderItem, 'id' | 'orderId' | 'createdAt'>[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(orders).values(order);
  const [inserted] = await db.select().from(orders).where(eq(orders.orderNumber, order.orderNumber)).limit(1);
  if (!inserted) throw new Error("Failed to create order");

  if (items.length > 0) {
    await db.insert(orderItems).values(items.map(item => ({ ...item, orderId: inserted.id })));
  }

  return inserted;
}

export async function getOrders(filters?: {
  status?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { orders: [], total: 0 };

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(orders.status, filters.status as any));
  }
  if (filters?.search) {
    conditions.push(
      sql`(${orders.orderNumber} LIKE ${`%${filters.search}%`} OR ${orders.customerName} LIKE ${`%${filters.search}%`} OR ${orders.customerEmail} LIKE ${`%${filters.search}%`})`
    );
  }
  if (filters?.dateFrom) {
    conditions.push(gte(orders.createdAt, filters.dateFrom));
  }
  if (filters?.dateTo) {
    conditions.push(lte(orders.createdAt, filters.dateTo));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [countRow]] = await Promise.all([
    db.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(orders).where(whereClause),
  ]);

  return { orders: rows, total: countRow?.total ?? 0 };
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) return null;

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return { ...order, items };
}

export async function updateOrderStatus(id: number, status: string, trackingNumber?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = { status };
  if (trackingNumber !== undefined) {
    updateData.trackingNumber = trackingNumber;
  }

  await db.update(orders).set(updateData as any).where(eq(orders.id, id));
}

export async function updateOrderNotes(id: number, notes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ notes }).where(eq(orders.id, id));
}

export async function updateOrderSlip(id: number, slipUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ slipUrl, slipUploadedAt: new Date() }).where(eq(orders.id, id));
}

// ─── Analytics helpers ───────────────────────────────────────────────────────

export async function getSalesAnalytics(dateFrom?: Date, dateTo?: Date) {
  const db = await getDb();
  if (!db) return null;

  const conditions = [];
  if (dateFrom) conditions.push(gte(orders.createdAt, dateFrom));
  if (dateTo) conditions.push(lte(orders.createdAt, dateTo));

  const notCancelledConditions = [...conditions, sql`${orders.status} != 'cancelled'`];
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const notCancelledWhere = and(...notCancelledConditions);

  const [totalRow] = await db.select({
    totalRevenue: sum(orders.totalAmount),
    totalOrders: count(),
  }).from(orders).where(notCancelledWhere);

  const [pendingRow] = await db.select({ cnt: count() }).from(orders).where(
    and(...[...conditions, eq(orders.status, 'pending')])
  );
  const [paidRow] = await db.select({ cnt: count() }).from(orders).where(
    and(...[...conditions, eq(orders.status, 'paid')])
  );
  const [processingRow] = await db.select({ cnt: count() }).from(orders).where(
    and(...[...conditions, eq(orders.status, 'processing')])
  );
  const [shippedRow] = await db.select({ cnt: count() }).from(orders).where(
    and(...[...conditions, eq(orders.status, 'shipped')])
  );
  const [deliveredRow] = await db.select({ cnt: count() }).from(orders).where(
    and(...[...conditions, eq(orders.status, 'delivered')])
  );
  const [cancelledRow] = await db.select({ cnt: count() }).from(orders).where(
    and(...[...conditions, eq(orders.status, 'cancelled')])
  );

  // Top selling books
  const topBooks = await db.select({
    bookId: orderItems.bookId,
    bookTitleTh: orderItems.bookTitleTh,
    bookTitleEn: orderItems.bookTitleEn,
    bookImage: orderItems.bookImage,
    totalQty: sum(orderItems.quantity),
    totalRevenue: sum(orderItems.subtotal),
  }).from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(sql`${orders.status} != 'cancelled'`)
    .groupBy(orderItems.bookId, orderItems.bookTitleTh, orderItems.bookTitleEn, orderItems.bookImage)
    .orderBy(desc(sum(orderItems.quantity)))
    .limit(5);

  // Daily revenue for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  // Use sql.raw() with table-qualified column to satisfy TiDB's only_full_group_by mode.
  // Without table prefix, Drizzle generates DATE_FORMAT(`createdAt`,...) in SELECT but
  // DATE_FORMAT(`orders`.`createdAt`,...) in GROUP BY — TiDB treats them as different expressions.
  const dateExpr = sql.raw("DATE_FORMAT(`orders`.`createdAt`, '%Y-%m-%d')");
  const dailyRevenue = await db.select({
    date: sql<string>`${dateExpr}`,
    revenue: sum(orders.totalAmount),
    orderCount: count(),
  }).from(orders)
    .where(and(gte(orders.createdAt, thirtyDaysAgo), sql`${orders.status} != 'cancelled'`))
    .groupBy(sql`${dateExpr}`)
    .orderBy(sql`${dateExpr}`);

  return {
    totalRevenue: Number(totalRow?.totalRevenue ?? 0),
    totalOrders: totalRow?.totalOrders ?? 0,
    statusBreakdown: {
      pending: pendingRow?.cnt ?? 0,
      paid: paidRow?.cnt ?? 0,
      processing: processingRow?.cnt ?? 0,
      shipped: shippedRow?.cnt ?? 0,
      delivered: deliveredRow?.cnt ?? 0,
      cancelled: cancelledRow?.cnt ?? 0,
    },
    topBooks: topBooks.map(b => ({
      bookId: b.bookId,
      bookTitleTh: b.bookTitleTh,
      bookTitleEn: b.bookTitleEn,
      bookImage: b.bookImage,
      totalQty: Number(b.totalQty ?? 0),
      totalRevenue: Number(b.totalRevenue ?? 0),
    })),
    dailyRevenue: dailyRevenue.map(d => ({
      date: d.date,
      revenue: Number(d.revenue ?? 0),
      orderCount: d.orderCount,
    })),
  };
}

// ─── Order Summary KPI helper ───────────────────────────────────────────────

export async function getOrderSummaryKPIs() {
  const db = await getDb();
  if (!db) return { todayRevenue: 0, totalOrders: 0, pendingOrders: 0, ordersWithSlip: 0 };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [[todayRow], [totalRow], [pendingRow], [slipRow]] = await Promise.all([
    db.select({ revenue: sum(orders.totalAmount) }).from(orders)
      .where(and(gte(orders.createdAt, todayStart), lte(orders.createdAt, todayEnd), sql`${orders.status} != 'cancelled'`)),
    db.select({ cnt: count() }).from(orders).where(sql`${orders.status} != 'cancelled'`),
    db.select({ cnt: count() }).from(orders).where(eq(orders.status, 'pending')),
    db.select({ cnt: count() }).from(orders).where(sql`${orders.slipUrl} IS NOT NULL AND ${orders.status} = 'pending'`),
  ]);

  return {
    todayRevenue: Number(todayRow?.revenue ?? 0),
    totalOrders: totalRow?.cnt ?? 0,
    pendingOrders: pendingRow?.cnt ?? 0,
    ordersWithSlip: slipRow?.cnt ?? 0,
  };
}

export async function getOrdersWithItems(filters?: {
  status?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return { orders: [], total: 0 };

  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(orders.status, filters.status as any));
  }
  if (filters?.search) {
    conditions.push(
      sql`(${orders.orderNumber} LIKE ${`%${filters.search}%`} OR ${orders.customerName} LIKE ${`%${filters.search}%`} OR ${orders.customerEmail} LIKE ${`%${filters.search}%`} OR ${orders.customerPhone} LIKE ${`%${filters.search}%`})`
    );
  }
  if (filters?.dateFrom) {
    conditions.push(gte(orders.createdAt, filters.dateFrom));
  }
  if (filters?.dateTo) {
    conditions.push(lte(orders.createdAt, filters.dateTo));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [countRow]] = await Promise.all([
    db.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(orders).where(whereClause),
  ]);

  // Fetch items for each order
  const orderIds = rows.map(o => o.id);
  let allItems: (typeof orderItems.$inferSelect)[] = [];
  if (orderIds.length > 0) {
    allItems = await db.select().from(orderItems).where(
      sql`${orderItems.orderId} IN (${sql.join(orderIds.map(id => sql`${id}`), sql`, `)})`
    );
  }

  const itemsByOrderId = new Map<number, typeof allItems>();
  for (const item of allItems) {
    if (!itemsByOrderId.has(item.orderId)) itemsByOrderId.set(item.orderId, []);
    itemsByOrderId.get(item.orderId)!.push(item);
  }

  return {
    orders: rows.map(o => ({ ...o, items: itemsByOrderId.get(o.id) ?? [] })),
    total: countRow?.total ?? 0,
  };
}

// ─── Bundle deal helpers ─────────────────────────────────────────────────────

export async function getBundleDeals(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];

  const conditions = activeOnly ? [eq(bundleDeals.isActive, 1)] : [];
  return db.select().from(bundleDeals).where(conditions.length > 0 ? and(...conditions) : undefined).orderBy(bundleDeals.minBooks);
}

export async function upsertBundleDeal(deal: InsertBundleDeal & { id?: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (deal.id) {
    const { id, ...data } = deal;
    await db.update(bundleDeals).set(data as any).where(eq(bundleDeals.id, id));
    return id;
  } else {
    await db.insert(bundleDeals).values(deal as InsertBundleDeal);
    const [inserted] = await db.select().from(bundleDeals).orderBy(desc(bundleDeals.id)).limit(1);
    return inserted?.id;
  }
}

export async function deleteBundleDeal(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(bundleDeals).where(eq(bundleDeals.id, id));
}

// ─── Book Reviews helpers ────────────────────────────────────────────────────

export async function getReviewsByBookId(bookId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bookReviews).where(eq(bookReviews.bookId, bookId)).orderBy(desc(bookReviews.createdAt));
}

// ─── Product helpers ────────────────────────────────────────────────────────

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(products).values(product);
  const [inserted] = await db.select().from(products).where(eq(products.slug, product.slug)).limit(1);
  return inserted;
}

export async function getProducts(filters?: { category?: string; isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters?.isActive !== undefined) {
    conditions.push(eq(products.isActive, filters.isActive ? 1 : 0));
  }
  if (filters?.category) {
    conditions.push(eq(products.category, filters.category));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  return db.select().from(products).where(whereClause).orderBy(desc(products.createdAt));
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return product || null;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return product || null;
}

export async function updateProduct(id: number, updates: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(updates).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

// ─── Blog post helpers ──────────────────────────────────────────────────────

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(blogPosts).values(post);
  const [inserted] = await db.select().from(blogPosts).where(eq(blogPosts.slug, post.slug)).limit(1);
  return inserted;
}

export async function getBlogPosts(filters?: { category?: string; isPublished?: boolean; page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { posts: [], total: 0 };
  
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 10;
  const offset = (page - 1) * limit;
  
  const conditions = [];
  if (filters?.isPublished !== undefined) {
    conditions.push(eq(blogPosts.isPublished, filters.isPublished ? 1 : 0));
  }
  if (filters?.category) {
    conditions.push(eq(blogPosts.category, filters.category));
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  
  const [rows, [countRow]] = await Promise.all([
    db.select().from(blogPosts).where(whereClause).orderBy(desc(blogPosts.publishedAt || blogPosts.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(blogPosts).where(whereClause),
  ]);
  
  return { posts: rows, total: countRow?.total ?? 0 };
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  if (post) {
    // Increment view count
    await db.update(blogPosts).set({ viewCount: (post.viewCount || 0) + 1 }).where(eq(blogPosts.id, post.id));
  }
  return post || null;
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return post || null;
}

export async function updateBlogPost(id: number, updates: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

export async function getOrdersByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.customerEmail, email))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  // Fetch items for each order
  const ordersWithItems = await Promise.all(
    rows.map(async (order) => {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    })
  );

  return ordersWithItems;
}

export async function markOrderPaid(orderId: number, stripePaymentIntentId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(orders)
    .set({ status: "paid", stripePaymentIntentId, updatedAt: new Date() })
    .where(eq(orders.id, orderId));
}
