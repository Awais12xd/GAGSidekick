// PushSubscribe.jsx (updated - handles permission "denied" gracefully)
import React, { useEffect, useRef, useState } from "react";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i)
    outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function PushSubscribe({ vapidPublicKey }) {
  const DEFAULT_MIN_INTERVAL = 300; // seconds
  const API_BASE = import.meta.env.VITE_STOCK_SERVER || "http://localhost:8000";
  const publicKey =
    vapidPublicKey ||
    (typeof window !== "undefined" && window.VAPID_PUBLIC_KEY) ||
    "";

  const [registration, setRegistration] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // permission state: "default" | "granted" | "denied"
  const [permissionState, setPermissionState] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  // items are objects: { route: 'seeds'|'gear'|'eggs', q: 'carrot' }
  const [items, setItems] = useState([]);
  const itemInputRef = useRef(null); // uncontrolled input
  const [itemRoute, setItemRoute] = useState("seeds");
  // ... inside component:
  const [minInterval /* no setMinInterval used */] =
    useState(DEFAULT_MIN_INTERVAL); // simple default

  // local storage keys
  const LOCAL_KEY_ITEMS = "push_watch_items_v2";
  const LOCAL_KEY_MININT = "push_watch_minint_v2";
  const LOCAL_KEY_USER_ENABLED = "push_watch_user_enabled_v1"; // "1" or "0"

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
      setRegistration(reg);
      return reg;
    } catch (err) {
      console.warn("[Push] SW registration failed", err);
      return null;
    }
  }

  // Query Permissions API (if supported) to track changes in notification permission
  useEffect(() => {
    if (!("permissions" in navigator) || !("Notification" in window)) {
      setPermissionState(
        typeof Notification !== "undefined"
          ? Notification.permission
          : "default"
      );
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const status = await navigator.permissions.query({
          name: "notifications",
        });
        if (!mounted) return;
        setPermissionState(status.state || Notification.permission);
        const onChange = () =>
          setPermissionState(status.state || Notification.permission);
        status.addEventListener
          ? status.addEventListener("change", onChange)
          : (status.onchange = onChange);
      } catch (e) {
        setPermissionState(Notification.permission);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Read saved items and userEnabled flag, then attempt to resync only if userEnabled === "1"
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LOCAL_KEY_ITEMS) || "[]");
      if (Array.isArray(saved)) setItems(saved);
      const savedMin = Number(localStorage.getItem(LOCAL_KEY_MININT) || 300);
      if (!Number.isNaN(savedMin)) setMinInterval(savedMin);
    } catch (e) {
      /* ignore parse errors */
    }

    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    (async () => {
      try {
        const reg = await ensureServiceWorkerRegistered();
        if (!reg) return;

        const sub = await reg.pushManager.getSubscription();
        const perm =
          typeof Notification !== "undefined" && Notification.permission
            ? Notification.permission
            : "default";
        const userEnabled = localStorage.getItem(LOCAL_KEY_USER_ENABLED);

        // If user explicitly turned OFF previously, do not auto-resubscribe or show editor
        if (userEnabled === "0") {
          setSubscribed(false);
          setShowEditor(false);
          console.log(
            "[Push] user disabled notifications previously -> not auto-resubscribing"
          );
          return;
        }

        // If user previously enabled (explicitly) and permission is granted, ensure server has subscription
        if (userEnabled === "1") {
          if (perm === "granted") {
            // If subscription exists, sync it; otherwise attempt to subscribe (user previously allowed)
            if (sub) {
              try {
                // const criteria = {};
                // if (items && items.length)
                //   criteria.items = items.map((it) => ({
                //     route: it.route,
                //     q: it.q,
                //   }));
                // if (minInterval)
                //   criteria.minNotifyIntervalMs = Number(minInterval) * 1000;
                const criteria = {};
                if (items && items.length)
                  criteria.items = items.map((it) => ({
                    route: it.route,
                    q: it.q,
                  }));
                criteria.minNotifyIntervalMs = DEFAULT_MIN_INTERVAL * 1000;
                await fetch(`${API_BASE}/subscribe`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ subscription: sub, criteria }),
                });
                setSubscribed(true);
                setShowEditor(true);
                setRegistration(reg);
                console.log(
                  "[Push] resynced existing subscription for enabled user"
                );
                return;
              } catch (e) {
                console.warn("[Push] sync failed", e);
              }
            } else {
              // attempt to re-subscribe silently because user explicitly enabled previously
              if (!publicKey) {
                setSubscribed(false);
                setShowEditor(false);
                return;
              }
              try {
                const newSub = await reg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(publicKey),
                });
                const criteria = {};
                if (items && items.length)
                  criteria.items = items.map((it) => ({
                    route: it.route,
                    q: it.q,
                  }));
                if (minInterval)
                  criteria.minNotifyIntervalMs = Number(minInterval) * 1000;
                await fetch(`${API_BASE}/subscribe`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ subscription: newSub, criteria }),
                }).catch(() => {});
                setSubscribed(true);
                setShowEditor(true);
                setRegistration(reg);
                console.log(
                  "[Push] re-subscribed silently for previously enabled user"
                );
                return;
              } catch (e) {
                console.warn("[Push] re-subscribe failed", e);
              }
            }
          } else {
            // permission not granted -> the user must click Allow to re-enable
            setSubscribed(false);
            setShowEditor(false);
            console.log(
              "[Push] userEnabled=1 but permission not granted; waiting for user interaction"
            );
            return;
          }
        }

        // default behaviour: not subscribed / show Allow
        setSubscribed(false);
        setShowEditor(false);
      } catch (e) {
        console.warn("[Push] mount error", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attempt to open browser settings for notifications. Works in Chrome with chrome:// URL,
  // won't work in some browsers — still useful for users on Chrome desktop.
  function openBrowserNotificationSettings() {
    try {
      // Chrome desktop
      window.open("chrome://settings/content/notifications", "_blank");
    } catch (e) {
      // ignore
    }
  }

  // MAIN: called on user click — must open permission popup reliably
  async function handleAllowClick() {
    if (typeof Notification === "undefined") {
      console.warn("[Push] Notifications not supported in this browser");
      return;
    }

    // If the permission is explicitly "denied", the browser won't show a prompt.
    // Show a useful UI instead (we set permissionState earlier so UI can reflect this).
    if (permissionState === "denied" || Notification.permission === "denied") {
      // show an in-component message (we render it below) and provide a settings link button
      // Keep console log for debugging:
      console.log(
        "[Push] permission is denied — browser will not show prompt. Instruct user to enable via browser settings."
      );
      // we bail here — UI will render the instructions for the user
      return;
    }

    // Request permission directly (user gesture)
    let perm;
    try {
      perm = await Notification.requestPermission();
    } catch (e) {
      perm = Notification.permission;
    }

    // If user denied or dismissed, we respect that and do NOT set the component enabled
    if (perm !== "granted") {
      console.log("[Push] permission result:", perm);
      return;
    }

    // permission granted — ensure we have a SW reg and subscribe
    const reg = registration || (await ensureServiceWorkerRegistered());
    if (!reg) {
      console.warn(
        "[Push] could not obtain service worker registration after permission"
      );
      return;
    }

    // perform subscription
    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // build criteria from saved items
      const criteria = {};
      if (items && items.length)
        criteria.items = items.map((it) => ({ route: it.route, q: it.q }));
      if (minInterval)
        criteria.minNotifyIntervalMs = Number(minInterval) * 1000;

      // send to server
      await fetch(`${API_BASE}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, criteria }),
      }).catch(() => {
        /* ignore network failures here */
      });

      // IMPORTANT: mark that the user explicitly enabled our component UI
      localStorage.setItem(LOCAL_KEY_USER_ENABLED, "1");

      // update local state
      setRegistration(reg);
      setSubscribed(true);
      setShowEditor(true);
      setPermissionState("granted");
      console.log(
        "[Push] subscription successful and userEnabled set -> editor visible"
      );
    } catch (e) {
      console.warn("[Push] subscribe error", e);
    }
  }

  // add item uses uncontrolled input ref — prevents re-renders while typing so caret stays
  function addItem() {
    const v = (
      (itemInputRef.current && itemInputRef.current.value) ||
      ""
    ).trim();
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
      itemInputRef.current.focus(); // keep focus so user can add multiple quickly
    }
  }

  function removeItem(idx) {
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(next));
      return next;
    });
  }

  async function saveWatchlist() {
    // attempt to ensure registration if not present
    if (!registration) {
      try {
        await ensureServiceWorkerRegistered();
      } catch {}
    }
    const sub = registration
      ? await registration.pushManager.getSubscription()
      : null;
    if (!sub) return; // not subscribed — user should click Enable first

    const criteria = {};
    if (items && items.length)
      criteria.items = items.map((it) => ({ route: it.route, q: it.q }));
    if (minInterval) criteria.minNotifyIntervalMs = Number(minInterval) * 1000;

    localStorage.setItem(LOCAL_KEY_ITEMS, JSON.stringify(items || []));
    localStorage.setItem(LOCAL_KEY_MININT, String(minInterval || 300));

    await fetch(`${API_BASE}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription: sub, criteria }),
    }).catch(() => {});
    console.log("[Push] saved watchlist to server");
  }

  async function turnOff() {
    // get current subscription and unsubscribe client-side
    if (registration) {
      try {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          try {
            await sub.unsubscribe();
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }
    }

    // mark user explicitly disabled — this prevents ANY auto-resubscribe behavior until user clicks Allow again
    localStorage.setItem(LOCAL_KEY_USER_ENABLED, "0");

    setSubscribed(false);
    setShowEditor(false);
    setItems([]);
    localStorage.removeItem(LOCAL_KEY_ITEMS);
    localStorage.removeItem(LOCAL_KEY_MININT);

    console.log(
      "[Push] user turned off notifications and userEnabled set to 0"
    );
  }

  /* Small presentational helpers */
  const Card = ({ children }) => (
    <div
      className="rounded-2xl p-4 shadow-md"
      style={{
        background: palette.card,
        border: `1px solid ${palette.border}`,
        color: palette.text,
      }}
    >
      {children}
    </div>
  );

  const Small = ({ children }) => (
    <div className="sm:text-sm text-xs" style={{ color: palette.mutetext }}>
      {children}
    </div>
  );

  return (
    <div
      style={{ background: palette.bg }}
      className=" mx-auto p-6 rounded-2xl"
    >
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            
            <Small>
              Get alerts for items you care about (Seeds, Gear, Eggs)
            </Small>
          </div>
          <div>
            {!showEditor ? (
              <button
                type="button"
                onClick={handleAllowClick}
                className={`px-4 py-2 rounded-lg text-white ${palette.accentBtn}`}
              >
                Enable
              </button>
            ) : (
              <div className="text-xs" style={{ color: palette.mutetext }}>
                {subscribed ? "Enabled" : "Disabled"}
              </div>
            )}
          </div>
        </div>

        {/* If browser permission is denied: show instructions instead of attempting to re-request */}
        {(permissionState === "denied" ||
          Notification.permission === "denied") && (
          <div
            className="mb-4 p-3 rounded"
            style={{
              background: "rgba(255,0,0,0.04)",
              border: `1px solid rgba(255,0,0,0.08)`,
              color: palette.text,
            }}
          >
            <div className="font-semibold">Notifications blocked</div>
            <div className="text-xs" style={{ color: palette.mutetext }}>
              You previously blocked notifications for this site. Your browser
              will not show the permission prompt again. To re-enable
              notifications, change the site permission in your browser
              settings.
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={openBrowserNotificationSettings}
                className="px-3 py-2 rounded-md bg-[#64ffda] text-[#071428]"
              >
                Open Chrome notification settings
              </button>
              <button
                type="button"
                onClick={() =>
                  window.alert(`Steps to re-enable (examples):
- Chrome (desktop): Settings → Privacy and security → Site Settings → Notifications → allow for this site
- Firefox: Preferences → Privacy & Security → Permissions → Notifications → Remove block for this site
- Safari (mac): Safari → Preferences → Websites → Notifications`)
                }
                className="px-3 py-2 rounded-md bg-[#0b74ff] text-white"
              >
                How to enable
              </button>
            </div>
          </div>
        )}

        {showEditor && subscribed && (
          <div className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: palette.text }}
              >
                Category
              </label>
              <select
                value={itemRoute}
                onChange={(e) => setItemRoute(e.target.value)}
                className="mt-1 block w-full rounded-md p-2"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${palette.border}`,
                  color: palette.text,
                }}
              >
                <option value="seeds">Seeds</option>
                <option value="gear">Gear</option>
                <option value="eggs">Eggs</option>
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: palette.text }}
              >
                Add item name or id
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  ref={itemInputRef}
                  defaultValue=""
                  placeholder="e.g. carrot or Carrot"
                  className="flex-1 rounded-md p-2"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${palette.border}`,
                    color: palette.text,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addItem();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addItem}
                  className="px-3 py-2 rounded-md text-[#071428]"
                  style={{ background: palette.primary }}
                >
                  Add
                </button>
              </div>
              <div className="mt-1 text-xs" style={{ color: palette.mutetext }}>
                You can add multiple items across Seeds, Gear and Eggs.
              </div>
            </div>

            <div>
              <div className="flex flex-col gap-2">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${palette.border}`,
                    }}
                  >
                    <div>
                      <strong style={{ color: palette.text }}>{it.q}</strong>
                      <div
                        className="text-xs"
                        style={{ color: palette.mutetext }}
                      >
                        {it.route}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-xs text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-xs" style={{ color: palette.mutetext }}>
                    No custom items yet.
                  </div>
                )}
              </div>
            </div>

            {/* <div>
              <label
                className="block text-sm font-medium"
                style={{ color: palette.text }}
              >
                Min notify interval (seconds)
              </label>
              <input
                type="number"
                value={minInterval}
                onChange={(e) => {
                  const n = Number(e.target.value || 0);
                  setMinInterval(n);
                  localStorage.setItem(LOCAL_KEY_MININT, String(n));
                }}
                className="mt-1 block w-full rounded-md p-2"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${palette.border}`,
                  color: palette.text,
                }}
              />
            </div> */}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveWatchlist}
                className="px-4 py-2 rounded-lg text-[#071428]"
                style={{ background: palette.primary }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={turnOff}
                className="px-4 py-2 rounded-lg text-white bg-red-600"
              >
                Turn Off
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
