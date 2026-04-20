// Owner notification via email (Resend). Used by admin tRPC endpoint for generic
// alerts and by the order flow to notify the shop owner about new orders.
//
// Validation errors bubble up as TRPC errors so callers can fix the payload.
// Delivery failures return `false` (callers can fall back to another channel).

import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Notification title is required." });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Notification content is required." });
  }

  const title = input.title.trim();
  const content = input.content.trim();

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  if (!ENV.resendApiKey) {
    console.warn("[Notification] RESEND_API_KEY not set — cannot notify owner");
    return false;
  }
  if (!ENV.ownerEmail) {
    console.warn("[Notification] OWNER_EMAIL not set — cannot notify owner");
    return false;
  }

  try {
    const resend = new Resend(ENV.resendApiKey);
    const { error } = await resend.emails.send({
      from: ENV.notificationFromEmail || "Neville Books <onboarding@resend.dev>",
      to: ENV.ownerEmail,
      subject: title,
      text: content,
    });

    if (error) {
      console.warn("[Notification] Resend returned error:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Failed to send owner email:", error);
    return false;
  }
}
