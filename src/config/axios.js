import axios from "axios";

// Set config defaults when creating the instance
const api = axios.create({
  baseURL: "/api",
});

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // ignore storage errors
  }
  return config;
});

export default api;
