import axios from "axios";

// Centralised base URL — change this one constant for all environments
export const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Shared axios instance with timeout + baseURL
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

// Request interceptor — attach auth header if token exists
api.interceptors.request.use(config => {
  const token = localStorage.getItem("edge_ai_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — normalise errors
api.interceptors.response.use(
  res => res,
  err => {
    console.error(`[API] ${err.config?.url} → ${err.message}`);
    return Promise.reject(err);
  }
);

// ── Core endpoints ──────────────────────────────────────────────────────────
export const getNodes    = ()       => api.get("/nodes");
export const getTasks    = ()       => api.get("/tasks");
export const getEvents   = ()       => api.get("/events");
export const getConfig   = ()       => api.get("/config");
export const getMetrics  = ()       => api.get("/metrics");
export const getLearning = ()       => api.get("/learning");

// ── Simulation control ──────────────────────────────────────────────────────
export const pauseSimulation  = () => api.post("/simulation/pause");
export const resumeSimulation = () => api.post("/simulation/play");
export const setSimSpeed      = (speed) => api.post("/simulation/speed", { speed });

// ── RL Agent ────────────────────────────────────────────────────────────────
export const getRLState   = ()         => api.get("/rl/state");
export const getRLPolicy  = ()         => api.get("/rl/policy");
export const triggerRLStep = ()        => api.post("/rl/step");

// ── Node management ─────────────────────────────────────────────────────────
export const getNodeDetail = (id)     => api.get(`/nodes/${id}`);
export const drainNode     = (id)     => api.post(`/nodes/${id}/drain`);

export default api;