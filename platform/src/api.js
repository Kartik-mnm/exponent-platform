import axios from "axios";

// Always use the hardcoded Render URL — no env var that can be misconfigured
const API = axios.create({
  baseURL: "https://acadfee.onrender.com",
  withCredentials: true,
});

API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("platform_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only auto-redirect on 401 when NOT on the login endpoint
    const url = err.config?.url || "";
    const isLoginRoute = url.includes("/auth/login");
    if (err.response?.status === 401 && !isLoginRoute) {
      localStorage.removeItem("platform_token");
      localStorage.removeItem("platform_admin");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default API;
