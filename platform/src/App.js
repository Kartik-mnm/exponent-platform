import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Academies from "./pages/Academies";
import "./index.css";

const NAV = [
  { id: "dashboard",  label: "Dashboard",  icon: "▦", group: "main" },
  { id: "academies",  label: "Academies",  icon: "🏫", group: "main" },
];

function Shell() {
  const { admin, logout } = useAuth();
  const [page, setPage]   = useState("dashboard");

  if (!admin) return <Login />;

  const pages = { dashboard: Dashboard, academies: Academies };
  const Page  = pages[page] || Dashboard;

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">EXPONENT</div>
          <div className="logo-sub">Platform Control</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`nav-btn ${page === n.id ? "active" : ""}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-avatar">
            {admin.name?.[0]?.toUpperCase() || "K"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="admin-name">{admin.name}</div>
            <div className="admin-role">Platform Owner</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        <Page onNavigate={setPage} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
