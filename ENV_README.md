# Environment Variables Reference

All environment variables required to run **neville_goddard_sales** outside of Manus.

> **Security note:** Never commit real secrets to version control. Use `.env` locally and your host's secret manager in production.

---

## Quick-start `.env` template

```dotenv
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DBNAME?ssl={"rejectUnauthorized":true}

# ── Auth / Session ────────────────────────────────────────────────────────────
JWT_SECRET=replace-with-a-long-random-string-min-32-chars
VITE_APP_ID=your-oauth-app-id
OAUTH_SERVER_URL=https://oauth.your-provider.com
VITE_OAUTH_PORTAL_URL=https://login.your-provider.com

# ── Owner identity (used for admin notifications) ─────────────────────────────
OWNER_OPEN_ID=owner-open-id-from-oauth-provider
OWNER_NAME=Owner Name

# ── Manus built-in APIs (replace with your own LLM / storage endpoints) ───────
BUILT_IN_FORGE_API_URL=https://api.your-llm-provider.com
BUILT_IN_FORGE_API_KEY=your-server-side-api-key
VITE_FRONTEND_FORGE_API_URL=https://api.your-llm-provider.com
VITE_FRONTEND_FORGE_API_KEY=your-frontend-api-key

# ── Email (Resend) ────────────────────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# ── Stripe ────────────────────────────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# ── Runtime ───────────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=3000
```

---

## Variable Details

### Database

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | **Required** | Full MySQL/TiDB connection string. Format: `mysql://user:pass@host:port/dbname?ssl={"rejectUnauthorized":true}`. Used by Drizzle ORM on the server and by `drizzle-kit` for migrations. |

### Authentication & Session

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | **Required** | Secret used to sign session cookies via `jose`. Must be at least 32 characters. Generate with: `openssl rand -base64 32` |
| `VITE_APP_ID` | **Required** | OAuth application ID. Used by both frontend (`import.meta.env.VITE_APP_ID`) and server to identify the app with the OAuth provider. |
| `OAUTH_SERVER_URL` | **Required** | Backend URL of the OAuth/identity server (server-side). Used to validate tokens and complete the OAuth callback. |
| `VITE_OAUTH_PORTAL_URL` | **Required** | Frontend URL of the login portal. The frontend redirects users here to log in. |

> **Replacing Manus OAuth:** The project uses Manus OAuth by default. To migrate to a different provider (e.g., Auth0, Clerk, Supabase Auth), you need to rewrite `server/_core/oauth.ts` and update the login URL in `client/src/const.ts`.

### Owner Identity

| Variable | Required | Description |
|---|---|---|
| `OWNER_OPEN_ID` | **Required** | The OAuth `open_id` of the site owner. Used to identify the admin user and send owner notifications. |
| `OWNER_NAME` | Optional | Display name of the owner. Used in notification messages. |

### Manus Built-in APIs (LLM / Storage)

These variables point to Manus-hosted API endpoints. When self-hosting, replace them with your own LLM provider (e.g., OpenAI) and S3-compatible storage.

| Variable | Required | Description |
|---|---|---|
| `BUILT_IN_FORGE_API_URL` | **Required** | Base URL for the server-side AI/LLM API. Used in `server/_core/llm.ts`, `imageGeneration.ts`, `voiceTranscription.ts`. |
| `BUILT_IN_FORGE_API_KEY` | **Required** | Bearer token for server-side Forge API calls. Never expose to the browser. |
| `VITE_FRONTEND_FORGE_API_URL` | Optional | Base URL for frontend-side Forge API calls (if any). |
| `VITE_FRONTEND_FORGE_API_KEY` | Optional | Bearer token for frontend Forge API calls. Exposed to the browser — use a restricted key. |

> **Migration tip:** Replace `invokeLLM()` in `server/_core/llm.ts` with a direct OpenAI/Anthropic SDK call and update these env vars accordingly.

### Email (Resend)

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | **Required** | API key from [resend.com](https://resend.com). Used in `server/email.ts` to send order confirmation and status update emails. |

### Stripe Payments

| Variable | Required | Description |
|---|---|---|
| `STRIPE_SECRET_KEY` | **Required** | Stripe secret key (`sk_test_...` or `sk_live_...`). Used server-side in `server/stripeWebhook.ts` and `server/routers.ts`. |
| `STRIPE_WEBHOOK_SECRET` | **Required** | Webhook signing secret (`whsec_...`). Used to verify incoming Stripe webhook events. Obtain from Stripe Dashboard → Developers → Webhooks. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | **Required** | Stripe publishable key (`pk_test_...` or `pk_live_...`). Exposed to the browser for Stripe.js initialisation. |

> **Note:** The current codebase has Stripe partially integrated. Several TODO items remain to fully remove or complete the Stripe checkout flow (see HANDOFF.md).

### Runtime / Infrastructure

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Optional | `development` or `production`. Defaults to `development`. Controls Vite dev server vs. production build, cookie `secure` flag, etc. |
| `PORT` | Optional | HTTP port for the Express server. Defaults to `3000`. |

---

## S3 / File Storage

File storage credentials are **not** separate env vars — they are injected automatically by the Manus platform via `BUILT_IN_FORGE_API_*`. When self-hosting, update `server/storage.ts` to use your own AWS S3 credentials:

```dotenv
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=your-bucket-name
```

Then update `server/storage.ts` to use the standard `@aws-sdk/client-s3` client with these credentials instead of the Manus proxy.

---

## Analytics

| Variable | Required | Description |
|---|---|---|
| `VITE_ANALYTICS_ENDPOINT` | Optional | Umami/Plausible analytics endpoint URL. Used for page view tracking. |
| `VITE_ANALYTICS_WEBSITE_ID` | Optional | Analytics website ID. |

---

## Summary Table

| Variable | Required | Used By |
|---|---|---|
| `DATABASE_URL` | Required | Server, Drizzle ORM, drizzle-kit |
| `JWT_SECRET` | Required | Server (session cookies) |
| `VITE_APP_ID` | Required | Frontend + Server (OAuth) |
| `OAUTH_SERVER_URL` | Required | Server (OAuth callback) |
| `VITE_OAUTH_PORTAL_URL` | Required | Frontend (login redirect) |
| `OWNER_OPEN_ID` | Required | Server (admin identification) |
| `OWNER_NAME` | Optional | Server (notifications) |
| `BUILT_IN_FORGE_API_URL` | Required | Server (LLM, image gen, storage) |
| `BUILT_IN_FORGE_API_KEY` | Required | Server (LLM, image gen, storage) |
| `VITE_FRONTEND_FORGE_API_URL` | Optional | Frontend (Forge API) |
| `VITE_FRONTEND_FORGE_API_KEY` | Optional | Frontend (Forge API) |
| `RESEND_API_KEY` | Required | Server (email) |
| `STRIPE_SECRET_KEY` | Required | Server (Stripe) |
| `STRIPE_WEBHOOK_SECRET` | Required | Server (Stripe webhooks) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Required | Frontend (Stripe.js) |
| `NODE_ENV` | Optional | Server + Vite |
| `PORT` | Optional | Server |
| `VITE_ANALYTICS_ENDPOINT` | Optional | Frontend |
| `VITE_ANALYTICS_WEBSITE_ID` | Optional | Frontend |
