// src/hooks/index.js
import useBridgeKey from "./useBridgeKey.js";

// adjust candidate keys based on what your upstream uses
export function useWeather(opts = {}) {
  return useBridgeKey({ path: "/weather", candidateKeys: ["weather", "WEATHER"], ...opts });
}
export function useSeeds(opts = {}) {
  return useBridgeKey({ path: "/seeds", candidateKeys: ["seed_stock", "seed_stock", "seeds", "SEED_STOCK", "seed"], ...opts });
}
export function useGear(opts = {}) {
  return useBridgeKey({ path: "/gear", candidateKeys: ["gear_stock", "gear", "GEAR_STOCK", "GEAR"], ...opts });
}
export function useEggs(opts = {}) {
  return useBridgeKey({ path: "/eggs", candidateKeys: ["egg_stock", "eggs", "EGG_STOCK", "EGG"], ...opts });
}
export function useCosmetics(opts = {}) {
  return useBridgeKey({ path: "/cosmetics", candidateKeys: ["cosmetic_stock", "cosmetics", "COSMETIC_STOCK"], ...opts });
}
