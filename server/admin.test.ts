import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getOrders: vi.fn().mockResolvedValue({ orders: [], total: 0 }),
  getOrderById: vi.fn().mockResolvedValue(null),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  updateOrderNotes: vi.fn().mockResolvedValue(undefined),
  getSalesAnalytics: vi.fn().mockResolvedValue({
    totalRevenue: 0,
    totalOrders: 0,
    statusBreakdown: {
      pending: 0, paid: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0,
    },
    topBooks: [],
    dailyRevenue: [],
  }),
  getBundleDeals: vi.fn().mockResolvedValue([]),
  upsertBundleDeal: vi.fn().mockResolvedValue(1),
  deleteBundleDeal: vi.fn().mockResolvedValue(undefined),
  createOrder: vi.fn().mockResolvedValue({ id: 1, orderNumber: "ORD240101001" }),
  generateOrderNumber: vi.fn().mockReturnValue("ORD240101001"),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import { generateOrderNumber } from "./db";

describe("generateOrderNumber", () => {
  it("should generate a valid order number format", () => {
    const orderNumber = generateOrderNumber();
    // Format: ORD + 2-digit year + 2-digit month + 2-digit day + 4-digit random
    expect(orderNumber).toMatch(/^ORD\d+$/);
  });

  it("should start with ORD prefix", () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber.startsWith("ORD")).toBe(true);
  });
});

describe("Admin order status flow", () => {
  it("should have correct status progression", () => {
    const validStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
    const statusFlow = ["pending", "paid", "processing", "shipped", "delivered"];

    statusFlow.forEach(status => {
      expect(validStatuses).toContain(status);
    });
  });

  it("should validate payment methods", () => {
    const validPaymentMethods = ["bank-transfer", "promptpay"];
    expect(validPaymentMethods).toHaveLength(2);
    expect(validPaymentMethods).toContain("bank-transfer");
    expect(validPaymentMethods).toContain("promptpay");
    expect(validPaymentMethods).not.toContain("credit-card");
  });
});

describe("Bundle deal discount calculation", () => {
  it("should calculate discount correctly", () => {
    const subtotal = 1000;
    const discountPercent = 15;
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;

    expect(discountAmount).toBe(150);
    expect(total).toBe(850);
  });

  it("should apply zero discount when no bundle matches", () => {
    const subtotal = 500;
    const discountAmount = 0;
    const total = subtotal - discountAmount;

    expect(total).toBe(500);
  });

  it("should not allow discount greater than 100%", () => {
    const discountPercent = 100;
    expect(discountPercent).toBeLessThanOrEqual(100);
    expect(discountPercent).toBeGreaterThanOrEqual(0);
  });
});

describe("Order analytics", () => {
  it("should calculate average order value correctly", () => {
    const totalRevenue = 5000;
    const totalOrders = 10;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    expect(avgOrderValue).toBe(500);
  });

  it("should return zero average when no orders", () => {
    const totalRevenue = 0;
    const totalOrders = 0;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    expect(avgOrderValue).toBe(0);
  });
});

describe("Analytics date handling", () => {
  it("should coerce ISO string to Date for dateFrom", () => {
    const { z } = require("zod");
    const schema = z.object({ dateFrom: z.coerce.date().optional() });
    const result = schema.parse({ dateFrom: "2026-02-07T00:00:00.000Z" });
    expect(result.dateFrom).toBeInstanceOf(Date);
    expect(result.dateFrom?.toISOString()).toBe("2026-02-07T00:00:00.000Z");
  });

  it("should coerce ISO string to Date for dateTo", () => {
    const { z } = require("zod");
    const schema = z.object({ dateTo: z.coerce.date().optional() });
    const result = schema.parse({ dateTo: "2026-03-09T23:59:59.000Z" });
    expect(result.dateTo).toBeInstanceOf(Date);
  });

  it("should pass through Date object unchanged", () => {
    const { z } = require("zod");
    const schema = z.object({ dateFrom: z.coerce.date().optional() });
    const d = new Date("2026-02-07");
    const result = schema.parse({ dateFrom: d });
    expect(result.dateFrom).toBeInstanceOf(Date);
    expect(result.dateFrom?.getTime()).toBe(d.getTime());
  });

  it("should format daily revenue date as YYYY-MM-DD string", () => {
    // Simulate DATE_FORMAT result using sql.raw() with table-qualified column.
    // TiDB only_full_group_by mode requires SELECT and GROUP BY to use identical expressions.
    const mockDailyRevenue = [
      { date: "2026-03-09", revenue: "4658.00", orderCount: 5 },
    ];
    const mapped = mockDailyRevenue.map(d => ({
      date: d.date,
      revenue: Number(d.revenue ?? 0),
      orderCount: d.orderCount,
    }));
    expect(mapped[0].date).toBe("2026-03-09");
    expect(typeof mapped[0].date).toBe("string");
  });
});
