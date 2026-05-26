/**
 * api.js  —  Innolead CRM frontend API client
 *
 * Drop this file into your React src/ folder.
 * Set REACT_APP_API_URL in your frontend .env:
 *   REACT_APP_API_URL=https://your-backend.onrender.com
 *
 * Usage:
 *   import api from "./api";
 *   const accounts = await api.accounts.list();
 *   await api.auth.login({ email, password });
 */

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// ─── Token storage ─────────────────────────────────────────────────────────────
export const token = {
  get:    ()    => localStorage.getItem("crm_token"),
  set:    (t)   => localStorage.setItem("crm_token", t),
  clear:  ()    => localStorage.removeItem("crm_token"),
};

// ─── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const t = token.get();
  if (t) headers["Authorization"] = `Bearer ${t}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;          // No Content (deletes)

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.detail ?? `HTTP ${res.status}`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data;
}

const get    = (path)        => request("GET",    path);
const post   = (path, body)  => request("POST",   path, body);
const patch  = (path, body)  => request("PATCH",  path, body);
const put    = (path, body)  => request("PUT",    path, body);
const del    = (path)        => request("DELETE", path);

// ─── API surface ───────────────────────────────────────────────────────────────
const api = {
  auth: {
    register: (body)  => post("/auth/register", body),
    login:    async (body) => {
      const data = await post("/auth/login", body);
      token.set(data.access_token);
      return data;
    },
    logout:   ()      => token.clear(),
    me:       ()      => get("/auth/me"),
  },

  accounts: {
    list:   ()          => get("/accounts/"),
    get:    (id)        => get(`/accounts/${id}`),
    create: (body)      => post("/accounts/", body),
    update: (id, body)  => put(`/accounts/${id}`, body),
    delete: (id)        => del(`/accounts/${id}`),
  },

  opportunities: {
    list:   (stage)     => get(`/opportunities/${stage ? `?stage=${stage}` : ""}`),
    get:    (id)        => get(`/opportunities/${id}`),
    create: (body)      => post("/opportunities/", body),
    update: (id, body)  => patch(`/opportunities/${id}`, body),
    delete: (id)        => del(`/opportunities/${id}`),
  },

  activities: {
    list:   (filters = {}) => {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      ).toString();
      return get(`/activities/${qs ? `?${qs}` : ""}`);
    },
    get:    (id)        => get(`/activities/${id}`),
    create: (body)      => post("/activities/", body),
    update: (id, body)  => patch(`/activities/${id}`, body),
    delete: (id)        => del(`/activities/${id}`),
  },

  users: {
    list:   ()          => get("/users/"),
    get:    (id)        => get(`/users/${id}`),
    update: (id, body)  => patch(`/users/${id}`, body),
    delete: (id)        => del(`/users/${id}`),
  },
};

export default api;
