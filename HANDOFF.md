# Project Handoff: neville_goddard_sales

**Neville Goddard Thai Books Sales Page** — an e-commerce site selling Thai-translated books by Neville Goddard, with admin panel, order management, blog, and Stripe payment integration.

---

## Tech Stack

### Frontend
| Library | Version | Role |
|---|---|---|
| React | 19.x | UI framework |
| Vite | 7.x | Build tool + dev server (with Vite proxy to Express) |
| Tailwind CSS | 4.x | Utility-first styling |
| shadcn/ui (Radix UI) | latest | Component library (Button, Dialog, Select, etc.) |
| wouter | 3.x | Client-side routing (lightweight React Router alternative) |
| @tanstack/react-query | 5.x | Server state / cache management |
| tRPC client | 11.x | Type-safe API calls (no REST, no Axios) |
| superjson | 1.x | JSON serialisation (preserves Date, BigInt, etc.) |
| framer-motion | 12.x | Animations |
| recharts | 2.x | Admin analytics charts |
| lucide-react | 0.453 | Icon set |
| react-hook-form + zod | latest | Form validation |
| @stripe/react-stripe-js | 5.x | Stripe Elements (partially integrated) |
| streamdown | 1.x | Markdown rendering with streaming support |

### Backend
| Library | Version | Role |
|---|---|---|
| Express | 4.x | HTTP server |
| tRPC server | 11.x | Type-safe RPC procedures |
| Drizzle ORM | 0.44.x | Database ORM (schema-first) |
| mysql2 | 3.x | MySQL/TiDB driver |
| jose | 6.x | JWT session cookies |
| cookie | 1.x | Cookie parsing |
| multer | 2.x | File upload (payment slip images) |
| stripe | 20.x | Stripe SDK (server-side) |
| resend | 6.x | Transactional email |
| @aws-sdk/client-s3 | 3.x | S3 file storage |
| nanoid | 5.x | Random ID generation |
| tsx | 4.x | TypeScript execution (dev mode) |
| esbuild | 0.25.x | Production server bundle |

### Database
| Item | Detail |
|---|---|
| Engine | TiDB Serverless (MySQL 8.0 compatible) |
| ORM | Drizzle ORM with `drizzle-kit` for migrations |
| Connection | `DATABASE_URL` env var (MySQL connection string with SSL) |
| Migration files | `drizzle/` directory (`.sql` files + `meta/_journal.json`) |

### Auth
- **Manus OAuth** (custom OAuth2 provider) — handled in `server/_core/oauth.ts`
- Session stored as a signed JWT cookie (`JWT_SECRET`)
- Frontend reads auth state via `trpc.auth.me.useQuery()`
- **To migrate away from Manus OAuth:** rewrite `server/_core/oauth.ts` and update `client/src/const.ts → getLoginUrl()`

### Payments
- **Stripe** (partially integrated — see TODOs below)
- Stripe Checkout Sessions via `stripe.checkout.sessions.create()`
- Webhook handler at `POST /api/stripe/webhook` in `server/stripeWebhook.ts`
- **Primary payment flow** is bank transfer with slip upload (fully working)

### Email
- **Resend** (`server/email.ts`) — order confirmations, status updates

### File Storage
- **AWS S3** (via Manus proxy) — `server/storage.ts`
- Payment slip uploads stored in S3 via `storagePut()`
- Product/book cover images stored on CloudFront CDN (hardcoded URLs from previous upload)

---

## Package.json Scripts

| Script | Command | Usage |
|---|---|---|
| `pnpm dev` | `NODE_ENV=development tsx watch server/_core/index.ts` | Start development server (Express + Vite HMR on same port) |
| `pnpm build` | `vite build && esbuild server/_core/index.ts ...` | Build frontend to `dist/public/` and bundle server to `dist/index.js` |
| `pnpm start` | `NODE_ENV=production node dist/index.js` | Start production server (serves built frontend as static files) |
| `pnpm check` | `tsc --noEmit` | TypeScript type-check without emitting files |
| `pnpm format` | `prettier --write .` | Format all source files |
| `pnpm test` | `vitest run` | Run all unit tests (Vitest) |
| `pnpm db:push` | `drizzle-kit generate && drizzle-kit migrate` | Generate migration SQL and apply to database |

---

## Local Setup (Step by Step)

### Prerequisites
- Node.js 22+
- pnpm 10+
- A MySQL 8.0 compatible database (TiDB Serverless, PlanetScale, Railway MySQL, or local MySQL)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Configure environment
Copy the template from `ENV_README.md` into a `.env` file at the project root:
```bash
cp .env.example .env   # if .env.example exists, otherwise create manually
# Edit .env with your actual values
```

