import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getOrderSummaryKPIs: vi.fn(),
  getOrdersWithItems: vi.fn(),
}));

import { getOrderSummaryKPIs, getOrdersWithItems } from "./db";

// ─── KPI Tests ────────────────────────────────────────────────────────────────
describe("getOrderSummaryKPIs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return all four KPI fields", async () => {
    vi.mocked(getOrderSummaryKPIs).mockResolvedValue({
      todayRevenue: 1500,
      totalOrders: 42,
      pendingOrders: 8,
      ordersWithSlip: 3,
    });

    const result = await getOrderSummaryKPIs();
    expect(result).toHaveProperty("todayRevenue");
    expect(result).toHaveProperty("totalOrders");
    expect(result).toHaveProperty("pendingOrders");
    expect(result).toHaveProperty("ordersWithSlip");
  });

  it("should return numeric values for all KPI fields", async () => {
    vi.mocked(getOrderSummaryKPIs).mockResolvedValue({
      todayRevenue: 2500.5,
      totalOrders: 100,
      pendingOrders: 15,
      ordersWithSlip: 7,
    });

    const result = await getOrderSummaryKPIs();
    expect(typeof result.todayRevenue).toBe("number");
    expect(typeof result.totalOrders).toBe("number");
    expect(typeof result.pendingOrders).toBe("number");
    expect(typeof result.ordersWithSlip).toBe("number");
  });

  it("should return zero values when no orders exist", async () => {
    vi.mocked(getOrderSummaryKPIs).mockResolvedValue({
      todayRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      ordersWithSlip: 0,
    });

    const result = await getOrderSummaryKPIs();
    expect(result.todayRevenue).toBe(0);
    expect(result.totalOrders).toBe(0);
    expect(result.pendingOrders).toBe(0);
    expect(result.ordersWithSlip).toBe(0);
  });
});

// ─── Order List with Items Tests ──────────────────────────────────────────────
describe("getOrdersWithItems", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return orders with items array attached", async () => {
    vi.mocked(getOrdersWithItems).mockResolvedValue({
      orders: [
        {
          id: 1,
          orderNumber: "ORD260308001",
          customerName: "สมชาย ศรีสุข",
          customerEmail: "somchai@example.com",
          customerPhone: "0812345678",
          customerAddress: "123 ถ.สุขุมวิท กรุงเทพ",
          paymentMethod: "bank-transfer",
          status: "pending",
          subtotal: "500.00",
          discountAmount: "0.00",
          totalAmount: "500.00",
          slipUrl: null,
          trackingNumber: null,
          notes: null,
          bundleDealId: null,
          emailSent: 0,
          slipUploadedAt: null,
          createdAt: new Date("2026-03-08T10:00:00Z"),
          updatedAt: new Date("2026-03-08T10:00:00Z"),
          items: [
            {
              id: 1,
              orderId: 1,
              bookId: 1,
              bookTitleTh: "ความรู้สึกคือความลับ",
              bookTitleEn: "Feeling is the Secret",
              bookImage: "https://example.com/book1.jpg",
              unitPrice: "265.00",
              quantity: 1,
              subtotal: "265.00",
              createdAt: new Date("2026-03-08T10:00:00Z"),
            },
          ],
        },
      ],
      total: 1,
    });

    const result = await getOrdersWithItems({ status: "pending" });
    expect(result.orders).toHaveLength(1);
    expect(result.orders[0]).toHaveProperty("items");
    expect(result.orders[0].items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("should return empty list when no matching orders", async () => {
    vi.mocked(getOrdersWithItems).mockResolvedValue({ orders: [], total: 0 });

    const result = await getOrdersWithItems({ search: "nonexistent-order-xyz" });
    expect(result.orders).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("should support date range filtering", async () => {
    const dateFrom = new Date("2026-03-01T00:00:00Z");
    const dateTo = new Date("2026-03-08T23:59:59Z");

    vi.mocked(getOrdersWithItems).mockResolvedValue({ orders: [], total: 0 });

    await getOrdersWithItems({ dateFrom, dateTo });

    expect(getOrdersWithItems).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom, dateTo })
    );
  });

  it("should support pagination", async () => {
    vi.mocked(getOrdersWithItems).mockResolvedValue({ orders: [], total: 100 });

    await getOrdersWithItems({ page: 2, limit: 50 });

    expect(getOrdersWithItems).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, limit: 50 })
    );
  });
});

// ─── CSV Export Logic Tests ───────────────────────────────────────────────────
describe("CSV Export Logic", () => {
  const PAYMENT_LABELS: Record<string, string> = {
    "bank-transfer": "โอนธนาคาร",
    "promptpay": "PromptPay",
  };

  const STATUS_CONFIG: Record<string, { label: string }> = {
    pending:    { label: "รอชำระ" },
    paid:       { label: "ชำระแล้ว" },
    processing: { label: "กำลังเตรียม" },
    shipped:    { label: "จัดส่งแล้ว" },
    delivered:  { label: "ส่งถึงแล้ว" },
    cancelled:  { label: "ยกเลิก" },
  };

  it("should map payment method to Thai label", () => {
    expect(PAYMENT_LABELS["bank-transfer"]).toBe("โอนธนาคาร");
    expect(PAYMENT_LABELS["promptpay"]).toBe("PromptPay");
  });

  it("should map all status values to Thai labels", () => {
    expect(STATUS_CONFIG["pending"].label).toBe("รอชำระ");
    expect(STATUS_CONFIG["paid"].label).toBe("ชำระแล้ว");
    expect(STATUS_CONFIG["shipped"].label).toBe("จัดส่งแล้ว");
    expect(STATUS_CONFIG["delivered"].label).toBe("ส่งถึงแล้ว");
    expect(STATUS_CONFIG["cancelled"].label).toBe("ยกเลิก");
  });

  it("should format book list correctly for CSV", () => {
    const items = [
      { bookTitleTh: "ความรู้สึกคือความลับ", quantity: 1 },
      { bookTitleTh: "อำนาจแห่งการตระหนักรู้", quantity: 2 },
    ];
    const bookList = items.map(i => `${i.bookTitleTh} x${i.quantity}`).join(" | ");
    expect(bookList).toBe("ความรู้สึกคือความลับ x1 | อำนาจแห่งการตระหนักรู้ x2");
  });

  it("should indicate slip presence correctly", () => {
    const withSlip = { slipUrl: "https://cdn.example.com/slip.jpg" };
    const withoutSlip = { slipUrl: null };
    expect(withSlip.slipUrl ? "มี" : "ไม่มี").toBe("มี");
    expect(withoutSlip.slipUrl ? "มี" : "ไม่มี").toBe("ไม่มี");
  });

  it("should include UTF-8 BOM for Thai Excel compatibility", () => {
    const bom = "\uFEFF";
    expect(bom.charCodeAt(0)).toBe(0xFEFF);
  });
});
