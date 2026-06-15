// src/admin/adminApi.js
// All admin API calls — connects frontend to /api/admin/* backend routes

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// The admin token must match ADMIN_SECRET_TOKEN in your backend .env
const TOKEN = import.meta.env.VITE_ADMIN_TOKEN || "payg-admin-secret";

async function adminFetch(path, options = {}) {
  const res = await fetch(`${BASE}/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-token": TOKEN,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ─── STATS ────────────────────────────────────────────────────────────────────
export const getStats = () => adminFetch("/stats");

// ─── USERS ────────────────────────────────────────────────────────────────────
export const getUsers = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return adminFetch(`/users?${q}`);
};
export const getUserDetail = (id) => adminFetch(`/users/${id}`);
export const updateUser = (id, body) =>
  adminFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });

// ─── CLAIMS ───────────────────────────────────────────────────────────────────
export const getClaims = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return adminFetch(`/claims?${q}`);
};
export const updateClaim = (id, body) =>
  adminFetch(`/claims/${id}`, { method: "PATCH", body: JSON.stringify(body) });

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const getTransactions = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return adminFetch(`/transactions?${q}`);
};

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
export const getSubscriptionSummary = () => adminFetch("/subscriptions/summary");
export const adjustWallet = (userId, body) =>
  adminFetch(`/subscriptions/${userId}/wallet`, { method: "PATCH", body: JSON.stringify(body) });

// ─── BROADCAST ────────────────────────────────────────────────────────────────
export const sendBroadcast = (body) =>
  adminFetch("/broadcast", { method: "POST", body: JSON.stringify(body) });
