import { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthCtx = createContext(null);

// Hardcoded API base — never depends on env var so can never be wrong
const API_BASE = "https://acadfee.onrender.com";

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem("platform_admin")); }
    catch { return null; }
  });

  const login = async (email, password) => {
    // Use axios directly with the hardcoded base URL
    const { data } = await axios.post(
      `${API_BASE}/platform/auth/login`,
      { email, password },
      { withCredentials: true }
    );
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
