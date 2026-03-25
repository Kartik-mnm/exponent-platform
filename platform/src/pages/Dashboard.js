import { useState, useEffect } from "react";
import API from "../api";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function ExpiryAlert({ academies }) {
  const soon = academies.filter(a => {
    if (!a.trial_ends_at) return false;
    const days = Math.ceil((new Date(a.trial_ends_at) - new Date()) / 86400000);
    return days <= 14 && days >= 0;
  });
  const expired = academies.filter(a => {
    if (!a.trial_ends_at) return false;
    return new Date(a.trial_ends_at) < new Date();
  });

  if (!soon.length && !expired.length) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      {expired.length > 0 && (
        <div className="alert alert-danger">
          <span>🚨</span>
          <div><strong>{expired.length} academy subscription(s) expired</strong> — {expired.map(a => a.name).join(", ")}. Renew to restore access.</div>
        </div>
      )}
      {soon.length > 0 && (
        <div className="alert alert-warning">
          <span>⚠️</span>
          <div><strong>{soon.length} subscription(s) expiring soon</strong> — {soon.map(a => a.name).join(", ")}. Contact them to renew.</div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const [academies, setAcademies] = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/platform/academies"),
      API.get("/platform/stats"),
    ]).then(([a, s]) => {
      setAcademies(a.data);
      setStats(s.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="spinner">⟳ Loading platform data…</div>
  );

  const active      = academies.filter(a => a.is_active);
  const inactive    = academies.filter(a => !a.is_active);
  const totalStudents = academies.reduce((s, a) => s + parseInt(a.student_count || 0), 0);
  const totalBranches = academies.reduce((s, a) => s + parseInt(a.branch_count  || 0), 0);
  const expiringCount = academies.filter(a => {
    if (!a.trial_ends_at) return false;
    const d = Math.ceil((new Date(a.trial_ends_at) - new Date()) / 86400000);
    return d <= 14;
  }).length;

  const statCards = [
    { label: "Total Academies", value: academies.length,   hint: `${active.length} active · ${inactive.length} suspended`, icon: "🏫", accent: "#6366f1", glow: "rgba(99,102,241,0.12)" },
    { label: "Total Students",  value: totalStudents,      hint: "across all academies",                                   icon: "🎓", accent: "#10b981", glow: "rgba(16,185,129,0.12)" },
    { label: "Total Branches",  value: totalBranches,      hint: "across all academies",                                   icon: "🏢", accent: "#06b6d4", glow: "rgba(6,182,212,0.12)" },
    { label: "Fees This Month", value: fmt(stats?.fees_this_month), hint: "platform-wide",                                icon: "💰", accent: "#f59e0b", glow: "rgba(245,158,11,0.12)" },
    { label: "Expiring Soon",   value: expiringCount,      hint: "within 14 days",                                        icon: "⏳", accent: "#ef4444", glow: "rgba(239,68,68,0.12)" },
  ];

  const recent = [...academies]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  return (
    <div>
      <ExpiryAlert academies={academies} />

      {/* Stat cards */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <div key={s.label} className="stat-card" style={{ "--card-accent": s.accent, "--card-glow": s.glow }}>
            <div className="icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.accent }}>{s.value}</div>
            <div className="stat-hint">{s.hint}</div>
          </div>
        ))}
      </div>

      {/* Platform health */}
      {academies.length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Platform Health</div>
              <div className="card-sub">{active.length} of {academies.length} academies active</div>
            </div>
            <span className={`badge ${active.length === academies.length ? "badge-green" : active.length / academies.length > 0.7 ? "badge-yellow" : "badge-red"}`}>
              {Math.round((active.length / academies.length) * 100)}% Healthy
            </span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${(active.length / academies.length) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent academies */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Academies</div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("academies")}>View all →</button>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}><div className="empty-text">No academies yet</div></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recent.map(a => {
                const primary = a.primary_color ? (a.primary_color.startsWith("#") ? a.primary_color : `#${a.primary_color}`) : "#6366f1";
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: "var(--bg3)" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, overflow: "hidden", flexShrink: 0 }}>
                      {a.logo_url ? <img src={a.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : a.name[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>{a.student_count || 0} students · {a.plan}</div>
                    </div>
                    <span className={`badge ${a.is_active ? "badge-green" : "badge-red"}`} style={{ fontSize: 10 }}>{a.is_active ? "Active" : "Off"}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Subscription summary */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Plan Distribution</div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("subscriptions")}>Manage →</button>
          </div>
          {["basic", "pro", "enterprise"].map(plan => {
            const count = academies.filter(a => a.plan === plan).length;
            const pct   = academies.length ? Math.round((count / academies.length) * 100) : 0;
            const colors = { basic: "#64748b", pro: "#6366f1", enterprise: "#f59e0b" };
            return (
              <div key={plan} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{plan}</span>
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>{count} academies · {pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: colors[plan] }} />
                </div>
              </div>
            );
          })}

          <div className="divider" />
          <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center" }}>
            {academies.length} total academies on platform
          </div>
        </div>
      </div>
    </div>
  );
}
