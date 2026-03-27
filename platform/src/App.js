import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing      from "./pages/Landing";
import Login        from "./pages/Login";
import Dashboard    from "./pages/Dashboard";
import Academies    from "./pages/Academies";
import Subscriptions from "./pages/Subscriptions";
import Analytics    from "./pages/Analytics";
import Settings     from "./pages/Settings";
import GetStarted   from "./pages/GetStarted";
import "./index.css";

const NAV = [
  { id: "dashboard",     label: "Dashboard",     icon: "\u2B21",  group: "main" },
  { id: "academies",     label: "Academies",     icon: "\uD83C\uDFEB",  group: "main" },
  { id: "subscriptions", label: "Subscriptions", icon: "\uD83D\uDCB3",  group: "main" },
  { id: "analytics",    label: "Analytics",     icon: "\uD83D\uDCCA",  group: "main" },
  { id: "settings",     label: "Settings",      icon: "\u2699",   group: "system" },
];

const PAGE_META = {
  dashboard:     { title: "Dashboard",      sub: "Platform-wide overview" },
  academies:     { title: "Academies",      sub: "Manage all onboarded academies" },
  subscriptions: { title: "Subscriptions",  sub: "Plans, billing & expiry management" },
  analytics:     { title: "Analytics",      sub: "Usage stats & revenue insights" },
  settings:      { title: "Settings",       sub: "Platform configuration" },
};

// ── Admin shell (shown when logged in) ───────────────────────────────────────────────
function Shell() {
  const { admin, logout } = useAuth();
  const [page, setPage]   = useState("dashboard");
  // view: "landing" | "get-started" | "login"
  const [view, setView]   = useState("landing");

  // ── Public flow (not yet logged into admin panel) ───────────────────────
  if (!admin) {
    if (view === "get-started")
      return <GetStarted onBack={() => setView("landing")} />;

    if (view === "login") return <Login />;

    // Default: landing page
    return (
      <Landing
        onLogin={() => setView("login")}
        onGetStarted={() => setView("get-started")}
      />
    );
  }

  // ── Logged-in admin panel ───────────────────────────────────────────────
  const pages = { dashboard: Dashboard, academies: Academies, subscriptions: Subscriptions, analytics: Analytics, settings: Settings };
  const Page  = pages[page] || Dashboard;
  const meta  = PAGE_META[page] || {};
  const mainNav = NAV.filter(n => n.group === "main");
  const sysNav  = NAV.filter(n => n.group === "system");

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">E</div>
          <div>
            <div className="logo-mark">EXPONENT</div>
            <div className="logo-sub">Platform Control</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main</div>
          {mainNav.map(n => (
            <button key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
          <div className="sidebar-section-label" style={{ marginTop: 8 }}>System</div>
          {sysNav.map(n => (
            <button key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
              <span className="nav-icon">{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="admin-avatar">{admin.name?.[0]?.toUpperCase() || "A"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="admin-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{admin.name}</div>
            <div className="admin-role">Platform Owner</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out">⏻</button>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-sub">{meta.sub}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text3)", padding: "5px 10px", background: "var(--bg3)", borderRadius: 6, border: "1px solid var(--border)" }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>
        <div className="page-body"><Page onNavigate={setPage} /></div>
      </main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><Shell /></AuthProvider>;
}
