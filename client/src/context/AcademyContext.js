// ============================================================
// EXPONENT PLATFORM - AcademyContext
//
// Loads academy branding + features on app startup.
// Resolves academy from:
//   1. Subdomain: nishchay.exponent.app  → slug = "nishchay"
//   2. localStorage fallback (for localhost dev)
//   3. Hardcoded fallback slug = "nishchay"
//
// Provides:
//   academy.name, academy.logo_url, academy.primary_color,
//   academy.features, academy.phone, academy.address, etc.
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AcademyCtx = createContext(null);

// Resolve which academy slug we're running as
function resolveSlug() {
  // 1. Try subdomain (production)
  const host = window.location.hostname; // e.g. "nishchay.exponent.app"
  const parts = host.split(".");
  if (parts.length >= 3 && parts[0] !== "www" && parts[0] !== "app") {
    return parts[0]; // "nishchay"
  }
  // 2. Try localStorage (set manually during dev)
  const stored = localStorage.getItem("academy_slug");
  if (stored) return stored;

  // 3. Hardcoded fallback for development
  return "nishchay";
}

// Apply academy colors as CSS variables on <html>
function applyTheme(primary_color, accent_color) {
  if (!primary_color) return;
  const root = document.documentElement;
  // Convert hex (without #) to full hex
  const primary = primary_color.startsWith("#") ? primary_color : `#${primary_color}`;
  const accent  = accent_color
    ? (accent_color.startsWith("#") ? accent_color : `#${accent_color}`)
    : primary;

  root.style.setProperty("--blue-600",   primary);
  root.style.setProperty("--blue-500",   primary);
  root.style.setProperty("--blue-400",   accent);
  root.style.setProperty("--accent",     primary);
  root.style.setProperty("--accent-dim", accent);
}

export function AcademyProvider({ children }) {
  const [academy, setAcademy]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const slug = resolveSlug();

    axios
      .get(`https://acadfee.onrender.com/api/academy/config?slug=${slug}`)
      .then(({ data }) => {
        setAcademy(data);
        applyTheme(data.primary_color, data.accent_color);
        // Store slug so it persists on refresh
        localStorage.setItem("academy_slug", slug);
      })
      .catch((err) => {
        console.error("Failed to load academy config:", err.message);
        // Fallback — use defaults so the app still works
        setAcademy({
          id:            1,
          name:          "Nishchay Academy",
          slug:          "nishchay",
          logo_url:      null,
          tagline:       "",
          primary_color: "2563EB",
          accent_color:  "38BDF8",
          city:          "Nagpur",
          phone:         "",
          email:         "",
          address:       "",
          features: {
            attendance: true, tests: true, expenses: true,
            admissions: true, notifications: true,
            id_cards: true, qr_scanner: true, reports: true,
          },
          plan: "pro",
          is_active: true,
        });
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AcademyCtx.Provider value={{ academy, loading, error }}>
      {children}
    </AcademyCtx.Provider>
  );
}

// Hook for easy access
export const useAcademy = () => useContext(AcademyCtx);
