import { useState, useEffect } from "react";
import API from "../api";

export default function Dashboard({ onNavigate }) {
  const [stats, setStats]   = useState(null);
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/platform/stats"),
      API.get("/platform/academies"),
    ]).then(([s, a]) => {
      setStats(s.data);
      setAcademies(a.data.slice(0, 5)); // top 5 for overview
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">⟳ Loading dashboard...</div>;

  const statCards = [
    { label: "Total Academies", value: stats?.academies?.total || 0, hint: `${stats?.academies?.active || 0} active`, color: "#6366f1" },
    { label: "Total Students", value: stats?.total_students || 0, hint: "across all academies", color: "#22c55e" },
    { label: "Fees This Month", value: `₹${((stats?.fees_this_month || 0) / 1000).toFixed(1)}K`, hint: "collected platform-wide", color: "#f59e0b" },
    { label: "Inactive", value: stats?.academies?.inactive || 0, hint: "academies suspended", color: "#ef4444" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Platform-wide overview</div>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("academies")}>
          + Add Academy
        </button>
      </div>

      {/* Stat cards */}
      <div className="section">
        <div className="card-grid">
          {statCards.map((s) => (
            <div key={s.label} className="stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-hint">{s.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent academies */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ margin: 0 }}>Recent Academies</div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("academies")}>
              View all →
            </button>
          </div>
          {academies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏫</div>
              <div className="empty-text">No academies yet. Add your first one!</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {academies.map((a) => (
                <div key={a.id} className="academy-card">
                  <div
                    className="academy-avatar"
                    style={{ background: `#${a.primary_color || "6366f1"}` }}
                  >
                    {a.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="academy-name">{a.name}</div>
                    <div className="academy-meta">
                      {a.city || "—"} · {a.student_count || 0} students · {a.branch_count || 0} branches
                    </div>
                  </div>
                  <span className={`badge ${a.is_active ? "badge-green" : "badge-red"}`}>
                    {a.is_active ? "Active" : "Suspended"}
                  </span>
                  <span className={`badge badge-blue`} style={{ marginLeft: 6 }}>
                    {a.plan}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