Minimum required for local dev:
```dotenv
DATABASE_URL=mysql://user:pass@host:port/dbname?ssl={"rejectUnauthorized":true}
JWT_SECRET=any-random-32-char-string
VITE_APP_ID=any-string-for-local
OAUTH_SERVER_URL=https://placeholder.com
VITE_OAUTH_PORTAL_URL=https://placeholder.com
OWNER_OPEN_ID=any-string-for-local
RESEND_API_KEY=re_test_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
BUILT_IN_FORGE_API_URL=https://placeholder.com
BUILT_IN_FORGE_API_KEY=placeholder
```

### 3. Run database migrations
```bash
pnpm db:push
```
This runs `drizzle-kit generate` (creates SQL files in `drizzle/`) then `drizzle-kit migrate` (applies them to the database).

### 4. Seed initial data (optional)
```bash
node seed-reviews.mjs   # Seeds book reviews
```
Product data is managed via the Admin panel at `/admin`.

### 5. Start development server
```bash
pnpm dev
```
Open `http://localhost:3000`. The Express server and Vite dev server run on the same port — Vite is proxied through Express in dev mode.

---

## Deployment Guide

### Recommended Hosts

The stack is a **full-stack Node.js monorepo** (Express + React SPA). Suitable hosts:

| Host | Notes |
|---|---|
| **Railway** | Best fit. Supports Node.js, MySQL add-on available. Set env vars in dashboard. `pnpm build && pnpm start`. |
| **Fly.io** | Good for always-on workloads. Use `fly launch`, set secrets with `fly secrets set`. |
| **Render** | Free tier available. Web Service → Node. Build command: `pnpm install && pnpm build`. Start: `pnpm start`. |
| **Vercel** | **Not recommended** — Vercel is optimised for serverless/Next.js. This Express server is not serverless-compatible without major refactoring. |
| **Netlify** | Same issue as Vercel — serverless functions only. Not suitable as-is. |

### Build & Deploy Steps (Railway example)
```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect Railway to your GitHub repo
# 3. Set all env vars from ENV_README.md in Railway dashboard
# 4. Railway auto-detects pnpm and runs:
#    pnpm install → pnpm build → pnpm start

# Build output:
# dist/public/   ← Vite-built frontend (served as static files)
# dist/index.js  ← esbuild-bundled Express server
```

### Database
Use **TiDB Serverless** (free tier, MySQL compatible) or **PlanetScale** (similar). Set `DATABASE_URL` and run `pnpm db:push` once after deploy to create tables.

