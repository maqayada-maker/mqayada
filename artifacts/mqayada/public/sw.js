/* Service worker for مقايضة web push notifications */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "مقايضة", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "مقايضة";
  // Resolve assets against the SW scope so they work under a base path (e.g. /mqayada/).
  const icon = new URL("images/logo.png", self.registration.scope).href;
  const options = {
    body: data.body || "",
    icon,
    badge: icon,
    dir: "rtl",
    lang: "ar",
    tag: data.tag || undefined,
    renotify: Boolean(data.tag),
    data: { link: data.link || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || "/";
  // Resolve against the SW scope so base-path links work.
  const url = new URL(link, self.registration.scope).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client) {
            client.navigate(url).catch(() => {});
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    }),
  );
});
