const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export type PushState = "unsupported" | "denied" | "enabled" | "disabled";

function token(): string {
  return localStorage.getItem("mqayada_token") ?? "";
}

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

async function registerSW(): Promise<ServiceWorkerRegistration> {
  const scope = import.meta.env.BASE_URL;
  return navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope });
}

async function getPublicKey(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/api/notifications/push/public-key`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.enabled && data?.key ? (data.key as string) : null;
  } catch {
    return null;
  }
}

/** Current state without prompting the user. */
export async function getPushState(): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  try {
    const reg = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
    const sub = await reg?.pushManager.getSubscription();
    return sub ? "enabled" : "disabled";
  } catch {
    return "disabled";
  }
}

/** Prompt + subscribe. Returns the resulting state. */
export async function enablePush(): Promise<PushState> {
  if (!pushSupported()) return "unsupported";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "disabled";

  const key = await getPublicKey();
  if (!key) return "disabled";

  const reg = await registerSW();
  await navigator.serviceWorker.ready;

  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
    });
  }

  const res = await fetch(`${BASE}/api/notifications/push/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: JSON.stringify(sub.toJSON()),
  });
  if (!res.ok) return "disabled";
  return "enabled";
}

/** Unsubscribe from this browser. */
export async function disablePush(): Promise<PushState> {
  if (!pushSupported()) return "unsupported";
  try {
    const reg = await navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL);
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      const endpoint = sub.endpoint;
      await sub.unsubscribe().catch(() => {});
      await fetch(`${BASE}/api/notifications/push/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ endpoint }),
      }).catch(() => {});
    }
  } catch {
    /* silent */
  }
  return Notification.permission === "denied" ? "denied" : "disabled";
}
