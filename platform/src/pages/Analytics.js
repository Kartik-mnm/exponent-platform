import { useState, useEffect } from "react";
import API from "../api";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Analytics() {
  const [academies, setAcademies] = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [sortBy, setSortBy]       = useState("students");

  useEffect(() => {
    Promise.all([API.get("/platform/academies"), API.get("/platform/stats")])
      .then(([a, s]) => { setAcademies(a.data); setStats(s.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">⟳ Loading analytics…</div>;

  const sorted = [...academies].sort((a, b) => {
    if (sortBy === "students") return (b.student_count || 0) - (a.student_count || 0);
    if (sortBy === "branches") return (b.branch_count  || 0) - (a.branch_count  || 0);
    if (sortBy === "name")     return a.name.localeCompare(b.name);
    return 0;
  });

  const maxStudents = Math.max(...academies.map(a => a.student_count || 0), 1);

  const planBreakdown = ["basic", "pro", "enterprise"].map(p => ({
    plan: p,
    count: academies.filter(a => a.plan === p).length,
    students: academies.filter(a => a.plan === p).reduce((s, a) => s + parseInt(a.student_count || 0), 0),
  }));

  const PLAN_COLORS = { basic: "#64748b", pro: "#6366f1", enterprise: "#f59e0b" };

  return (
    <div>
      {/* Top KPIs */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: "Total Academies",  value: academies.length,   color: "#6366f1" },
          { label: "Active Academies", value: academies.filter(a => a.is_active).length, color: "#10b981" },
          { label: "Total Students",   value: academies.reduce((s, a) => s + parseInt(a.student_count || 0), 0), color: "#06b6d4" },
          { label: "Total Branches",   value: academies.reduce((s, a) => s + parseInt(a.branch_count  || 0), 0), color: "#a855f7" },
          { label: "Avg Students",     value: academies.length ? Math.round(academies.reduce((s, a) => s + parseInt(a.student_count || 0), 0) / academies.length) : 0, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ "--card-accent": s.color }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Plan breakdown */}
        <div className="card">
          <div className="card-header"><div className="card-title">Plan Breakdown</div></div>
          {planBreakdown.map(p => (
            <div key={p.plan} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, textTransform: "capitalize", color: PLAN_COLORS[p.plan] }}>{p.plan}</span>
                <span style={{ fontSize: 12, color: "var(--text3)" }}>{p.count} academies · {p.students} students</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${academies.length ? (p.count / academies.length) * 100 : 0}%`, background: PLAN_COLORS[p.plan] }} />
              </div>
            </div>
          ))}
        </div>

        {/* Active vs inactive */}
        <div className="card">
          <div className="card-header"><div className="card-title">Access Status</div></div>
          {[["Active", academies.filter(a => a.is_active).length, "var(--green)"],
            ["Suspended", academies.filter(a => !a.is_active).length, "var(--red)"]].map(([label, count, color]) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
                <span style={{ fontSize: 12, color: "var(--text3)" }}>{count} academies</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${academies.length ? (count / academies.length) * 100 : 0}%`, background: color }} />
              </div>
            </div>
          ))}
          <div className="divider" />
          <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "center" }}>
            {Math.round(academies.filter(a => a.is_active).length / (academies.length || 1) * 100)}% platform uptime
          </div>
        </div>
      </div>

      {/* Academy leaderboard */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Academy Usage Leaderboard</div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "5px 10px", fontSize: 12, width: 140 }}>
            <option value="students">By Students</option>
            <option value="branches">By Branches</option>
            <option value="name">By Name</option>
          </select>
        </div>
        {sorted.length === 0 ? <div className="empty-state" style={{ padding: 30 }}><div className="empty-text">No academies yet</div></div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sorted.map((a, i) => {
              const pct = Math.round(((a.student_count || 0) / maxStudents) * 100);
              const primary = a.primary_color ? (a.primary_color.startsWith("#") ? a.primary_color : `#${a.primary_color}`) : "#6366f1";
              return (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 9, background: "var(--bg3)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", minWidth: 20, textAlign: "center" }}>#{i + 1}</div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, overflow: "hidden", flexShrink: 0 }}>
                    {a.logo_url ? <img src={a.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : a.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{a.name}</div>
                    <div className="progress-bar" style={{ height: 5 }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: primary }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{a.student_count || 0} <span style={{ fontSize: 10, color: "var(--text3)" }}>students</span></div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{a.branch_count || 0} branches</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
