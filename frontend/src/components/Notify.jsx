// PushSubscribe.jsx (production-ready — fixed minInterval bug, toasts, loading, safe SW + subscribe flow)
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
  const DEFAULT_MIN_INTERVAL = 300; // seconds
  const API_BASE = import.meta.env.VITE_STOCK_SERVER || "http://localhost:8000";
  const publicKey = vapidPublicKey || (typeof window !== "undefined" && window.VAPID_PUBLIC_KEY) || "";

  // SW / subscription state
  const [registration, setRegistration] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // permission state: "default" | "granted" | "denied"
  const [permissionState, setPermissionState] = useState(typeof Notification !== "undefined" ? Notification.permission : "default");

  // user inputs
  const [items, setItems] = useState([]);
  const itemInputRef = useRef(null); // uncontrolled input for smooth typing
  const [itemRoute, setItemRoute] = useState("seeds");
  const [minInterval, setMinInterval] = useState(DEFAULT_MIN_INTERVAL); // <-- FIXED: include setter

  // local storage keys
  const LOCAL_KEY_ITEMS = "push_watch_items_v2";
  const LOCAL_KEY_MININT = "push_watch_minint_v2";
  const LOCAL_KEY_USER_ENABLED = "push_watch_user_enabled_v1"; // "1" or "0"

  // allowed user routes
  const USER_ROUTES = ["seeds", "gear", "eggs"];

  // palette
  const palette = {
    bg: "#112240",
    card: "#0b1b2a",
    border: "#102a3a",
    text: "#ccd6f6",
    mutetext: "#8892b0",
    primary: "#64ffda",
    accentBtn: "bg-emerald-600",
  };

  // UI state for actions
  const [loadingEnable, setLoadingEnable] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingTurnOff, setLoadingTurnOff] = useState(false);

  // toasts
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  function showToast(text, type = "info", ttl = 4000) {
    const id = ++toastId.current;
    setToasts((s) => [...s, { id, text, type }]);
    setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), ttl);
  }

  // Helper to register SW (returns registration)
  async function ensureServiceWorkerRegistered() {
    if (!("serviceWorker" in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      setRegistration(reg);
      return reg;
    } catch (err) {
      console.warn("[Push] SW registration failed", err);
      return null;
    }
  }

  // Keep permissionState in sync via Permissions API if available
  useEffect(() => {
    if (!("permissions" in navigator) || !("Notification" in window)) {
      setPermissionState(typeof Notification !== "undefined" ? Notification.permission : "default");
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const status = await navigator.permissions.query({ name: "notifications" });
        if (!mounted) return;
        setPermissionState(status.state || Notification.permission);
        const onChange = () => setPermissionState(status.state || Notification.permission);
        if (status.addEventListener) status.addEventListener("change", onChange);
        else status.onchange = onChange;
      } catch (e) {
        setPermissionState(Notification.permission);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // On mount: restore items/minInterval and attempt resync only if user previously enabled
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LOCAL_KEY_ITEMS) || "[]");
      if (Array.isArray(saved)) setItems(saved);
      const savedMin = Number(localStorage.getItem(LOCAL_KEY_MININT) || DEFAULT_MIN_INTERVAL);
      if (!Number.isNaN(savedMin)) setMinInterval(savedMin);
    } catch (e) {
      // ignore parse errors
    }

    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    (async () => {
      try {
        const reg = await ensureServiceWorkerRegistered();
        if (!reg) return;

        const sub = await reg.pushManager.getSubscription();
        const perm = (typeof Notification !== "undefined" && Notification.permission) ? Notification.permission : "default";
        const userEnabled = localStorage.getItem(LOCAL_KEY_USER_ENABLED);

        // If user explicitly turned OFF previously, do not auto-resubscribe or show editor
        if (userEnabled === "0") {
          setSubscribed(false);
          setShowEditor(false);
          console.log("[Push] user disabled previously -> not auto-resubscribing");
          return;
        }

        // If user previously enabled and permission granted, ensure server has subscription
        if (userEnabled === "1") {
          if (perm === "granted") {
            if (sub) {
              try {
                const criteria = {};
                if (items && items.length) criteria.items = items.map((it) => ({ route: it.route, q: it.q }));
                criteria.minNotifyIntervalMs = Number(minInterval || DEFAULT_MIN_INTERVAL) * 1000;
                await fetch(`${API_BASE}/subscribe`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ subscription: sub, criteria }),
                });
                setSubscribed(true);
                setShowEditor(true);
                setRegistration(reg);
                console.log("[Push] resynced subscription for enabled user");
                return;
              } catch (e) {
                console.warn("[Push] sync failed", e);
              }
            } else {
              // attempt silent re-subscribe if possible
              if (!publicKey) { setSubscribed(false); setShowEditor(false); return; }
              try {
                const newSub = await reg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(publicKey),
                });
                const criteria = {};
                if (items && items.length) criteria.items = items.map((it) => ({ route: it.route, q: it.q }));
                criteria.minNotifyIntervalMs = Number(minInterval || DEFAULT_MIN_INTERVAL) * 1000;
                await fetch(`${API_BASE}/subscribe`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ subscription: newSub, criteria }),
                }).catch(()=>{});
                setSubscribed(true);
                setShowEditor(true);
                setRegistration(reg);
                console.log("[Push] re-subscribed silently for previously enabled user");
                return;
              } catch (e) { console.warn("[Push] re-subscribe failed", e); }
            }
          } else {
            // permission not granted -> user must click Allow to re-enable
            setSubscribed(false);
            setShowEditor(false);
            console.log("[Push] userEnabled=1 but permission not granted; waiting for user");
            return;
          }
        }

        // default: not subscribed / show Allow
        setSubscribed(false);
        setShowEditor(false);
      } catch (e) {
        console.warn("[Push] mount error", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // open browser notification settings (Chrome desktop helper)
  function openBrowserNotificationSettings() {
    try { window.open("chrome://settings/content/notifications", "_blank"); } catch (e) { /* ignore */ }
  }

  // ENABLE button (user gesture required): request permission then subscribe
  async function handleAllowClick() {
    if (typeof Notification === "undefined") {
      showToast("Notifications not supported by this browser", "error");
      return;
    }

    // if blocked, show instructions
    if (permissionState === "denied" || Notification.permission === "denied") {
      showToast("Notifications are blocked in your browser. Open site settings to re-enable.", "error");
      return;
    }

    if (loadingEnable) return;
    setLoadingEnable(true);
    showToast("Requesting permission...", "info");

    // Prompt for permission (user gesture)
    let perm;
    try {
      perm = await Notification.requestPermission();
    } catch (e) {
      perm = Notification.permission;
    }

    if (perm !== "granted") {
      showToast(`Permission ${perm}. Notifications not enabled.`, "error");
      setPermissionState(perm || Notification.permission);
      setLoadingEnable(false);
      return;
    }

    // ensure SW registered
    const reg = registration || (await ensureServiceWorkerRegistered());
    if (!reg) {
      showToast("Service worker registration failed", "error");
      setLoadingEnable(false);
      return;
    }

    // subscribe push
    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // build criteria
      const criteria = {};
      if (items && items.length) criteria.items = items.map((it) => ({ route: it.route, q: it.q }));
      criteria.minNotifyIntervalMs = Number(minInterval || DEFAULT_MIN_INTERVAL) * 1000;

      // post to server
      await fetch(`${API_BASE}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, criteria }),
      }).catch(() => { /* ignore network fails */ });

      localStorage.setItem(LOCAL_KEY_USER_ENABLED, "1");
      setRegistration(reg);
      setSubscribed(true);
      setShowEditor(true);
      setPermissionState("granted");
      showToast("Notifications enabled", "success");
    } catch (e) {
      console.warn("[Push] subscribe error", e);
      showToast("Subscription failed", "error");
    } finally {
      setLoadingEnable(false);
    }
  }

  // add item (uncontrolled input)
  function addItem() {
    const v = ((itemInputRef.current && itemInputRef.current.value) || "").trim();
    if (!v) return;
    if (!USER_ROUTES.includes(itemRoute)) return;
    const newItem = { route: itemRoute, q: v };
    setItems((prev) => {
      const next = [...prev, newItem];
      localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(next));
      return next;
    });
    if (itemInputRef.current) {
      itemInputRef.current.value = "";
      itemInputRef.current.focus();
    }
    showToast("Item added", "success");
  }

  function removeItem(idx) {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(next));
      return next;
    });
    showToast("Item removed", "info");
  }

  // save watchlist: sends criteria to server (sub must exist)
  async function saveWatchlist() {
    if (loadingSave) return;
    setLoadingSave(true);
    try {
      if (!registration) await ensureServiceWorkerRegistered();
      const sub = registration ? await registration.pushManager.getSubscription() : null;
      if (!sub) {
        showToast("Not subscribed — click Enable first", "error");
        setLoadingSave(false);
        return;
      }

      const criteria = {};
      if (items && items.length) criteria.items = items.map((it) => ({ route: it.route, q: it.q }));
      criteria.minNotifyIntervalMs = Number(minInterval || DEFAULT_MIN_INTERVAL) * 1000;

      localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(items || []));
      localStorage.setItem(LOCAL_KEY_MININT, String(minInterval || DEFAULT_MIN_INTERVAL));

      await fetch(`${API_BASE}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, criteria }),
      }).catch(() => { /* ignore */ });

      showToast("Watchlist saved", "success");
    } catch (e) {
      console.warn("[Push] save failed", e);
      showToast("Save failed", "error");
    } finally {
      setLoadingSave(false);
    }
  }

  // turn off: unsubscribe and mark disabled
  async function turnOff() {
    if (loadingTurnOff) return;
    setLoadingTurnOff(true);
    try {
      if (registration) {
        try {
          const sub = await registration.pushManager.getSubscription();
          if (sub) {
            try { await sub.unsubscribe(); } catch (e) { /* ignore */ }
          }
        } catch (e) { /* ignore */ }
      }

      localStorage.setItem(LOCAL_KEY_USER_ENABLED, "0");
      setSubscribed(false);
      setShowEditor(false);
      setItems([]);
      localStorage.removeItem(LOCAL_KEY_ITEMS);
      localStorage.removeItem(LOCAL_KEY_MININT);
      showToast("Notifications turned off", "info");
    } catch (e) {
      console.warn("[Push] turnOff error", e);
      showToast("Failed to turn off", "error");
    } finally {
      setLoadingTurnOff(false);
    }
  }

  /* Presentational helpers */
  const Card = ({ children }) => (
    <div className="rounded-2xl p-4 shadow-md" style={{ background: palette.card, border: `1px solid ${palette.border}`, color: palette.text }}>
      {children}
    </div>
  );
  const Small = ({ children }) => <div className="sm:text-sm text-xs" style={{ color: palette.mutetext }}>{children}</div>;

  const Spinner = ({ size = 16 }) => (
    <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.12)" strokeWidth="4"></circle>
      <path d="M22 12a10 10 0 00-10-10" stroke={palette.primary} strokeWidth="4" strokeLinecap="round"></path>
    </svg>
  );

  return (
    <div style={{ background: palette.bg }} className="mx-auto p-6 rounded-2xl">
      {/* Toasts */}
      <div aria-live="polite" className="fixed top-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-2 rounded-md shadow-md max-w-xs ${t.type === "success" ? "bg-green-600 text-white" : t.type === "error" ? "bg-red-600 text-white" : "bg-gray-800 text-white"}`}>
            {t.text}
          </div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-base font-semibold" style={{ color: palette.text }}>Notifications</div>
            <Small>Get alerts for items you care about (Seeds, Gear, Eggs)</Small>
          </div>

          <div>
            {!showEditor ? (
              <button
                type="button"
                onClick={handleAllowClick}
                disabled={loadingEnable || permissionState === "denied"}
                aria-disabled={loadingEnable || permissionState === "denied"}
                className={`px-4 py-2 rounded-lg text-white transition transform ${palette.accentBtn} ${loadingEnable ? "opacity-70 cursor-wait" : "hover:-translate-y-0.5 active:scale-95"}`}
                title={permissionState === "denied" ? "Notifications blocked by browser" : "Enable notifications"}
              >
                {loadingEnable ? <span className="inline-flex items-center gap-2"><Spinner size={14} /> Enabling...</span> : "Enable"}
              </button>
            ) : (
              <div className="text-xs" style={{ color: palette.mutetext }}>{subscribed ? "Enabled" : "Disabled"}</div>
            )}
          </div>
        </div>

        {/* Blocked instructions */}
        {(permissionState === "denied" || Notification.permission === "denied") && (
          <div className="mb-4 p-3 rounded" style={{ background: "rgba(255,0,0,0.04)", border: `1px solid rgba(255,0,0,0.08)`, color: palette.text }}>
            <div className="font-semibold">Notifications blocked</div>
            <div className="text-xs" style={{ color: palette.mutetext }}>
              You previously blocked notifications for this site. Your browser will not show the permission prompt again. To re-enable notifications, change the site permission in your browser settings.
            </div>

            <div className="mt-3 flex gap-2">
              <button type="button" onClick={openBrowserNotificationSettings} className="px-3 py-2 rounded-md bg-[#64ffda] text-[#071428]">Open Chrome settings</button>
              <button type="button" onClick={() => window.alert(`Steps to re-enable (examples):
- Chrome (desktop): Settings → Privacy and security → Site Settings → Notifications → allow for this site
- Firefox: Preferences → Privacy & Security → Permissions → Notifications → Remove block for this site
- Safari (mac): Safari → Preferences → Websites → Notifications`)} className="px-3 py-2 rounded-md bg-[#0b74ff] text-white">How to enable</button>
            </div>
          </div>
        )}

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
                <input ref={itemInputRef} defaultValue="" placeholder="e.g. carrot or Carrot" className="flex-1 rounded-md p-2" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${palette.border}`, color: palette.text }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} />
                <button type="button" onClick={addItem} className="px-3 py-2 rounded-md text-[#071428] transition transform hover:-translate-y-0.5 active:scale-95" style={{ background: palette.primary }}>Add</button>
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
                    <button type="button" onClick={() => removeItem(idx)} className="text-xs text-red-400">Remove</button>
                  </div>
                ))}
                {items.length === 0 && <div className="text-xs" style={{ color: palette.mutetext }}>No custom items yet.</div>}
              </div>
            </div>

            <div className="flex gap-2">
              <button type="button" onClick={saveWatchlist} disabled={loadingSave} className={`px-4 py-2 rounded-lg text-[#071428] ${loadingSave ? "opacity-80 cursor-wait" : ""}`} style={{ background: palette.primary }}>
                {loadingSave ? <span className="inline-flex items-center gap-2"><Spinner size={14} />Saving...</span> : "Save"}
              </button>
              <button type="button" onClick={turnOff} disabled={loadingTurnOff} className={`px-4 py-2 rounded-lg text-white ${loadingTurnOff ? "opacity-80 cursor-wait" : "bg-red-600 hover:brightness-95 active:scale-95"}`}>
                {loadingTurnOff ? <span className="inline-flex items-center gap-2"><Spinner size={14} />Turning off...</span> : "Turn Off"}
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
