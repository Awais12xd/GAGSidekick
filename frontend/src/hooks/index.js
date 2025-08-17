// src/hooks/index.js
import useBridgeKey from "./useBridgeKey.js";

// adjust candidate keys based on what your upstream uses
export function useWeather(opts = {}) {
  return useBridgeKey({
    path: "/weather",
    candidateKeys: ["weather", "WEATHER"],
    ...opts,
  });
}
export function useSeeds(opts = {}) {
  return useBridgeKey({
    path: "/seeds",
    candidateKeys: ["seed_stock", "seedStock", "seeds", "SEED_STOCK", "seed"],
    ...opts,
  });
}
export function useGear(opts = {}) {
  return useBridgeKey({
    path: "/gear",
    candidateKeys: ["gear_stock", "gear", "GEAR_STOCK", "GEAR"],
    ...opts,
  });
}
export function useEggs(opts = {}) {
  return useBridgeKey({
    path: "/eggs",
    candidateKeys: ["egg_stock", "eggs", "EGG_STOCK", "EGG"],
    ...opts,
  });
}
export function useCosmetics(opts = {}) {
  return useBridgeKey({
    path: "/cosmetics",
    candidateKeys: ["cosmetic_stock", "cosmetics", "COSMETIC_STOCK"],
    ...opts,
  });
}
export function useAllData(opts = {}) {
  return useBridgeKey({ path: "/alldata", ...opts });
}

// New: traveling merchant stock (matches server route /travelingmerchant_stock)
export function useTravelingMerchant(opts = {}) {
  return useBridgeKey({
    path: "/travelingmerchant",
    candidateKeys: [
      "travelingmerchant_stock",
      "traveling_merchant_stock",
      "travelingmerchant",
      "traveling_merchant",
      "traveling_merchant_stock_v2",
      // Add any other variants your upstream might use
    ],
    ...opts,
  });
}
