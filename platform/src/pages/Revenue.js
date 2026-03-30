// ── Revenue Log Page ───────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import API from "../api";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const PLAN_COLORS = {
  basic: "#64748b", pro: "#6366f1", enterprise: "#f59e0b", trial: "#10b981", other: "#8892b5"
};

function AddEntryModal({ academies, onClose, onSaved }) {
  const [form, setForm] = useState({
    academy_id: "",
    academy_name: "",
    amount: "",
    plan: "pro",
    note: "",
    paid_on: new Date().toISOString().split("T")[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAcademySelect = (id) => {
    const a = academies.find(a => String(a.id) === String(id));
    setForm(f => ({ ...f, academy_id: id, academy_name: a ? a.name : "", plan: a?.plan || f.plan }));
  };

  const save = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) { setError("Amount is required and must be > 0"); return; }
    setSaving(true); setError("");
    try {
      await API.post("/platform/revenue", {
        ...form,
        amount: parseFloat(form.amount),
        academy_id: form.academy_id || null,
      });
      onSaved();
    } catch (e) {
      setError(e.response?.data?.error || "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <div className="modal-title">💰 Log a Payment Received</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group full">
              <label>Academy</label>
              <select value={form.academy_id} onChange={e => handleAcademySelect(e.target.value)}>
                <option value="">-- Select Academy --</option>
                {academies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {!form.academy_id && (
                <input
                  style={{ marginTop: 8 }}
                  placeholder="Or type academy name manually"
                  value={form.academy_name}
                  onChange={e => set("academy_name", e.target.value)}
                />
              )}
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input
                type="number" min="1" step="1"
                placeholder="e.g. 999"
                value={form.amount}
                onChange={e => set("amount", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Plan</label>
              <select value={form.plan} onChange={e => set("plan", e.target.value)}>
                <option value="trial">Trial</option>
                <option value="basic">Basic — ₹499/mo</option>
                <option value="pro">Pro — ₹999/mo</option>
                <option value="enterprise">Enterprise — ₹1999/mo</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group full">
              <label>Date Paid</label>
              <input type="date" value={form.paid_on} onChange={e => set("paid_on", e.target.value)} />
            </div>

            <div className="form-group full">
              <label>Note <span style={{ color: "var(--text3)", fontWeight: 400 }}>(optional)</span></label>
              <input
                placeholder="e.g. Paid via UPI, extended 30 days"
                value={form.note}
                onChange={e => set("note", e.target.value)}
              />
            </div>
          </div>

          {error && <div className="alert alert-danger" style={{ marginTop: 12 }}>{error}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving..." : "✓ Log Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Revenue() {
  const [entries, setEntries]       = useState([]);
  const [academies, setAcademies]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showAdd, setShowAdd]       = useState(false);
  const [search, setSearch]         = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([API.get("/platform/revenue"), API.get("/platform/academies")])
      .then(([r, a]) => { setEntries(r.data); setAcademies(a.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this revenue entry?")) return;
    setDeletingId(id);
    try { await API.delete(`/platform/revenue/${id}`); load(); }
    catch (e) { alert(e.response?.data?.error || "Failed"); }
    finally { setDeletingId(null); }
  };

  const filtered = entries.filter(e =>
    (e.academy_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.note || "").toLowerCase().includes(search.toLowerCase()) ||
    (e.plan || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalAllTime  = entries.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const thisMonth     = entries.filter(e => {
    const d = new Date(e.paid_on);
    const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
  }).reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const thisYear      = entries.filter(e => new Date(e.paid_on).getFullYear() === new Date().getFullYear())
    .reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Revenue</div>
          <div className="page-sub">Manual log of all payments received from academies</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Log Payment
        </button>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: "This Month",  value: fmt(thisMonth),   color: "#10b981", icon: "📅" },
          { label: "This Year",   value: fmt(thisYear),    color: "#6366f1", icon: "📆" },
          { label: "All Time",    value: fmt(totalAllTime), color: "#f59e0b", icon: "💰" },
          { label: "Transactions",value: entries.length,    color: "#06b6d4", icon: "📝" },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ "--card-accent": s.color }}>
            <div className="stat-label">{s.icon} {s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Payment Log</div>
            <div className="card-sub">{filtered.length} entries</div>
          </div>
          <input
            placeholder="🔍  Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220, padding: "7px 12px", fontSize: 12 }}
          />
        </div>

        {loading ? (
          <div className="spinner">⟳ Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-icon">💰</div>
            <div className="empty-text">{search ? "No entries match." : "No revenue logged yet."}</div>
            <div className="empty-sub">Click \"+ Log Payment\" whenever an academy pays you via UPI or bank transfer.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Academy</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600, color: "var(--text1)" }}>
                      {e.academy_name || "—"}
                    </td>
                    <td>
                      {e.plan ? (
                        <span className="badge" style={{ background: `${PLAN_COLORS[e.plan] || PLAN_COLORS.other}18`, color: PLAN_COLORS[e.plan] || PLAN_COLORS.other }}>
                          {e.plan}
                        </span>
                      ) : "—"}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--green)", fontFamily: "monospace", fontSize: 14 }}>
                        {fmt(e.amount)}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text3)", whiteSpace: "nowrap" }}>
                      {new Date(e.paid_on).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text2)", maxWidth: 200 }}>
                      {e.note || "—"}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        style={{ background: "rgba(239,68,68,0.08)", color: "var(--red)", border: "none" }}
                        onClick={() => handleDelete(e.id)}
                        disabled={deletingId === e.id}
                      >
                        {deletingId === e.id ? "..." : "🗑"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <AddEntryModal
          academies={academies}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); load(); }}
        />
      )}
    </div>
  );
}
