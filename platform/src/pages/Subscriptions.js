import { useState, useEffect } from "react";
import API from "../api";

const PLAN_CONFIG = {
  basic:      { label: "Basic",      color: "#64748b", glow: "rgba(100,116,139,0.15)", students: 200,  branches: 3  },
  pro:        { label: "Pro",        color: "#6366f1", glow: "rgba(99,102,241,0.15)",  students: 500,  branches: 10 },
  enterprise: { label: "Enterprise", color: "#f59e0b", glow: "rgba(245,158,11,0.15)",  students: 9999, branches: 99 },
};

function daysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function ExpiryBadge({ date }) {
  if (!date) return <span className="badge badge-gray">No Expiry</span>;
  const d = daysLeft(date);
  if (d < 0)   return <span className="badge badge-red">Expired {Math.abs(d)}d ago</span>;
  if (d <= 7)  return <span className="badge badge-red">{d}d left</span>;
  if (d <= 30) return <span className="badge badge-yellow">{d}d left</span>;
  return <span className="badge badge-green">{d}d left</span>;
}

function EditSubModal({ academy, onClose, onSaved }) {
  const [form, setForm] = useState({
    plan:          academy.plan || "basic",
    max_students:  academy.max_students || 200,
    max_branches:  academy.max_branches || 3,
    trial_ends_at: academy.trial_ends_at ? academy.trial_ends_at.split("T")[0] : "",
    is_active:     academy.is_active !== false,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectPlan = (plan) => {
    const cfg = PLAN_CONFIG[plan];
    setForm(f => ({ ...f, plan, max_students: cfg.students, max_branches: cfg.branches }));
  };

  const save = async () => {
    setSaving(true); setErr("");
    try {
      await API.put(`/platform/academies/${academy.id}`, form);
      onSaved();
    } catch (e) { setErr(e.response?.data?.error || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-title">Subscription — {academy.name}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-group full" style={{ marginBottom: 20 }}>
            <label>Select Plan</label>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {Object.entries(PLAN_CONFIG).map(([key, cfg]) => (
                <div key={key} onClick={() => selectPlan(key)}
                  style={{ flex: 1, padding: "12px", borderRadius: 9, cursor: "pointer",
                    border: `2px solid ${form.plan === key ? cfg.color : "var(--border2)"}`,
                    background: form.plan === key ? `${cfg.glow}` : "var(--bg3)",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: form.plan === key ? cfg.color : "var(--text2)" }}>{cfg.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{cfg.students === 9999 ? "Unlimited" : cfg.students} students</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Max Students</label>
              <input type="number" value={form.max_students} onChange={e => set("max_students", parseInt(e.target.value))} min={1} />
            </div>
            <div className="form-group">
              <label>Max Branches</label>
              <input type="number" value={form.max_branches} onChange={e => set("max_branches", parseInt(e.target.value))} min={1} />
            </div>
            <div className="form-group full">
              <label>Subscription Expiry Date</label>
              <input type="date" value={form.trial_ends_at} onChange={e => set("trial_ends_at", e.target.value)} />
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Leave blank for no expiry. System auto-suspends when expired.</div>
            </div>
            <div className="form-group full">
              <label>Access Status</label>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                {[true, false].map(v => (
                  <div key={String(v)} onClick={() => set("is_active", v)}
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                      border: `2px solid ${form.is_active === v ? (v ? "var(--green)" : "var(--red)") : "var(--border2)"}`,
                      background: form.is_active === v ? (v ? "var(--green-dim)" : "var(--red-dim)") : "var(--bg3)",
                      textAlign: "center", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: v ? "var(--green)" : "var(--red)" }}>{v ? "✓ Active" : "✗ Suspended"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {err && <div className="alert alert-danger" style={{ marginTop: 12 }}>{err}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "✓ Save Changes"}</button>
        </div>
      </div>
    </div>
  );
}

export default function Subscriptions() {
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("all");
  const [search, setSearch]       = useState("");
  const [editTarget, setEditTarget] = useState(null);

  const load = () => {
    setLoading(true);
    API.get("/platform/academies").then(r => setAcademies(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = academies.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "active")   return a.is_active;
    if (filter === "suspended") return !a.is_active;
    if (filter === "expiring") {
      const d = daysLeft(a.trial_ends_at);
      return d !== null && d <= 30;
    }
    if (filter === "expired") {
      const d = daysLeft(a.trial_ends_at);
      return d !== null && d < 0;
    }
    return true;
  });

  const expiring = academies.filter(a => { const d = daysLeft(a.trial_ends_at); return d !== null && d <= 14 && d >= 0; });
  const expired  = academies.filter(a => { const d = daysLeft(a.trial_ends_at); return d !== null && d < 0; });

  return (
    <div>
      {/* Alerts */}
      {expired.length > 0 && (
        <div className="alert alert-danger">
          <span>🚨</span>
          <strong>{expired.length} expired</strong>: {expired.map(a => a.name).join(", ")} — portals are or should be suspended.
        </div>
      )}
      {expiring.length > 0 && (
        <div className="alert alert-warning">
          <span>⏰</span>
          <strong>{expiring.length} expiring soon</strong>: {expiring.map(a => a.name).join(", ")}
        </div>
      )}

      {/* Plan cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {Object.entries(PLAN_CONFIG).map(([key, cfg]) => {
          const count = academies.filter(a => a.plan === key).length;
          return (
            <div key={key} className="stat-card" style={{ "--card-accent": cfg.color, "--card-glow": cfg.glow, cursor: "pointer" }}
              onClick={() => setFilter(key)}>
              <div className="stat-label" style={{ textTransform: "uppercase" }}>{cfg.label} Plan</div>
              <div className="stat-value" style={{ color: cfg.color }}>{count}</div>
              <div className="stat-hint">academies</div>
            </div>
          );
        })}
        <div className="stat-card" style={{ "--card-accent": "#ef4444" }}>
          <div className="stat-label">Expired</div>
          <div className="stat-value" style={{ color: "var(--red)" }}>{expired.length}</div>
          <div className="stat-hint">need renewal</div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">All Subscriptions</div>
            <div className="card-sub">{filtered.length} records</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: 180, padding: "7px 12px", fontSize: 12 }} />
            <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "7px 10px", fontSize: 12, width: 140 }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="expiring">Expiring ≤30d</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        {loading ? <div className="spinner">⟳ Loading…</div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Academy</th><th>Plan</th><th>Students</th><th>Expiry</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const cfg = PLAN_CONFIG[a.plan] || PLAN_CONFIG.basic;
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text1)" }}>{a.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)" }}>/{a.slug} · {a.city || "—"}</div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: cfg.glow, color: cfg.color }}>{cfg.label}</span>
                      </td>
                      <td style={{ fontFamily: "monospace" }}>
                        {a.student_count || 0} / {a.max_students}
                        <div className="progress-bar" style={{ marginTop: 4, width: 80 }}>
                          <div className="progress-fill"
                            style={{ width: `${Math.min(100, ((a.student_count || 0) / a.max_students) * 100)}%`,
                              background: ((a.student_count || 0) / a.max_students) > 0.9 ? "var(--red)" : cfg.color }} />
                        </div>
                      </td>
                      <td><ExpiryBadge date={a.trial_ends_at} /></td>
                      <td><span className={`badge ${a.is_active ? "badge-green" : "badge-red"}`}>{a.is_active ? "Active" : "Suspended"}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditTarget(a)}>✎ Manage</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editTarget && <EditSubModal academy={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />}
    </div>
  );
}
