/**
 * Slip upload route — POST /api/upload/slip
 * Accepts multipart/form-data with fields: file (image/pdf), orderId (number)
 * Stores the file in S3 and updates the order record with the slip URL.
 */
import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { updateOrderSlip } from "./db";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE_BYTES = 16 * 1024 * 1024; // 16 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: jpg, png, webp, pdf`));
    }
  },
});

export function registerSlipUploadRoute(app: Router) {
  app.post(
    "/api/upload/slip",
    upload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          res.status(400).json({ error: "No file provided" });
          return;
        }

        const orderId = parseInt(req.body?.orderId ?? "0", 10);
        if (!orderId || isNaN(orderId)) {
          res.status(400).json({ error: "Invalid or missing orderId" });
          return;
        }

        // Build a unique S3 key so files cannot be enumerated
        const ext = req.file.originalname.split(".").pop()?.toLowerCase() ?? "jpg";
        const randomSuffix = Math.random().toString(36).slice(2, 10);
        const key = `payment-slips/${orderId}-${randomSuffix}.${ext}`;

        const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);

        // Persist the URL in the database
        await updateOrderSlip(orderId, url);

        res.json({ success: true, url });
      } catch (err: any) {
        console.error("[SlipUpload] Error:", err);
        res.status(500).json({ error: err?.message ?? "Upload failed" });
      }
    }
  );
}