### Stripe Webhooks
After deploying, register your webhook endpoint in Stripe Dashboard:
- URL: `https://your-domain.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `payment_intent.succeeded`
- Copy the signing secret to `STRIPE_WEBHOOK_SECRET`

---

## Folder Structure (What a New Dev Needs to Know)

```
neville_goddard_sales/
├── client/
│   ├── index.html              ← Vite entry point (Google Fonts loaded here)
│   ├── public/
│   │   └── __manus__/          ← Manus debug tools (safe to delete when self-hosting)
│   └── src/
│       ├── App.tsx             ← Route definitions (wouter Switch/Route)
│       ├── index.css           ← Global styles + Tailwind 4 @theme tokens
│       ├── main.tsx            ← React root + tRPC/QueryClient providers
│       ├── const.ts            ← getLoginUrl(), app constants
│       ├── _core/hooks/
│       │   └── useAuth.ts      ← useAuth() hook (reads trpc.auth.me)
│       ├── components/
│       │   ├── ui/             ← shadcn/ui components (auto-generated, don't edit)
│       │   ├── AdminLayout.tsx ← Admin sidebar layout
│       │   ├── Navbar.tsx      ← Main site top navigation
│       │   ├── CheckoutModal.tsx ← Order checkout form (bank transfer)
│       │   ├── CartDrawer.tsx  ← Shopping cart sidebar
│       │   └── ...
│       └── pages/
│           ├── Home.tsx        ← Main storefront (book grid, cart, checkout)
│           ├── IKnowMyFather.tsx   ← Dedicated sales page (divine/celestial theme)
│           ├── HowToAttractLove.tsx ← Dedicated sales page (dark gold theme)
│           ├── ProductDetail.tsx   ← Generic product detail (for other books)
│           ├── Orders.tsx      ← Customer order history
│           ├── BlogListing.tsx / BlogArticleDetail.tsx ← Blog
│           └── admin/          ← Admin pages (orders, analytics, bundles, etc.)
├── server/
│   ├── _core/                  ← Framework plumbing (do not edit unless extending)
│   │   ├── index.ts            ← Express app entry point
│   │   ├── routers.ts (→ ../routers.ts) ← tRPC router registration
│   │   ├── context.ts          ← tRPC context (injects ctx.user)
│   │   ├── oauth.ts            ← Manus OAuth callback handler
│   │   ├── env.ts              ← Centralised env var access
│   │   ├── llm.ts              ← invokeLLM() helper
│   │   ├── imageGeneration.ts  ← generateImage() helper
│   │   └── notification.ts     ← notifyOwner() helper
│   ├── routers.ts              ← ALL tRPC procedures (auth, products, orders, admin, etc.)
│   ├── db.ts                   ← Drizzle query helpers
│   ├── email.ts                ← Resend email templates
│   ├── storage.ts              ← S3 storagePut/storageGet helpers
│   ├── slipUpload.ts           ← Multer file upload route for payment slips
│   └── stripeWebhook.ts        ← Stripe webhook handler
├── drizzle/
│   ├── schema.ts               ← Database table definitions (source of truth)
│   ├── relations.ts            ← Drizzle relation definitions
│   ├── *.sql                   ← Migration files (auto-generated by drizzle-kit)
│   └── meta/_journal.json      ← Migration journal
├── shared/
│   ├── const.ts                ← Shared constants (error messages, etc.)
│   └── types.ts                ← Shared TypeScript types
├── patches/
│   └── wouter@3.7.1.patch      ← Patch for wouter (fixes base path issue)
├── package.json
├── vite.config.ts              ← Vite config (includes Manus debug plugin — remove when self-hosting)
├── drizzle.config.ts           ← Drizzle Kit config
├── tsconfig.json
└── vitest.config.ts
```

### Key Patterns
- **Adding a new page:** Create `client/src/pages/MyPage.tsx`, add `<Route path="/my-page" component={MyPage} />` in `App.tsx`.
- **Adding a new API endpoint:** Add a procedure to `server/routers.ts`, call it with `trpc.myProcedure.useQuery()` in the frontend.
- **Database changes:** Edit `drizzle/schema.ts`, then run `pnpm db:push`.
- **Admin-only procedures:** Use the `adminProcedure` pattern (checks `ctx.user.role === 'admin'`).

---

## Known Issues & Pending TODOs

### High Priority (Blocking or Broken)

| Issue | File(s) | Notes |
|---|---|---|
| Stripe checkout flow incomplete | `server/routers.ts`, `client/src/components/CheckoutModal.tsx` | `createOrderAndPaymentIntent` procedure exists but frontend checkout form is not fully wired to it. `handleSubmit` has silent early-return bugs. |
| `VITE_STRIPE_PUBLISHABLE_KEY` may not load | `client/src/components/CheckoutModal.tsx` | Needs verification that `import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY` resolves correctly in browser runtime. |
| Stripe cleanup needed | Multiple files | Decision was made to remove Stripe and use bank transfer only, but cleanup is incomplete. `StripeCheckout.tsx`, credit-card radio button, and related router procedures still exist. |

### Medium Priority

| Issue | File(s) | Notes |
|---|---|---|
| Checkout form not connected to `createOrder` mutation | `client/src/pages/Home.tsx` → `CheckoutModal.tsx` | Form submits but order creation tRPC call may not be triggered correctly. |
| Email notification on order status change | `server/email.ts`, `server/routers.ts` | Email sending on status update is implemented but needs end-to-end testing. |
| Export orders to CSV | `server/routers.ts` | Not yet implemented. |
| Date range filter in admin orders | `client/src/pages/admin/AdminOrders.tsx` | Filter UI exists but backend query may not support it. |

### Low Priority / Nice to Have

| Issue | Notes |
|---|---|
| SEO meta tags on sales pages | `IKnowMyFather.tsx` and `HowToAttractLove.tsx` need `<meta og:*>` tags for social sharing previews. |
| Dedicated sales pages for more books | Only 2 books have dedicated pages. Others use generic `ProductDetail.tsx`. |
| Customer reviews from database | Sales pages use hardcoded testimonials. Should pull from `bookReviews` table. |
| Free ebook table | `freeEbooks` table exists in DB but no admin UI or frontend flow is implemented. |

### Manus-specific Code to Remove When Self-Hosting

| File/Location | What to do |
|---|---|
| `client/public/__manus__/` | Delete entire directory |
| `vite.config.ts` — `vitePluginManusRuntime` import and usage | Remove the plugin; it injects Manus debug tooling |
| `vite.config.ts` — `/__manus__/logs` middleware | Remove the log endpoint block |
| `server/_core/oauth.ts` | Replace with your own OAuth provider |
| `server/_core/llm.ts`, `imageGeneration.ts`, `voiceTranscription.ts` | Replace Forge API calls with OpenAI/Anthropic SDK |
| `server/_core/notification.ts` | Replace with your own notification system |
| `server/storage.ts` | Update with your own AWS credentials (remove Manus proxy) |

---

## Database Tables Summary

| Table | Rows (at export) | Description |
|---|---|---|
| `products` | 17 | Books for sale (title, price, slug, image, etc.) |
| `bookReviews` | 64 | Customer reviews per book |
| `orders` | 8 | Customer orders (bank transfer + slip upload) |
| `orderItems` | 22 | Line items per order |
| `bundleDeals` | 0 | Discount bundles (defined but no active deals) |
| `blogPosts` | 10 | Blog articles |
| `users` | 1 | Registered users (OAuth-based) |
| `freeEbooks` | 0 | Free ebook leads (table exists, no UI) |

---

*Generated: 2026-04-19*
