// "Deal" notifications (annual offers / best-price ads) are tracked by a per-type
// "last seen" timestamp rather than the count-based dismiss store used for other
// notifications, so they stay correct even when offers expire or are removed.
// "Seen" is recorded both when a client opens the item from the notification bell
// AND when they actually visit the page where those deals live, so the indicator
// clears after a real visit regardless of how the client navigated there.

export const DEALS_SEEN_KEY = "mqayada_deals_seen";

export const DEAL_SEEN_PARAM = {
  annual_offers: "dealsSeenAnnual",
  best_price: "dealsSeenBest",
} as const;

export type DealType = keyof typeof DEAL_SEEN_PARAM;

export const DEAL_TYPES = Object.keys(DEAL_SEEN_PARAM) as DealType[];

// Fired after a deal type is marked seen so the notification bell can refetch
// immediately instead of waiting for its next poll.
export const DEALS_SEEN_EVENT = "mqayada:deals-seen";

export function readDealsSeen(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DEALS_SEEN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function writeDealsSeen(d: Record<string, number>) {
  try {
    localStorage.setItem(DEALS_SEEN_KEY, JSON.stringify(d));
  } catch {
    /* silent */
  }
}

// Record that the signed-in client has now seen the latest deals of this type.
// No-op when the visitor is not signed in (deal notifications only apply to
// authenticated clients), so we don't pollute storage for anonymous visitors.
export function markDealSeen(type: DealType) {
  if (!localStorage.getItem("mqayada_token")) return;
  const seen = { ...readDealsSeen(), [type]: Date.now() };
  writeDealsSeen(seen);
  try {
    window.dispatchEvent(new Event(DEALS_SEEN_EVENT));
  } catch {
    /* silent */
  }
}
