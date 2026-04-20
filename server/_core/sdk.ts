// Google OAuth + JWT session authentication.
//
// Public surface kept similar to the previous Manus SDK so the rest of the app
// doesn't need to change much:
//   - sdk.getGoogleAuthUrl(redirectUri)       → URL to start OAuth flow
//   - sdk.exchangeCodeForGoogleUser(code, ...) → exchange + fetch profile
//   - sdk.createSessionToken(openId, { name })→ signed JWT string
//   - sdk.verifySession(cookieValue)          → decoded JWT payload | null
//   - sdk.authenticateRequest(req)            → loaded User from DB

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

export type SessionPayload = {
  openId: string;
  name: string;
};

export type GoogleProfile = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

class SDKServer {
  private getSessionSecret(): Uint8Array {
    if (!ENV.cookieSecret) {
      throw new Error("JWT_SECRET is not configured");
    }
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  private parseCookies(cookieHeader: string | undefined): Map<string, string> {
    if (!cookieHeader) return new Map();
    return new Map(Object.entries(parseCookieHeader(cookieHeader)));
  }

  /** Build the Google OAuth consent URL to which the user should be redirected. */
  getGoogleAuthUrl(redirectUri: string, state: string): string {
    if (!ENV.googleClientId) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }
    const url = new URL(GOOGLE_AUTH_ENDPOINT);
    url.searchParams.set("client_id", ENV.googleClientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("access_type", "online");
    url.searchParams.set("prompt", "select_account");
    url.searchParams.set("state", state);
    return url.toString();
  }

  /** Exchange authorization code for tokens, then fetch the Google user profile. */
  async exchangeCodeForGoogleUser(
    code: string,
    redirectUri: string
  ): Promise<GoogleProfile> {
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      throw new Error("Google OAuth credentials are not configured");
    }

    const tokenBody = new URLSearchParams({
      code,
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString(),
    });

    if (!tokenRes.ok) {
      const detail = await tokenRes.text().catch(() => "");
      throw new Error(`Google token exchange failed (${tokenRes.status}): ${detail}`);
    }

    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      throw new Error("Google token response did not include access_token");
    }

    const userRes = await fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    if (!userRes.ok) {
      const detail = await userRes.text().catch(() => "");
      throw new Error(`Google userinfo failed (${userRes.status}): ${detail}`);
    }

    const profile = (await userRes.json()) as GoogleProfile;
    if (!profile.sub) {
      throw new Error("Google userinfo response missing 'sub'");
    }
    return profile;
  }

  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);

    return new SignJWT({ openId, name: options.name || "" })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(this.getSessionSecret());
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) return null;
    try {
      const { payload } = await jwtVerify(cookieValue, this.getSessionSecret(), {
        algorithms: ["HS256"],
      });
      const { openId, name } = payload as Record<string, unknown>;
      if (!isNonEmptyString(openId)) return null;
      return { openId, name: isNonEmptyString(name) ? name : "" };
    } catch (error) {
      console.warn("[Auth] Session verification failed:", String(error));
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const user = await db.getUserByOpenId(session.openId);
    if (!user) {
      throw ForbiddenError("User not found");
    }

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: new Date(),
    });

    return user;
  }
}

export const sdk = new SDKServer();
