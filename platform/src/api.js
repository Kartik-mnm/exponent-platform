import axios from "axios";
import config from "./config";

// Uses REACT_APP_API_URL env var at build time
// Falls back to live Render URL if not set
const API = axios.create({
  baseURL: config.apiUrl,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("platform_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("platform_token");
      localStorage.removeItem("platform_admin");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default API;
