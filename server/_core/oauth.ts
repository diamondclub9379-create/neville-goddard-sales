// Google OAuth routes:
//   GET /api/oauth/google    → redirect to Google consent screen
//   GET /api/oauth/callback  → exchange code, upsert user, set session cookie

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import crypto from "node:crypto";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

const OAUTH_STATE_COOKIE = "oauth_state";
const STATE_COOKIE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function getRedirectUri(req: Request): string {
  const base = ENV.publicBaseUrl || `${req.protocol}://${req.get("host")}`;
  return `${base.replace(/\/+$/, "")}/api/oauth/callback`;
}

export function registerOAuthRoutes(app: Express) {
  // Start the Google OAuth flow
  app.get("/api/oauth/google", (req: Request, res: Response) => {
    try {
      const state = crypto.randomBytes(16).toString("hex");
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(OAUTH_STATE_COOKIE, state, {
        ...cookieOptions,
        maxAge: STATE_COOKIE_MAX_AGE_MS,
      });

      const authUrl = sdk.getGoogleAuthUrl(getRedirectUri(req), state);
      res.redirect(302, authUrl);
    } catch (error) {
      console.error("[OAuth] Failed to start Google flow:", error);
      res.status(503).send(
        "Login service unavailable. Google OAuth is not configured on this server."
      );
    }
  });

  // Google callback: verify state, exchange code, create session
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const expectedState = req.headers.cookie
      ?.split(";")
      .map((c) => c.trim().split("="))
      .find(([k]) => k === OAUTH_STATE_COOKIE)?.[1];

    if (!code || !state) {
      res.status(400).send("Missing code or state");
      return;
    }
    if (!expectedState || expectedState !== state) {
      res.status(400).send("Invalid OAuth state");
      return;
    }

    try {
      const profile = await sdk.exchangeCodeForGoogleUser(code, getRedirectUri(req));

      const role = ENV.adminEmails.includes(profile.email) ? "admin" : undefined;
      await db.upsertUser({
        openId: profile.sub,
        name: profile.name || null,
        email: profile.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
        ...(role ? { role } : {}),
      });

      const sessionToken = await sdk.createSessionToken(profile.sub, {
        name: profile.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.clearCookie(OAUTH_STATE_COOKIE, cookieOptions);

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed:", error);
      res.status(500).send("OAuth callback failed");
    }
  });
}
