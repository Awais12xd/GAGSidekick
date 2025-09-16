// PushSubscribe.jsx
import React, { useEffect, useRef, useState } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function PushSubscribe({ vapidPublicKey }) {
  const API_BASE = import.meta.env.VITE_STOCK_SERVER || "http://localhost:8000";
  const publicKey = vapidPublicKey || (typeof window !== "undefined" && window.VAPID_PUBLIC_KEY) || "";

  const [registration, setRegistration] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // items are objects: { route: 'seeds'|'gear'|'eggs', q: 'carrot' }
  const [items, setItems] = useState([]);
  const itemInputRef = useRef(null);               // <-- UNCONTROLLED input ref
  const [itemRoute, setItemRoute] = useState("seeds");
  const [minInterval, setMinInterval] = useState(300); // seconds

  // local storage keys
  const LOCAL_KEY_ITEMS = "push_watch_items_v2";
  const LOCAL_KEY_MININT = "push_watch_minint_v2";
  const LOCAL_KEY_DISABLED = "push_watch_disabled_v1"; // store user turned-off preference

  // allowed user routes
  const USER_ROUTES = ["seeds", "gear", "eggs"];

  // palette (kept from your design)
  const palette = {
    bg: "#112240",
    card: "#0b1b2a",
    border: "#102a3a",
    text: "#ccd6f6",
    mutetext: "#8892b0",
    primary: "#64ffda",
    accentBtn: "bg-emerald-600",
  };

  // Helper to register SW (returns registration)
  async function ensureServiceWorkerRegistered() {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      // store reg object locally
      setRegistration(reg);
      return reg;
    } catch (err) {
      // registration failed
      return null;
    }
  }

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

    // register SW and resync existing subscription if any (only on mount)
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    (async () => {
      try {
        const reg = await ensureServiceWorkerRegistered();
        if (!reg) return;

        const sub = await reg.pushManager.getSubscription();
        const perm = (typeof Notification !== "undefined" && Notification.permission) ? Notification.permission : "default";
        const disabled = localStorage.getItem(LOCAL_KEY_DISABLED) === "1";

        // If user explicitly turned off previously, respect that: don't resubscribe/show editor
        if (disabled) {
          setSubscribed(false);
          setShowEditor(false);
          return;
        }

        // If permission granted and subscription exists -> sync and show editor
        if (sub && perm === "granted") {
          const criteria = {};
          if (items && items.length) criteria.items = items.map(it => ({ route: it.route, q: it.q }));
          if (minInterval) criteria.minNotifyIntervalMs = Number(minInterval) * 1000;
          try {
            await fetch(`${API_BASE}/subscribe`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscription: sub, criteria }),
            });
          } catch (e) { /* ignore network errors */ }
          setSubscribed(true);
          setShowEditor(true);
          return;
        }

        // If permission is granted but subscription is missing, resubscribe silently (if not disabled)
        if (perm === "granted" && !sub) {
          if (!publicKey) { setSubscribed(false); setShowEditor(false); return; }
          try {
            const newSub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
            const criteria = {};
            if (items && items.length) criteria.items = items.map(it => ({ route: it.route, q: it.q }));
            if (minInterval) criteria.minNotifyIntervalMs = Number(minInterval) * 1000;
            await fetch(`${API_BASE}/subscribe`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ subscription: newSub, criteria }),
            }).catch(()=>{});
            setSubscribed(true);
            setShowEditor(true);
            setRegistration(reg);
            return;
          } catch (e) {
            setSubscribed(false);
            setShowEditor(false);
            return;
          }
        }

        // otherwise show Allow (minimal UI)
        setSubscribed(false);
        setShowEditor(false);
      } catch (e) {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Fix: ensure permission prompt happens on the user click, and use real reg returned by register()
  async function handleAllowClick() {
    // clear "disabled" flag since user explicitly re-enabled
    localStorage.removeItem(LOCAL_KEY_DISABLED);

    if (typeof Notification === "undefined") return;

    // first — request permission on the user gesture (this reliably shows the browser prompt)
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return; // user denied or dismissed
    } catch (e) {
      // some older browsers return a Promise rejection — fallback to checking Notification.permission
      if (Notification.permission !== "granted") return;
    }

    // ensure we have a real registration object (use returned reg if we just registered)
    let reg = registration;
    if (!reg) reg = await ensureServiceWorkerRegistered();
    if (!reg) return;
    try {
      const sub = await reg.pushManager.subscribe({
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

      setRegisteredSubscriptionState(reg, sub);
    } catch (e) {
      // subscribe failed (maybe user denied or browser issue)
    }
  }

  // small helper to set states after subscribe
  function setRegisteredSubscriptionState(reg, sub) {
    setRegistration(reg);
    setSubscribed(!!sub);
    setShowEditor(!!sub);
  }

  // add item uses uncontrolled input ref — prevents re-renders while typing so caret stays
  function addItem() {
    const v = (itemInputRef.current && itemInputRef.current.value || "").trim();
    if (!v) return;
    if (!USER_ROUTES.includes(itemRoute)) return;
    const newItem = { route: itemRoute, q: v };
    setItems(prev => {
      const next = [...prev, newItem];
      localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(next));
      return next;
    });
    if (itemInputRef.current) {
      itemInputRef.current.value = "";
      itemInputRef.current.focus(); // keep focus so user can add multiple quickly
    }
  }

  function removeItem(idx) {
    setItems(prev => {
      const next = prev.filter((_, i) => i !== idx);
      localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(next));
      return next;
    });
  }

  async function saveWatchlist() {
    if (!registration) {
      // attempt to register SW — but only do this if permission already granted; otherwise user should click Enable
      try {
        await ensureServiceWorkerRegistered();
      } catch {}
    }
    const sub = registration ? await registration.pushManager.getSubscription() : null;
    if (!sub) return; // not subscribed

    const criteria = {};
    if (items && items.length) criteria.items = items.map(it => ({ route: it.route, q: it.q }));
    if (minInterval) criteria.minNotifyIntervalMs = Number(minInterval) * 1000;

    // persist locally
    localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(items || []));
    localStorage.setItem(LOCAL_KEY_MININT, String(minInterval || 300));

    await fetch(`${API_BASE}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub, criteria }),
    }).catch(()=>{});
  }

  async function turnOff() {
    if (!registration) return;
    const sub = await registration.pushManager.getSubscription();
    if (sub) {
      try { await sub.unsubscribe(); } catch (e) {}
    }

    // set disabled flag so we won't auto-resubscribe or show editor on refresh
    localStorage.setItem(LOCAL_KEY_DISABLED, "1");

    setSubscribed(false);
    setShowEditor(false);
    setItems([]);
    localStorage.removeItem(LOCAL_KEY_ITEMS);
    localStorage.removeItem(LOCAL_KEY_MININT);

    // (optional) - if server supports an endpoint to remove by endpoint you can call it here to clean server-side
    // e.g. await fetch(`${API_BASE}/unsubscribe-by-endpoint`, { method: "POST", body: JSON.stringify({ endpoint: sub?.endpoint }) })
  }

  /* Small presentational helpers */
  const Card = ({ children }) => (
    <div className="rounded-2xl p-4 shadow-md" style={{ background: palette.card, border: `1px solid ${palette.border}`, color: palette.text }}>
      {children}
    </div>
  );

  const Small = ({ children }) => <div className="text-xs" style={{ color: palette.mutetext }}>{children}</div>;

  return (
    <div style={{ background: palette.bg }} className=" mx-auto p-6 rounded-2xl">
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-base font-semibold" style={{ color: palette.text }}>Notifications</div>
            <Small>Get alerts for items you care about (Seeds, Gear, Eggs)</Small>
          </div>
          <div>
            {!showEditor ? (
              <button onClick={handleAllowClick} className={`px-4 py-2 rounded-lg text-white ${palette.accentBtn}`}>
                Enable
              </button>
            ) : (
              <div className="text-xs" style={{ color: palette.mutetext }}>
                {subscribed ? "Enabled" : "Disabled"}
              </div>
            )}
          </div>
        </div>

        {showEditor && subscribed && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium" style={{ color: palette.text }}>Category</label>
              <select value={itemRoute} onChange={(e) => setItemRoute(e.target.value)} className="mt-1 block w-full rounded-md p-2" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${palette.border}`, color: palette.text }}>
                <option value="seeds">Seeds</option>
                <option value="gear">Gear</option>
                <option value="eggs">Eggs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium" style={{ color: palette.text }}>Add item name or id</label>
              <div className="mt-2 flex gap-2">
                {/* uncontrolled input to avoid caret/focus issues */}
                <input ref={itemInputRef} defaultValue="" placeholder="e.g. carrot or Carrot" className="flex-1 rounded-md p-2" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${palette.border}`, color: palette.text }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} />
                <button onClick={addItem} className="px-3 py-2 rounded-md text-[#071428]" style={{ background: palette.primary }}>Add</button>
              </div>
              <div className="mt-1 text-xs" style={{ color: palette.mutetext }}>You can add multiple items across Seeds, Gear and Eggs.</div>
            </div>

            <div>
              <div className="flex flex-col gap-2">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-2 rounded" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${palette.border}` }}>
                    <div>
                      <strong style={{ color: palette.text }}>{it.q}</strong>
                      <div className="text-xs" style={{ color: palette.mutetext }}>{it.route}</div>
                    </div>
                    <button onClick={() => removeItem(idx)} className="text-xs text-red-400">Remove</button>
                  </div>
                ))}
                {items.length === 0 && <div className="text-xs" style={{ color: palette.mutetext }}>No custom items yet.</div>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium" style={{ color: palette.text }}>Min notify interval (seconds)</label>
              <input type="number" value={minInterval} onChange={(e) => { const n = Number(e.target.value || 0); setMinInterval(n); localStorage.setItem(LOCAL_KEY_MININT, String(n)); }} className="mt-1 block w-full rounded-md p-2" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${palette.border}`, color: palette.text }} />
            </div>

            <div className="flex gap-2">
              <button onClick={saveWatchlist} className="px-4 py-2 rounded-lg text-[#071428]" style={{ background: palette.primary }}>Save</button>
              <button onClick={turnOff} className="px-4 py-2 rounded-lg text-white bg-red-600">Turn Off</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
