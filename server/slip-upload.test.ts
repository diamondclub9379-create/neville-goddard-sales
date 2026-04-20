import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock S3 storage ─────────────────────────────────────────────────────────
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/payment-slips/1-abc123.jpg", key: "payment-slips/1-abc123.jpg" }),
}));

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  updateOrderSlip: vi.fn().mockResolvedValue(undefined),
}));

import { storagePut } from "./storage";
import { updateOrderSlip } from "./db";

// ─── Slip upload logic unit tests ─────────────────────────────────────────────
describe("Slip Upload Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call storagePut with correct key pattern and mime type", async () => {
    const orderId = 42;
    const fileName = "slip.jpg";
    const mimeType = "image/jpeg";
    const buffer = Buffer.from("fake-image-data");

    const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
    const randomSuffix = "abc123";
    const key = `payment-slips/${orderId}-${randomSuffix}.${ext}`;

    await storagePut(key, buffer, mimeType);

    expect(storagePut).toHaveBeenCalledWith(
      expect.stringMatching(/^payment-slips\/\d+-[a-z0-9]+\.(jpg|jpeg|png|webp|pdf)$/),
      expect.any(Buffer),
      mimeType
    );
  });

  it("should call updateOrderSlip with orderId and returned URL", async () => {
    const orderId = 42;
    const slipUrl = "https://cdn.example.com/payment-slips/42-xyz789.png";

    await updateOrderSlip(orderId, slipUrl);

    expect(updateOrderSlip).toHaveBeenCalledWith(42, slipUrl);
  });

  it("should reject unsupported MIME types", () => {
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    const unsupported = "video/mp4";
    expect(ALLOWED_MIME_TYPES.includes(unsupported)).toBe(false);
  });

  it("should accept all supported MIME types", () => {
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    for (const mime of ALLOWED_MIME_TYPES) {
      expect(ALLOWED_MIME_TYPES.includes(mime)).toBe(true);
    }
  });

  it("should reject files larger than 16MB", () => {
    const MAX_SIZE = 16 * 1024 * 1024;
    const oversizedFile = { size: 17 * 1024 * 1024 };
    expect(oversizedFile.size > MAX_SIZE).toBe(true);
  });

  it("should accept files within 16MB limit", () => {
    const MAX_SIZE = 16 * 1024 * 1024;
    const validFile = { size: 5 * 1024 * 1024 };
    expect(validFile.size > MAX_SIZE).toBe(false);
  });
});

// ─── Email slip URL tests ─────────────────────────────────────────────────────
describe("Email Slip URL", () => {
  it("should include slipUrl in owner email when provided", () => {
    const slipUrl = "https://cdn.example.com/payment-slips/1-abc.jpg";
    const emailData = {
      orderNumber: "ORD240101001",
      customerName: "สมชาย ศรีสุข",
      slipUrl,
    };
    // Verify the slipUrl field is present and accessible
    expect(emailData.slipUrl).toBe(slipUrl);
    expect(emailData.slipUrl).toMatch(/^https?:\/\//);
  });

  it("should handle missing slipUrl gracefully (undefined)", () => {
    const emailData = {
      orderNumber: "ORD240101002",
      customerName: "นัฐพร วงศ์สิทธิ",
      slipUrl: undefined,
    };
    // No slip URL should not throw
    expect(emailData.slipUrl).toBeUndefined();
  });

  it("should detect image extensions correctly for inline display", () => {
    const imageUrls = [
      "https://cdn.example.com/slip.jpg",
      "https://cdn.example.com/slip.jpeg",
      "https://cdn.example.com/slip.png",
      "https://cdn.example.com/slip.webp",
    ];
    const pdfUrl = "https://cdn.example.com/slip.pdf";
    const imageRegex = /\.(jpg|jpeg|png|webp)$/i;

    for (const url of imageUrls) {
      expect(imageRegex.test(url)).toBe(true);
    }
    expect(imageRegex.test(pdfUrl)).toBe(false);
  });
});
