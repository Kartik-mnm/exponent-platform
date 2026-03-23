import { useState } from "react";
import API from "../api";

const FEATURE_LIST = [
  { key: "attendance",    label: "Attendance",    desc: "Track student attendance" },
  { key: "tests",         label: "Tests",         desc: "Performance & test results" },
  { key: "expenses",      label: "Expenses",      desc: "Branch expense tracking" },
  { key: "admissions",    label: "Admissions",    desc: "Online admission form" },
  { key: "notifications", label: "Notifications", desc: "FCM push notifications" },
  { key: "id_cards",      label: "ID Cards",      desc: "Student ID card generation" },
  { key: "qr_scanner",    label: "QR Scanner",    desc: "QR-based attendance scanner" },
  { key: "reports",       label: "Reports",       desc: "Financial reports & analytics" },
];
const PRESET_COLORS = [
  "2563EB","6366F1","8B5CF6","EC4899","EF4444",
  "F59E0B","10B981","06B6D4","0EA5E9","64748B"
];
const PLANS = ["basic", "pro", "enterprise"];

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

export default function AcademyEditModal({ academy, onClose, onSaved }) {
  const [form, setForm]     = useState({ ...academy });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [tab, setTab]       = useState("info");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setFeature = (key, val) => setForm((f) => ({
    ...f, features: { ...(f.features || {}), [key]: val }
  }));

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await API.put(`/platform/academies/${academy.id}`, form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save changes");
      setSaving(false);
    }
  };

  const tabs = [
    { id: "info",     label: "Info" },
    { id: "branding", label: "Branding" },
    { id: "contact",  label: "Contact" },
    { id: "features", label: "Features" },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Edit — {academy.name}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>/{academy.slug}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", gap: 2, padding: "10px 16px 0",
          borderBottom: "1px solid var(--border)"
        }}>
          {tabs.map((t) => (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "6px 14px", fontSize: 13, fontWeight: 600,
                color: tab === t.id ? "var(--accent)" : "var(--text3)",
                borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
                marginBottom: -1, transition: "color 0.15s"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body">

          {/* Info tab */}
          {tab === "info" && (
            <div className="form-grid">
              <div className="form-group full">
                <label>Academy Name</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="form-group full">
                <label>Tagline</label>
                <input value={form.tagline || ""} onChange={(e) => set("tagline", e.target.value)} />
              </div>
              <div className="form-group">
                <label>City</label>
                <input value={form.city || ""} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input value={form.state || ""} onChange={(e) => set("state", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Plan</label>
                <select value={form.plan || "basic"} onChange={(e) => set("plan", e.target.value)}>
                  {PLANS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Max Students</label>
                <input type="number" value={form.max_students || 200}
                  onChange={(e) => set("max_students", parseInt(e.target.value) || 200)} />
              </div>
              <div className="form-group">
                <label>Max Branches</label>
                <input type="number" value={form.max_branches || 3}
                  onChange={(e) => set("max_branches", parseInt(e.target.value) || 3)} />
              </div>
            </div>
          )}

          {/* Branding tab */}
          {tab === "branding" && (
            <div>
              {/* Live preview */}
              <div style={{
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: 10, padding: 16, marginBottom: 20,
                display: "flex", alignItems: "center", gap: 12
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `#${form.primary_color || "6366f1"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 18, overflow: "hidden"
                }}>
                  {form.logo_url
                    ? <img src={form.logo_url} alt="" style={{ width: 44, height: 44, objectFit: "cover" }} />
                    : form.name[0]?.toUpperCase()
                  }
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{form.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{form.tagline}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 4, background: `#${form.primary_color}` }} />
                  <div style={{ width: 22, height: 22, borderRadius: 4, background: `#${form.accent_color}` }} />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group full">
                  <label>Logo URL <span style={{ color: "var(--text3)", fontWeight: 400 }}>(Cloudinary URL)</span></label>
                  <input value={form.logo_url || ""} onChange={(e) => set("logo_url", e.target.value)}
                    placeholder="https://res.cloudinary.com/..." />
                </div>
                <div className="form-group">
                  <label>Primary Color</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {PRESET_COLORS.map((c) => (
                      <div key={c} onClick={() => set("primary_color", c)}
                        className="color-swatch"
                        style={{
                          background: `#${c}`,
                          border: form.primary_color === c ? "2px solid var(--text1)" : "2px solid transparent",
                          transform: form.primary_color === c ? "scale(1.15)" : "scale(1)"
                        }} />
                    ))}
                  </div>
                  <input value={form.primary_color || ""} onChange={(e) => set("primary_color", e.target.value.replace("#",""))}
                    placeholder="6366F1" maxLength={6} />
                </div>
                <div className="form-group">
                  <label>Accent Color</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {PRESET_COLORS.map((c) => (
                      <div key={c} onClick={() => set("accent_color", c)}
                        className="color-swatch"
                        style={{
                          background: `#${c}`,
                          border: form.accent_color === c ? "2px solid var(--text1)" : "2px solid transparent"
                        }} />
                    ))}
                  </div>
                  <input value={form.accent_color || ""} onChange={(e) => set("accent_color", e.target.value.replace("#",""))}
                    placeholder="A78BFA" maxLength={6} />
                </div>
              </div>
            </div>
          )}

          {/* Contact tab */}
          {tab === "contact" && (
            <div className="form-grid">
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Phone 2</label>
                <input value={form.phone2 || ""} onChange={(e) => set("phone2", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input value={form.website || ""} onChange={(e) => set("website", e.target.value)} />
              </div>
              <div className="form-group full">
                <label>Address</label>
                <textarea value={form.address || ""} onChange={(e) => set("address", e.target.value)} rows={3} />
              </div>
            </div>
          )}

          {/* Features tab */}
          {tab === "features" && (
            <div>
              {FEATURE_LIST.map((f) => (
                <div key={f.key} className="toggle-row">
                  <div>
                    <div className="toggle-label">{f.label}</div>
                    <div className="toggle-desc">{f.desc}</div>
                  </div>
                  <Toggle
                    checked={(form.features || {})[f.key] !== false}
                    onChange={(v) => setFeature(f.key, v)}
                  />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 7, padding: "10px 12px", fontSize: 13, color: "var(--red)", marginTop: 14
            }}>
              {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "✓ Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
