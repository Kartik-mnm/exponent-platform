import { useState } from "react";
import API from "../api";

const STEPS = ["Basic Info", "Branding", "Contact", "Features & Plan", "Confirm"];
const PLANS = ["basic", "pro", "enterprise"];
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

const defaultForm = {
  name: "", slug: "", tagline: "", city: "", state: "",
  phone: "", phone2: "", email: "", website: "", address: "",
  primary_color: "6366F1", accent_color: "A78BFA",
  plan: "pro", max_students: 200, max_branches: 3,
  features: {
    attendance: true, tests: true, expenses: true, admissions: true,
    notifications: true, id_cards: true, qr_scanner: true, reports: true,
  },
};

function Toggle({ checked, onChange }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="toggle-track" />
      <div className="toggle-thumb" />
    </label>
  );
}

export default function AcademyWizard({ onClose, onCreated }) {
  const [step, setStep]   = useState(0);
  const [form, setForm]   = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setFeature = (key, val) => setForm((f) => ({
    ...f, features: { ...f.features, [key]: val }
  }));

  // Auto-generate slug from name
  const handleNameChange = (v) => {
    set("name", v);
    set("slug", v.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
  };

  const canProceed = () => {
    if (step === 0) return form.name.trim() && form.slug.trim();
    return true;
  };

  const handleCreate = async () => {
    setSaving(true); setError("");
    try {
      await API.post("/platform/academies", form);
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create academy");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 620 }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">New Academy</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Step indicator */}
        <div className="steps">
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div className={`step ${i === step ? "active" : i < step ? "done" : ""}`}
                style={{ display: "flex", alignItems: "center", gap: 7, cursor: i < step ? "pointer" : "default" }}
                onClick={() => i < step && setStep(i)}
              >
                <div className="step-num">{i < step ? "✓" : i + 1}</div>
                <div className="step-label" style={{ whiteSpace: "nowrap" }}>{label}</div>
              </div>
              {i < STEPS.length - 1 && <div className="step-line" style={{ flex: 1, margin: "0 6px" }} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="modal-body">

          {/* Step 0 — Basic Info */}
          {step === 0 && (
            <div className="form-grid">
              <div className="form-group full">
                <label>Academy Name *</label>
                <input value={form.name} onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Bright Future Coaching" autoFocus />
              </div>
              <div className="form-group full">
                <label>URL Slug * <span style={{ color: "var(--text3)", fontWeight: 400 }}>— used in the portal URL</span></label>
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  <span style={{
                    background: "var(--bg4)", border: "1px solid var(--border)", borderRight: "none",
                    padding: "9px 12px", borderRadius: "7px 0 0 7px", color: "var(--text3)", fontSize: 13
                  }}>
                    yourplatform.com/
                  </span>
                  <input value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))}
                    placeholder="brightfuture"
                    style={{ borderRadius: "0 7px 7px 0", borderLeft: "none" }} />
                </div>
              </div>
              <div className="form-group full">
                <label>Tagline <span style={{ color: "var(--text3)", fontWeight: 400 }}>(optional)</span></label>
                <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)}
                  placeholder="Excellence in Education" />
              </div>
              <div className="form-group">
                <label>City</label>
                <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Mumbai" />
              </div>
              <div className="form-group">
                <label>State</label>
                <input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Maharashtra" />
              </div>
            </div>
          )}

          {/* Step 1 — Branding */}
          {step === 1 && (
            <div>
              {/* Live preview */}
              <div style={{
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: 10, padding: 16, marginBottom: 20,
                display: "flex", alignItems: "center", gap: 12
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `#${form.primary_color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 20
                }}>
                  {(form.name || "A")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text1)" }}>{form.name || "Academy Name"}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{form.tagline || "Your tagline"}</div>
                </div>
                <div style={{
                  marginLeft: "auto", display: "flex", gap: 6, alignItems: "center"
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: `#${form.primary_color}` }} />
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: `#${form.accent_color}` }} />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Primary Color</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
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
                  <input value={form.primary_color} onChange={(e) => set("primary_color", e.target.value.replace("#",""))}
                    placeholder="2563EB" maxLength={6} />
                </div>
                <div className="form-group">
                  <label>Accent Color</label>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                    {PRESET_COLORS.map((c) => (
                      <div key={c} onClick={() => set("accent_color", c)}
                        className="color-swatch"
                        style={{
                          background: `#${c}`,
                          border: form.accent_color === c ? "2px solid var(--text1)" : "2px solid transparent"
                        }} />
                    ))}
                  </div>
                  <input value={form.accent_color} onChange={(e) => set("accent_color", e.target.value.replace("#",""))}
                    placeholder="38BDF8" maxLength={6} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Contact */}
          {step === 2 && (
            <div className="form-grid">
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="9876543210" />
              </div>
              <div className="form-group">
                <label>Phone 2 (optional)</label>
                <input value={form.phone2} onChange={(e) => set("phone2", e.target.value)} placeholder="9876543211" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="info@brightfuture.in" />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input value={form.website} onChange={(e) => set("website", e.target.value)}
                  placeholder="https://brightfuture.in" />
              </div>
              <div className="form-group full">
                <label>Address <span style={{ color: "var(--text3)", fontWeight: 400 }}>(shown on receipts)</span></label>
                <textarea value={form.address} onChange={(e) => set("address", e.target.value)}
                  placeholder="123 Main Street, Andheri West, Mumbai - 400058" rows={3} />
              </div>
            </div>
          )}

          {/* Step 3 — Features & Plan */}
          {step === 3 && (
            <div>
              <div className="form-grid" style={{ marginBottom: 20 }}>
                <div className="form-group">
                  <label>Plan</label>
                  <select value={form.plan} onChange={(e) => set("plan", e.target.value)}>
                    {PLANS.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Max Students</label>
                  <input type="number" value={form.max_students}
                    onChange={(e) => set("max_students", parseInt(e.target.value) || 200)} min={10} />
                </div>
                <div className="form-group">
                  <label>Max Branches</label>
                  <input type="number" value={form.max_branches}
                    onChange={(e) => set("max_branches", parseInt(e.target.value) || 3)} min={1} />
                </div>
              </div>

              <div className="section-title">Feature Flags</div>
              <div>
                {FEATURE_LIST.map((f) => (
                  <div key={f.key} className="toggle-row">
                    <div>
                      <div className="toggle-label">{f.label}</div>
                      <div className="toggle-desc">{f.desc}</div>
                    </div>
                    <Toggle
                      checked={form.features[f.key] !== false}
                      onChange={(v) => setFeature(f.key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Confirm */}
          {step === 4 && (
            <div>
              {/* Preview card */}
              <div style={{
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: 12, padding: 20, marginBottom: 20
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12,
                    background: `#${form.primary_color}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: 22
                  }}>
                    {form.name[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: "var(--text1)" }}>{form.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)" }}>{form.tagline}</div>
                    <div style={{ fontSize: 11, color: "var(--accent)", marginTop: 2 }}>/{form.slug}</div>
                  </div>
                  <span className="badge badge-blue" style={{ marginLeft: "auto" }}>{form.plan}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    ["City", form.city || "—"],
                    ["Max Students", form.max_students],
                    ["Phone", form.phone || "—"],
                    ["Max Branches", form.max_branches],
                    ["Email", form.email || "—"],
                    ["Website", form.website || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ fontSize: 12 }}>
                      <span style={{ color: "var(--text3)" }}>{k}: </span>
                      <span style={{ color: "var(--text1)" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {FEATURE_LIST.filter((f) => form.features[f.key] !== false).map((f) => (
                    <span key={f.key} className="badge badge-green">{f.label}</span>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 7, padding: "10px 12px", fontSize: 13, color: "var(--red)", marginBottom: 12
                }}>
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {step > 0 && (
            <button className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose} style={{ marginRight: "auto" }}>
            Cancel
          </button>
          {step < STEPS.length - 1 ? (
            <button className="btn btn-primary" onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Next →
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? "Creating..." : "🚀 Create Academy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
