import axios from "axios";

const API = axios.create({
  baseURL: "https://acadfee.onrender.com",
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
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default API;
