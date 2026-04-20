export const ENV = {
  // Session / JWT
  cookieSecret: process.env.JWT_SECRET ?? "",

  // Database (MySQL / TiDB)
  databaseUrl: process.env.DATABASE_URL ?? "",

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // Absolute base URL of this deployment, used to build the OAuth redirect_uri.
  // Example: https://shop.example.com — no trailing slash required.
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? "",

  // Owner / admin promotion
  // Comma-separated list of Google emails that should always be treated as admin.
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  // Runtime
  isProduction: process.env.NODE_ENV === "production",

  // Email (Resend)
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  notificationFromEmail: process.env.NOTIFICATION_FROM_EMAIL ?? "",

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",

  // S3 storage (slip uploads, etc.)
  s3Endpoint: process.env.S3_ENDPOINT ?? "",
  s3Region: process.env.S3_REGION ?? "",
  s3Bucket: process.env.S3_BUCKET ?? "",
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
  s3PublicUrlBase: process.env.S3_PUBLIC_URL_BASE ?? "",
};
