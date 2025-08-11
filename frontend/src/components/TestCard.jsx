// src/components/BridgeDashboard.jsx
import React, { useEffect, useMemo } from "react";
import useBridgeData from "./useBridgeData.js";

/**
 * BridgeDashboard props:
 *  - wsUrl (optional) default "ws://localhost:8000"
 */
export default function BridgeDashboard({ wsUrl = "ws://localhost:8000" }) {
  const { data, wsConnected, lastUpdated, error } = useBridgeData({
    url: wsUrl,
  });
  useEffect(() => {
    data && console.log(data);
  }, [data]);

  // normalize arrays safely
  const weather = useMemo(() => {
    const w = data?.weather ?? data?.WEATHER ?? [];
    if (!Array.isArray(w)) return [];
    // unify possible shapes (active/isActive)
    // return w.map((it) => ({
    //   name: it.weather_name ?? it.weather_id ?? it.name ?? it.id ?? "Unknown",
    //   active: it.active,
    //   start: it.start_duration_unix ?? it.start ?? 0,
    //   end: it.end_duration_unix ?? it.end ?? 0,
    // }));
    return w.filter((it) => it.active);
  }, [data]);
  const stocks = useMemo(() => {
    // where keys could be seeds, gear, eggs, cosmetics (case-insensitive)
    const out = {
      seeds: data?.seed_stock ?? data?.SEED_STOCK ?? data?.seed?.items ?? [],
      gear: data?.gear_stock ?? data?.GEAR_STOCK ?? data?.gear?.items ?? [],
      eggs: data?.egg_stock ?? data?.eggs_STOCK ?? data?.egg?.items ?? [],
      cosmetics:
        data?.cosmetic_stock ??
        data?.COSMETIC_STOCK ??
        data?.cosmetics?.items ??
        [],
    };
    // ensure arrays
    Object.keys(out).forEach((k) => {
      if (!Array.isArray(out[k])) out[k] = [];
    });
    return out;
  }, [data]);

  return (
    <div
      style={{
        padding: 20,
        maxWidth: 1200,
        margin: "0 auto",
        fontFamily: "Inter, system-ui, Arial",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>🌱 Grow A Garden — Live Dashboard</h1>
          <p style={{ margin: 0, color: "#666", fontSize: 13 }}>
            Realtime stock & weather (via local bridge)
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                background: wsConnected ? "#16a34a" : "#ef4444",
                display: "inline-block",
              }}
            />
            <div style={{ fontSize: 13 }}>
              {wsConnected ? "Live" : "Disconnected"}
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
            {lastUpdated
              ? `Updated: ${new Date(lastUpdated).toLocaleTimeString()}`
              : "No updates yet"}
          </div>
        </div>
      </header>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
            color: "#7f1d1d",
          }}
        >
          {String(error)}
        </div>
      )}

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ marginBottom: 8 }}>Current Weather</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {/* {weather.length === 0 ? (
            <div
              style={{ padding: 12, background: "#f3f4f6", borderRadius: 8 }}
            >
              No active weather
            </div>
          ) : (
            weather
              .filter((w) => w.active)
              .map((w, idx) => (
                <div
                  key={idx}
                  style={{
                    minWidth: 200,
                    padding: 12,
                    background: "#ffffff",
                    borderRadius: 10,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{w.name}</div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
                    {w.start
                      ? `Start: ${new Date(
                          w.start * 1000
                        ).toLocaleTimeString()}`
                      : ""}
                    {w.end
                      ? ` • End: ${new Date(w.end * 1000).toLocaleTimeString()}`
                      : ""}
                  </div>
                </div>
              ))
          )} */}
          
          {weather &&
            weather.length !== 0 &&
            weather.map(
              (w) =>
                w.active  && (
                  <div
                    key={w.name}
                    style={{
                      minWidth: 200,
                      padding: 12,
                      background: "#ffffff",
                      borderRadius: 10,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{w.weather_name}</div>
                    <div style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
                      {w.start_duration_unix
                        ? `Start: ${new Date(
                            w.start * 1000
                          ).toLocaleTimeString()}`
                        : ""}
                      {w.end_duration_unix
                        ? ` • End: ${new Date(
                            w.end * 1000
                          ).toLocaleTimeString()}`
                        : ""}
                    </div>
                  </div>
                )
            )}
        </div>
      </section>

      <section style={{ marginBottom: 18 }}>
        <h2 style={{ marginBottom: 8 }}>Stocks</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 12,
          }}
        >
          <StockCard title="Seeds" items={stocks.seeds} />
          <StockCard title="Gear" items={stocks.gear} />
          <StockCard title="Eggs" items={stocks.eggs} />
          <StockCard title="Cosmetics" items={stocks.cosmetics} />
        </div>
      </section>
    </div>
  );
}

// small, simple stock card
function StockCard({ title, items = [] }) {
  return (
    <div
      style={{
        padding: 12,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        minHeight: 120,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong>{title}</strong>
        <span style={{ fontSize: 12, color: "#555" }}>{items.length}</span>
      </div>

      <div style={{ marginTop: 10, maxHeight: 260, overflow: "auto" }}>
        {items.length === 0 ? (
          <div style={{ fontSize: 13, color: "#666" }}>No items</div>
        ) : (
          items.map((it, i) => {
            const name =
              it.display_name ?? it.name ?? it.item_name ?? it.id ?? "Unknown";
            const qty = it.quantity ?? it.qty ?? 0;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <div style={{ fontSize: 14 }}>{name}</div>
                <div style={{ fontSize: 13, color: "#333" }}>{qty}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
