// PushSubscribeComponent.jsx
import React, { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function PushSubscribe({ vapidPublicKey }) {
  const API_BASE =  import.meta.env.VITE_STOCK_SERVER  || "http://localhost:8000";
  const publicKey = vapidPublicKey || (typeof window !== "undefined" && window.VAPID_PUBLIC_KEY) || "";

  const [registration, setRegistration] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // items are objects: { route: 'seeds'|'gear'|'eggs', q: 'carrot' }
  const [items, setItems] = useState([]);
  const [itemInput, setItemInput] = useState("");
  const [itemRoute, setItemRoute] = useState("seeds");
  const [minInterval, setMinInterval] = useState(300); // seconds

  // local storage keys
  const LOCAL_KEY_ITEMS = "push_watch_items_v2";
  const LOCAL_KEY_MININT = "push_watch_minint_v2";

  // allowed user routes
  const USER_ROUTES = ["seeds", "gear", "eggs"];

  useEffect(() => {
    // restore saved watchlist
    try {
      const saved = JSON.parse(localStorage.getItem(LOCAL_KEY_ITEMS) || "[]");
      if (Array.isArray(saved)) setItems(saved);
      const savedMin = Number(localStorage.getItem(LOCAL_KEY_MININT) || 300);
      if (!Number.isNaN(savedMin)) setMinInterval(savedMin);
    } catch (e) {
      // ignore
    }

    // register SW and resync existing subscription if any
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      setRegistration(reg);
      try {
        const sub = await reg.pushManager.getSubscription();
        const perm = (typeof Notification !== "undefined" && Notification.permission) ? Notification.permission : "default";
        if (sub && perm === "granted") {
          // silently sync saved user watchlist (if any)
          const criteria = {};
          if (items && items.length) criteria.items = items.map(it => ({ route: it.route, q: it.q }));
          // If user has no custom items, we don't send a route — server will still send default watchlist notifications.
          if (minInterval) criteria.minNotifyIntervalMs = Number(minInterval) * 1000;

          try {
            await fetch(`${API_BASE}/subscribe`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscription: sub, criteria }),
            });
          } catch (e) {
            // ignore
          }

          setSubscribed(true);
          setShowEditor(true);
        }
      } catch (e) {
        // ignore
      }
    }).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAllowClick() {
    if (!registration) {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        setRegistration(reg);
      } catch (e) {
        return;
      }
    }
    if (!publicKey) return;

    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // build criteria from saved items
      const criteria = {};
      if (items && items.length) criteria.items = items.map(it => ({ route: it.route, q: it.q }));
      if (minInterval) criteria.minNotifyIntervalMs = Number(minInterval) * 1000;

      await fetch(`${API_BASE}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, criteria }),
      }).catch(()=>{});

      setSubscribed(true);
      setShowEditor(true);
    } catch (e) {
      // silent fail
    }
  }

  function addItem() {
    const v = itemInput.trim();
    if (!v) return;
    if (!USER_ROUTES.includes(itemRoute)) return;
    const newItem = { route: itemRoute, q: v };
    setItems(prev => {
      const next = [...prev, newItem];
      localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(next));
      return next;
    });
    setItemInput("");
  }

  function removeItem(idx) {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== idx);
      localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(next));
      return next;
    });
  }

  async function saveWatchlist() {
    if (!registration) return;
    const sub = await registration.pushManager.getSubscription();
    if (!sub) return;

    // build criteria: items as {route,q}, minNotifyIntervalMs in ms
    const criteria = {};
    if (items && items.length) criteria.items = items.map(it => ({ route: it.route, q: it.q }));
    if (minInterval) criteria.minNotifyIntervalMs = Number(minInterval) * 1000;

    // persist
    localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(items || []));
    localStorage.setItem(LOCAL_KEY_MININT, String(minInterval || 300));

    await fetch(`${API_BASE}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub, criteria }),
    }).catch(()=>{});
    // minimal UI - no status message shown
  }

  async function turnOff() {
    if (!registration) return;
    const sub = await registration.pushManager.getSubscription();
    if (sub) {
      try { await sub.unsubscribe(); } catch (e) {}
    }
    setSubscribed(false);
    setShowEditor(false);
    setItems([]);
    localStorage.removeItem(LOCAL_KEY_ITEMS);
    localStorage.removeItem(LOCAL_KEY_MININT);
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white/90 backdrop-blur rounded-2xl shadow-md">
      {!showEditor && (
        <div className="flex justify-center">
          <button onClick={handleAllowClick} className="px-6 py-3 bg-emerald-600 text-white rounded-lg">
            Allow
          </button>
        </div>
      )}

      {showEditor && subscribed && (
        <div>
          <div className="mb-3">
            <label className="block text-sm font-medium">Category</label>
            <select value={itemRoute} onChange={(e) => setItemRoute(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2">
              <option value="seeds">Seeds</option>
              <option value="gear">Gear</option>
              <option value="eggs">Eggs</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Add item name or item id</label>
            <div className="flex gap-2 mt-1">
              <input value={itemInput} onChange={(e) => setItemInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} placeholder="e.g. carrot or Carrot" className="flex-1 rounded-md border-gray-300 p-2" />
              <button onClick={addItem} className="px-3 py-2 bg-blue-600 text-white rounded-md">Add</button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Add items with their category. You can add multiple items across seeds, gear and eggs.</p>
          </div>

          <div className="mb-3">
            <div className="flex flex-col gap-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 bg-gray-100 p-2 rounded text-sm">
                  <div>
                    <strong className="mr-2">{it.q}</strong>
                    <span className="text-xs text-gray-600">({it.route})</span>
                  </div>
                  <button onClick={() => removeItem(idx)} className="text-xs text-red-600">Remove</button>
                </div>
              ))}
              {items.length === 0 && <div className="text-xs text-gray-500">No custom items yet.</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium">Min notify interval (seconds)</label>
            <input type="number" value={minInterval} onChange={(e) => { const n = Number(e.target.value || 0); setMinInterval(n); localStorage.setItem(LOCAL_KEY_MININT, String(n)); }} className="mt-1 block w-full rounded-md border-gray-300 p-2" />
          </div>

          <div className="flex gap-2">
            <button onClick={saveWatchlist} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
            <button onClick={turnOff} className="px-4 py-2 bg-red-500 text-white rounded-lg">Turn Off</button>
          </div>
        </div>
      )}
    </div>
  );
}
