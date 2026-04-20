import { describe, it, expect, vi, beforeEach } from "vitest";

// Shared mock send function — must be declared before vi.mock hoisting
const mockSend = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

vi.mock("./_core/env", () => ({
  ENV: {
    resendApiKey: "re_test_mock_key_123",
  },
}));

import { sendOrderConfirmationEmail, type OrderEmailData } from "./email";

const sampleOrder: OrderEmailData = {
  orderNumber: "ORD260308001",
  customerName: "สมชาย ใจดี",
  customerEmail: "somchai@example.com",
  customerPhone: "0812345678",
  customerAddress: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
  paymentMethod: "bank-transfer",
  items: [
    {
      titleTh: "ความรู้สึกคือความลับ",
      titleEn: "Feeling is the Secret",
      quantity: 1,
      price: 265,
    },
    {
      titleTh: "อำนาจแห่งการตระหนักรู้",
      titleEn: "The Power of Awareness",
      quantity: 2,
      price: 467,
      discountedPrice: 374,
    },
  ],
  total: 1013,
  createdAt: new Date("2026-03-08T10:00:00Z"),
};

describe("Email Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: successful send
    mockSend.mockResolvedValue({ data: { id: "mock-email-id" }, error: null });
  });

  it("should return success when emails are sent successfully", async () => {
    const result = await sendOrderConfirmationEmail(sampleOrder);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should call send twice (customer + owner)", async () => {
    await sendOrderConfirmationEmail(sampleOrder);
    expect(mockSend).toHaveBeenCalledTimes(2);
  });

  it("should send customer email to the correct address", async () => {
    await sendOrderConfirmationEmail(sampleOrder);
    const firstCall = mockSend.mock.calls[0]?.[0];
    expect(firstCall?.to).toContain("somchai@example.com");
  });

  it("should send owner notification to owner@nevillebooks.com", async () => {
    await sendOrderConfirmationEmail(sampleOrder);
    const secondCall = mockSend.mock.calls[1]?.[0];
    expect(secondCall?.to).toContain("owner@nevillebooks.com");
  });

  it("should include order number in customer email subject", async () => {
    await sendOrderConfirmationEmail(sampleOrder);
    const firstCall = mockSend.mock.calls[0]?.[0];
    expect(firstCall?.subject).toContain("ORD260308001");
  });

  it("should include customer name in owner notification subject", async () => {
    await sendOrderConfirmationEmail(sampleOrder);
    const secondCall = mockSend.mock.calls[1]?.[0];
    expect(secondCall?.subject).toContain("สมชาย ใจดี");
  });

  it("should return failure with error message when Resend returns an error", async () => {
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid API key", name: "validation_error" },
    });

    const result = await sendOrderConfirmationEmail(sampleOrder);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid API key");
  });

  it("should return failure gracefully when send throws an exception", async () => {
    mockSend.mockRejectedValueOnce(new Error("Network error"));
    const result = await sendOrderConfirmationEmail(sampleOrder);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Network error");
  });

  it("should include bundle discount indicator in customer email HTML", async () => {
    await sendOrderConfirmationEmail(sampleOrder);
    const firstCall = mockSend.mock.calls[0]?.[0];
    // The HTML template shows "Bundle" badge for discounted items
    expect(firstCall?.html).toContain("Bundle");
  });

  it("should show correct payment method label for promptpay", async () => {
    await sendOrderConfirmationEmail({
      ...sampleOrder,
      paymentMethod: "promptpay",
    });
    const firstCall = mockSend.mock.calls[0]?.[0];
    expect(firstCall?.html).toContain("พร้อมเพย์");
  });

  it("should still return success even if owner email fails (non-critical)", async () => {
    // First call (customer) succeeds, second call (owner) fails
    mockSend
      .mockResolvedValueOnce({ data: { id: "cust-id" }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "Owner email failed", name: "error" } });

    const result = await sendOrderConfirmationEmail(sampleOrder);
    // Customer email succeeded, so overall should be success
    expect(result.success).toBe(true);
  });
});
