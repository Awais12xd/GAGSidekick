/* sw.js — service worker for push notifications */
/* Note: serve this at /sw.js on the same origin as the page. */

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
    const options = {
      body: payload.body || "",
      icon: payload.icon,
      badge: payload.badge,
      vibrate: payload.vibrate || [100, 50, 100],
      data: payload.data || {},
      actions: payload.actions || [],
      requireInteraction: payload.requireInteraction || false,
      timestamp: payload.timestamp || Date.now(),
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    const text = event.data && event.data.text ? event.data.text() : String(event.data);
    event.waitUntil(self.registration.showNotification("Notification", { body: text || "You have a notification." }));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if (client.url === urlToOpen && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
    })
  );
});
