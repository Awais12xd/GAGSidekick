// sw.js — service worker for push notifications (improved UI)
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  try {
    if (!event.data) {
      event.waitUntil(self.registration.showNotification("Update", { body: "You have an update.", data: {} }));
      return;
    }

    const payload = event.data.json();

    const title = payload.title || "Notification";
    // Build options from payload, allowing sensible defaults and fallbacks
    const options = {
      body: payload.body || "",
      icon: payload.icon || payload.badge || undefined,
      badge: payload.badge || undefined,
      image: payload.image || undefined,
      vibrate: payload.vibrate || [120, 60, 120],
      data: payload.data || {},
      actions: Array.isArray(payload.actions) ? payload.actions : [],
      requireInteraction: !!payload.requireInteraction,
      timestamp: payload.timestamp || Date.now(),
      tag: payload.tag || undefined,
      renotify: typeof payload.renotify === "boolean" ? payload.renotify : false,
    };

    // On some platforms 'data' is not shown in the notification UI; keep important URL in options.data.url
    if (!options.data.url && payload.data && payload.data.url) options.data.url = payload.data.url;

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    const text = event.data && event.data.text ? event.data.text() : String(event.data);
    event.waitUntil(self.registration.showNotification("Notification", { body: text || "You have a notification." }));
  }
});

// make actions meaningful: one action to open, one to view (customize labels/icons as desired)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const action = event.action; // action id string or '' for default click
  const data = event.notification.data || {};
  const urlToOpen = data.url || "/";

  // handle action ids if present
  let promiseChain = Promise.resolve();
  if (action === "open" || action === "view" || action === "") {
    promiseChain = self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        try {
          // If the client is already at the same URL, focus it
          if (client.url === urlToOpen && "focus" in client) return client.focus();
        } catch (e) {
          // ignore any cross-origin issues
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
    });
  } else {
    // other actions - fallback to opening url
    promiseChain = self.clients.openWindow ? self.clients.openWindow(urlToOpen) : Promise.resolve();
  }

  event.waitUntil(promiseChain);
});
