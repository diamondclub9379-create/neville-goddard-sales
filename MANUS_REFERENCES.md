# Manus-Specific References in Source Code

This file lists all hard-coded references to Manus infrastructure found in the project source code. These should be reviewed and replaced when self-hosting.

**Scan scope:** All `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md`, `.html` files, excluding `node_modules/`, `dist/`, `.git/`, `.manus/`.

**Patterns searched:** `manus.space`, `manuscdn.com`, `__manus__`, `manus.computer`, `manus-cdn`, `manus-static`

---

## `__manus__` References (Manus Debug Tooling)

These files are part of the Manus browser debug collector. **Safe to delete entirely when self-hosting.**

| Location | Line | Content |
|---|---|---|
| `client/public/__manus__/debug-collector.js` | 9 | `* Data is periodically sent to /__manus__/logs` |
| `client/public/__manus__/debug-collector.js` | 22 | `reportEndpoint: "/__manus__/logs",` |
| `client/public/__manus__/debug-collector.js` | 465 | `if (url.indexOf("/__manus__/") === 0) {` |
| `client/public/__manus__/debug-collector.js` | 615 | `xhr._manusData.url.indexOf("/__manus__/") !== 0` |

**Action:** Delete `client/public/__manus__/` directory entirely.

---

## `vite.config.ts` — Manus Runtime Plugin & Log Endpoints

| Location | Line | Content |
|---|---|---|
| `vite.config.ts` | 73 | `* - POST /__manus__/logs: Browser sends logs, written directly to files` |
| `vite.config.ts` | 91 | `src: "/__manus__/debug-collector.js",` |
| `vite.config.ts` | 101 | `// POST /__manus__/logs: Browser sends logs (written directly to files)` |
| `vite.config.ts` | 102 | `server.middlewares.use("/__manus__/logs", (req, res, next) => {` |
| `vite.config.ts` | 175 | `".manus.computer",` (in CORS/proxy allowed origins list) |

**Action:** Remove the entire Manus debug plugin block from `vite.config.ts` (the `manusDebugCollectorPlugin` function and its usage). Also remove `vitePluginManusRuntime` import and plugin usage. Remove `.manus.computer` from the allowed origins list.

---

## `todo.md` — Reference URLs (Documentation Only)

These are in `todo.md` as historical notes — they do not affect runtime behaviour.

| Location | Line | Content |
|---|---|---|
| `todo.md` | 370 | `- [x] Create /books/i-know-my-father detail page matching iknowbook-ijbffyxw.manus.space design` |
| `todo.md` | 379 | `- [x] Create /books/how-to-attract-love detail page matching loveattract-b9tkbxfm.manus.space design` |
| `todo.md` | 435 | `- [x] Review https://iknowbook-ijbffyxw.manus.space layout, design, sections` |
| `todo.md` | 436 | `- [x] Review https://loveattract-b9tkbxfm.manus.space layout, design, sections` |

**Action:** No action needed — these are completed task notes. Safe to leave or delete `todo.md` entirely.

---

## Additional: CloudFront CDN URLs (Manus-hosted static assets)

These are not `manus.space` domains but are Manus-managed CloudFront URLs for uploaded book cover images. They will continue to work as long as the Manus project exists, but **will break if the Manus project is deleted**.

| Location | Line | URL |
|---|---|---|
| `client/src/components/BundleUpsellModal.tsx` | 12 | `https://d2xsxph8kpxj0f.cloudfront.net/88156135/ijBFFyxW5uez5TwYTe3QAc/book-cover-hero-YEemXvgzjcFPXN9CJfLR2v.webp` |
| `client/src/components/BundleUpsellModal.tsx` | 21 | `https://d2xsxph8kpxj0f.cloudfront.net/88156135/B9TKBXfmVt5ND8gdPnWQJc/book-cover-3d-ZfPgJmzzqre5ExcfE5foaf.webp` |
| `client/src/pages/Home.tsx` | 964 | `https://d2xsxph8kpxj0f.cloudfront.net/88156135/JBCuUPyxr38ymK8odr3rtN/neville-portrait-1_ee8789cb.png` |
| `client/src/pages/HowToAttractLove.tsx` | 15 | `https://d2xsxph8kpxj0f.cloudfront.net/88156135/B9TKBXfmVt5ND8gdPnWQJc/book-cover-3d-ZfPgJmzzqre5ExcfE5foaf.webp` |
| `client/src/pages/HowToAttractLove.tsx` | 22 | `https://d2xsxph8kpxj0f.cloudfront.net/88156135/B9TKBXfmVt5ND8gdPnWQJc/book-promo_24a28c00.png` |
| `client/src/pages/IKnowMyFather.tsx` | 15 | `https://d2xsxph8kpxj0f.cloudfront.net/88156135/ijBFFyxW5uez5TwYTe3QAc/book-cover-hero-YEemXvgzjcFPXN9CJfLR2v.webp` |
| `client/src/pages/IKnowMyFather.tsx` | 22 | `https://d2xsxph8kpxj0f.cloudfront.net/88156135/ijBFFyxW5uez5TwYTe3QAc/hero-banner-book-KgR9dXbaui7gBpjaJ4GKF9.webp` |

**Action:** Before deleting the Manus project, download these images and re-upload them to your own S3 bucket or CDN. Then update the hardcoded URLs in the above files.

---

## Manus-specific npm Package

| Package | Used in | Notes |
|---|---|---|
| `vite-plugin-manus-runtime` | `vite.config.ts` | Manus-specific Vite plugin for dev tooling. Remove from `package.json` and `vite.config.ts` when self-hosting. |

---

## Summary: Files to Modify When Self-Hosting

| File | Action |
|---|---|
| `client/public/__manus__/` | Delete entire directory |
| `vite.config.ts` | Remove `vitePluginManusRuntime`, `manusDebugCollectorPlugin`, and `.manus.computer` CORS entry |
| `package.json` | Remove `vite-plugin-manus-runtime` from devDependencies |
| `server/_core/oauth.ts` | Replace Manus OAuth with your own provider |
| `server/_core/llm.ts` | Replace Forge API with OpenAI/Anthropic SDK |
| `server/_core/imageGeneration.ts` | Replace Forge API with your own image generation service |
| `server/_core/voiceTranscription.ts` | Replace Forge API with Whisper API or similar |
| `server/_core/notification.ts` | Replace with your own notification system |
| `server/storage.ts` | Update with your own AWS S3 credentials |
| `client/src/pages/IKnowMyFather.tsx` | Re-upload images to own CDN, update URLs |
| `client/src/pages/HowToAttractLove.tsx` | Re-upload images to own CDN, update URLs |
| `client/src/components/BundleUpsellModal.tsx` | Re-upload images to own CDN, update URLs |
| `client/src/pages/Home.tsx` | Re-upload Neville portrait image to own CDN, update URL |

---

*Generated: 2026-04-19*
