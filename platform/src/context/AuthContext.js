import { createContext, useContext, useState } from "react";
import API from "../api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem("platform_admin")); }
    catch { return null; }
  });

  const login = async (email, password) => {
    const { data } = await API.post("/platform/auth/login", { email, password });
    localStorage.setItem("platform_token", data.token);
    localStorage.setItem("platform_admin", JSON.stringify(data.admin));
    setAdmin(data.admin);
  };

  const logout = () => {
    localStorage.removeItem("platform_token");
    localStorage.removeItem("platform_admin");
    setAdmin(null);
  };

  return (
    <AuthCtx.Provider value={{ admin, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
