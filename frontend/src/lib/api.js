// src/lib/api.js
import axios from "axios";

const API_BASE =  "https://gagbackendserver-timer-8vixn.ondigitalocean.app"; // Vite
// Fallback: empty means use relative path (useful with proxy)
const baseURL = API_BASE ? API_BASE.replace(/\/$/, "") : "";

const api = axios.create({
  baseURL: baseURL || undefined,
  headers: { "Cache-Control": "no-cache" },
  timeout: 15000,
});

export default api;
