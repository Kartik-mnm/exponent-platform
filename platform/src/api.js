import axios from "axios";

// Always use the custom domain — never the old Render URL
const API_BASE = "https://api.exponentgrow.in";

const API = axios.create({
  baseURL: API_BASE,
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
