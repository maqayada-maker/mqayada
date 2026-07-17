import webpush from "web-push";
import { db } from "@workspace/db";
import { pushSubscriptionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? "";
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:maqayada@maqayada.com";

export const PUSH_ENABLED = Boolean(PUBLIC_KEY && PRIVATE_KEY);

if (PUSH_ENABLED) {
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
} else {
  console.warn("[push] VAPID keys missing — web push disabled");
}

export function getPublicKey(): string {
  return PUBLIC_KEY;
}

export interface PushPayload {
  title: string;
  body: string;
  link?: string;
  tag?: string;
}

/**
 * Send a web-push notification to every subscription registered for a user.
 * Fire-and-forget: prunes subscriptions the push service reports as gone.
 */
export async function sendPushToUser(userId: number, payload: PushPayload): Promise<void> {
  if (!PUSH_ENABLED || !userId) return;

  const subs = await db
    .select()
    .from(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.userId, userId));

  if (subs.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
      } catch (err: any) {
        const status = err?.statusCode;
        // 404/410 mean the subscription is no longer valid — remove it.
        if (status === 404 || status === 410) {
          await db
            .delete(pushSubscriptionsTable)
            .where(eq(pushSubscriptionsTable.endpoint, sub.endpoint))
            .catch(() => {});
        } else {
          console.error("[push] send failed:", status ?? err?.message ?? err);
        }
      }
    }),
  );
}
