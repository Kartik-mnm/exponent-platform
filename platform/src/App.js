import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Landing       from "./pages/Landing";
import Login         from "./pages/Login";
import Dashboard     from "./pages/Dashboard";
import Academies     from "./pages/Academies";
import Subscriptions from "./pages/Subscriptions";
import Analytics     from "./pages/Analytics";
import Settings      from "./pages/Settings";
import GetStarted    from "./pages/GetStarted";
import Signup        from "./pages/Signup";
import SignupSuccess  from "./pages/SignupSuccess";
import AuditLog      from "./pages/AuditLog";
import Leads         from "./pages/Leads";
import Revenue       from "./pages/Revenue";
import "./index.css";

const NAV = [
  { id: "dashboard",     label: "Dashboard",     icon: "\u2b21",  group: "main" },
  { id: "academies",     label: "Academies",     icon: "\ud83c\udfeb",  group: "main" },
  { id: "leads",         label: "Leads",         icon: "\ud83d\udcec",  group: "main" },
  { id: "subscriptions", label: "Subscriptions", icon: "\ud83d\udcb3",  group: "main" },
  { id: "revenue",       label: "Revenue",       icon: "\ud83d\udcb0",  group: "main" },
  { id: "analytics",    label: "Analytics",     icon: "\ud83d\udcca",  group: "main" },
  { id: "audit",        label: "Audit Log",     icon: "\ud83d\udccb",  group: "system" },
  { id: "settings",     label: "Settings",      icon: "\u2699",   group: "system" },
];

const PAGE_META = {
  dashboard:     { title: "Dashboard",      sub: "Platform-wide overview" },
  academies:     { title: "Academies",      sub: "Manage all onboarded academies" },
  leads:         { title: "Leads",          sub: "Follow up on Quick Setup enquiries" },
  subscriptions: { title: "Subscriptions",  sub: "Plans, billing & expiry management" },
  revenue:       { title: "Revenue",        sub: "Manual log of all payments received" },
  analytics:     { title: "Analytics",      sub: "Usage stats & growth insights" },
  audit:         { title: "Audit Log",      sub: "All platform actions tracked" },
  settings:      { title: "Settings",       sub: "Platform configuration" },
};

const ACADEMY_APP = "https://app.exponentgrow.in";
const LOGO_KEY    = "exponent_platform_logo";

/**
 * Exponent logo — shows the uploaded logo image if one has been saved,
 * otherwise falls back to the default SVG "E" mark.
 * Reads from localStorage (set by Settings.js after upload + DB save).
 */
function ExponentLogo({ size = 34 }) {
  const [logoUrl, setLogoUrl] = useState(() => localStorage.getItem(LOGO_KEY) || null);

  // Re-read from localStorage if Settings page updates it while shell is mounted
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === LOGO_KEY) setLogoUrl(e.newValue || null);
    };
    window.addEventListener("storage", onStorage);
    // Also poll once — storage event doesn't fire on same-tab writes
    const interval = setInterval(() => {
      const current = localStorage.getItem(LOGO_KEY);
      setLogoUrl(prev => prev !== current ? current : prev);
    }, 2000);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(interval); };
  }, []);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Platform logo"
        style={{ width: size, height: size, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
        onError={() => setLogoUrl(null)} // if Cloudinary URL breaks, fall back to SVG
      />
    );
  }

  // Default SVG fallback
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
      <text x="16" y="23" textAnchor="middle"
        fontFamily="Arial,sans-serif" fontSize="20" fontWeight="900" fill="white">E</text>
    </svg>
  );
}

function Shell() {
  const { admin, logout } = useAuth();
  const [page, setPage]   = useState("dashboard");
  const [view, setView]   = useState("landing");
  const [signupData, setSignupData] = useState(null);

  if (!admin) {
    if (view === "get-started")
      return <GetStarted onBack={() => setView("landing")} onSignup={() => setView("signup")} />;
    if (view === "signup")
      return <Signup onBack={() => setView("get-started")} onSuccess={(data) => { setSignupData(data); setView("signup-success"); }} />;
    if (view === "signup-success")
      return <SignupSuccess data={signupData} onLogin={() => { window.location.href = ACADEMY_APP; }} />;
    if (view === "login") return <Login />;
    return <Landing onLogin={() => setView("login")} onGetStarted={() => setView("get-started")} />;
  }

  const pages = {
    dashboard: Dashboard, academies: Academies, leads: Leads,
    subscriptions: Subscriptions, revenue: Revenue,
    analytics: Analytics, settings: Settings, audit: AuditLog,
  };
  const Page  = pages[page] || Dashboard;
  const meta  = PAGE_META[page] || {};
  const mainNav = NAV.filter(n => n.group === "main");
  const sysNav  = NAV.filter(n => n.group === "system");

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <ExponentLogo size={34} />
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
          <button className="logout-btn" onClick={logout} title="Sign out">&#9211;</button>
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title">{meta.title}</div>
            <div className="topbar-sub">{meta.sub}</div>
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)", padding: "5px 10px", background: "var(--bg3)", borderRadius: 6, border: "1px solid var(--border)" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
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
