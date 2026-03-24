import { useState, useEffect } from "react";
import API from "../api";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function Dashboard({ onNavigate }) {
  const [stats, setStats]       = useState(null);
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      API.get("/platform/stats"),
      API.get("/platform/academies"),
    ]).then(([s, a]) => {
      setStats(s.data);
      setAcademies(a.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ fontSize: 13, color: "var(--text3)" }}>⟳ Loading…</div>
    </div>
  );

  const active   = academies.filter((a) => a.is_active);
  const inactive = academies.filter((a) => !a.is_active);
  const totalStudents = academies.reduce((s, a) => s + parseInt(a.student_count || 0), 0);
  const totalBranches = academies.reduce((s, a) => s + parseInt(a.branch_count  || 0), 0);

  const statCards = [
    { label: "Total Academies", value: academies.length, hint: `${active.length} active · ${inactive.length} suspended`, color: "#6366f1", icon: "🏫" },
    { label: "Total Students",  value: totalStudents,    hint: "across all academies",   color: "#22c55e", icon: "🎓" },
    { label: "Total Branches",  value: totalBranches,    hint: "across all academies",   color: "#06b6d4", icon: "🏢" },
    { label: "Fees This Month", value: fmt(stats?.fees_this_month || 0), hint: "platform-wide collection", color: "#f59e0b", icon: "💰" },
  ];

  const recent = [...academies].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Platform-wide overview · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate("academies")}>+ New Academy</button>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {statCards.map((s) => (
          <div key={s.label} style={{
            background: "var(--bg2)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "18px 20px",
            borderTop: `3px solid ${s.color}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, margin: "10px 0 4px", letterSpacing: "-0.5px" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>{s.hint}</div>
          </div>
        ))}
      </div>

      {/* Quick health bar */}
      {academies.length > 0 && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Platform Health</div>
            <div style={{ fontSize: 12, color: "var(--text3)" }}>{active.length} / {academies.length} academies active</div>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "var(--bg3)", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              width: `${Math.round((active.length / academies.length) * 100)}%`,
              background: active.length === academies.length ? "var(--green)" : active.length / academies.length > 0.7 ? "var(--yellow)" : "var(--red)",
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>
      )}

      {/* Academies grid */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Recent Academies</div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("academies")}>View all →</button>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-icon">🏫</div>
            <div className="empty-text">No academies yet. Add your first one!</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 1, background: "var(--border)" }}>
            {recent.map((a) => {
              const primary = a.primary_color
                ? (a.primary_color.startsWith("#") ? a.primary_color : `#${a.primary_color}`)
                : "#6366f1";
              const usage = a.max_students > 0 ? Math.min(100, Math.round((a.student_count / a.max_students) * 100)) : 0;
              return (
                <div key={a.id} style={{ background: "var(--bg2)", padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, background: primary,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 16, overflow: "hidden", flexShrink: 0,
                    }}>
                      {a.logo_url
                        ? <img src={a.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        : a.name[0]?.toUpperCase()
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)" }}>/{a.slug} · {a.city || "—"}</div>
                    </div>
                    <span className={`badge ${a.is_active ? "badge-green" : "badge-red"}`}>
                      {a.is_active ? "Active" : "Off"}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>
                    <span>{a.student_count || 0} students</span>
                    <span>{usage}% capacity</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: "var(--bg3)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${usage}%`,
                      background: usage > 90 ? "var(--red)" : usage > 70 ? "var(--yellow)" : primary,
                      transition: "width 0.5s",
                    }} />
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    <span className="badge badge-blue" style={{ fontSize: 10 }}>{a.plan}</span>
                    <span className="badge" style={{ fontSize: 10, background: "var(--bg3)", color: "var(--text3)" }}>{a.branch_count || 0} branches</span>
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
