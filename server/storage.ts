// S3-compatible object storage helpers (AWS S3, Cloudflare R2, Backblaze B2, MinIO).
// Reads configuration from environment variables via ENV:
//   S3_ENDPOINT          (optional, for non-AWS providers)
//   S3_REGION            (default: "auto")
//   S3_BUCKET            (required)
//   S3_ACCESS_KEY_ID     (required)
//   S3_SECRET_ACCESS_KEY (required)
//   S3_PUBLIC_URL_BASE   (optional, e.g. https://cdn.example.com — if unset, falls back to pre-signed URL)

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;

  if (!ENV.s3Bucket || !ENV.s3AccessKeyId || !ENV.s3SecretAccessKey) {
    throw new Error(
      "S3 storage not configured: set S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY"
    );
  }

  _client = new S3Client({
    region: ENV.s3Region || "auto",
    endpoint: ENV.s3Endpoint || undefined,
    credentials: {
      accessKeyId: ENV.s3AccessKeyId,
      secretAccessKey: ENV.s3SecretAccessKey,
    },
    forcePathStyle: Boolean(ENV.s3Endpoint), // required for MinIO/R2 custom endpoints
  });

  return _client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function buildPublicUrl(key: string): string | null {
  if (!ENV.s3PublicUrlBase) return null;
  const base = ENV.s3PublicUrlBase.replace(/\/+$/, "");
  return `${base}/${key}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getClient();
  const key = normalizeKey(relKey);

  const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);

  await client.send(
    new PutObjectCommand({
      Bucket: ENV.s3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  const publicUrl = buildPublicUrl(key);
  if (publicUrl) {
    return { key, url: publicUrl };
  }

  // No public URL base configured — fall back to pre-signed GET URL (7 days)
  const signed = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: key }),
    { expiresIn: 60 * 60 * 24 * 7 }
  );
  return { key, url: signed };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const client = getClient();
  const key = normalizeKey(relKey);

  const publicUrl = buildPublicUrl(key);
  if (publicUrl) {
    return { key, url: publicUrl };
  }

  const signed = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: key }),
    { expiresIn: 60 * 60 * 24 * 7 }
  );
  return { key, url: signed };
}
