import axios from "axios";
import config from "./config";

const API = axios.create({
  baseURL: config.apiUrl,
});

API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("platform_token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only auto-redirect on 401 when NOT on the login endpoint.
    // Previously this fired on login failures too — causing the instant page refresh.
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
