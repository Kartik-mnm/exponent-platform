import { useState } from "react";
import API from "../api";

// Now 6 steps — added "Admin Account" before Confirm
const STEPS = ["Basic Info", "Branding", "Contact", "Features & Plan", "Admin Account", "Confirm"];
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
  // Admin account fields
  admin_name: "", admin_email: "", admin_password: "",
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

// Auto-generate a strong random password
function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function AcademyWizard({ onClose, onCreated }) {
  const [step, setStep]         = useState(0);
  const [form, setForm]         = useState({ ...defaultForm, admin_password: generatePassword() });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [showPass, setShowPass] = useState(false);
  const [createdAcademy, setCreatedAcademy] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setFeature = (key, val) => setForm((f) => ({
    ...f, features: { ...f.features, [key]: val }
  }));

  const handleNameChange = (v) => {
    set("name", v);
    set("slug", v.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, ""));
    // Auto-fill admin name too
    if (!form.admin_name) set("admin_name", v + " Admin");
  };

  const canProceed = () => {
    if (step === 0) return form.name.trim() && form.slug.trim();
    if (step === 4) return form.admin_name.trim() && form.admin_email.trim() && form.admin_password.trim();
    return true;
  };

  const handleCreate = async () => {
    setSaving(true); setError("");
    try {
      // Step 1: Create the academy
      const { data: academy } = await API.post("/platform/academies", {
        name: form.name, slug: form.slug, tagline: form.tagline,
        city: form.city, state: form.state, phone: form.phone,
        phone2: form.phone2, email: form.email, website: form.website,
        address: form.address, primary_color: form.primary_color,
        accent_color: form.accent_color, plan: form.plan,
        max_students: form.max_students, max_branches: form.max_branches,
        features: form.features,
      });

      // Step 2: Create the admin user for this academy
      await API.post(`/platform/academies/${academy.id}/admin`, {
        name:     form.admin_name,
        email:    form.admin_email,
        password: form.admin_password,
      });

      setCreatedAcademy(academy);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create academy");
      setSaving(false);
    }
  };

  // Success screen after creation
  if (createdAcademy) {
    return (
      <div className="modal-overlay">
        <div className="modal" style={{ maxWidth: 480 }}>
          <div className="modal-body" style={{ textAlign: "center", padding: "40px 32px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text1)", marginBottom: 8 }}>
              Academy Created!
            </div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>
              {createdAcademy.name} is ready to use.
            </div>

            {/* Credentials box */}
            <div style={{
              background: "var(--bg3)", border: "1px solid var(--border)",
              borderRadius: 10, padding: 18, textAlign: "left", marginBottom: 24
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.1em", color: "var(--text3)", marginBottom: 12 }}>
                Admin Login Credentials
              </div>
              {[
                ["Academy URL", `yourplatform.com/${createdAcademy.slug}`],
                ["Admin Email", form.admin_email],
                ["Password", form.admin_password],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between",
                  padding: "6px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span style={{ color: "var(--text3)" }}>{label}</span>
                  <span style={{ color: "var(--text1)", fontWeight: 600, fontFamily: "monospace" }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 24 }}>
              ⚠️ Save these credentials — share them with the academy admin.
            </div>

            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}
              onClick={onCreated}>
              Done ✓
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <div className="step-label" style={{ whiteSpace: "nowrap", fontSize: 11 }}>{label}</div>
              </div>
              {i < STEPS.length - 1 && <div className="step-line" style={{ flex: 1, margin: "0 4px" }} />}
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
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{
                    background: "var(--bg4)", border: "1px solid var(--border)", borderRight: "none",
                    padding: "9px 12px", borderRadius: "7px 0 0 7px", color: "var(--text3)", fontSize: 13
                  }}>
                    yourplatform.com/
                  </span>
                  <input value={form.slug}
                    onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,""))}
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
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: `#${form.primary_color}` }} />
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: `#${form.accent_color}` }} />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Primary Color</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {PRESET_COLORS.map((c) => (
                      <div key={c} onClick={() => set("primary_color", c)} className="color-swatch"
                        style={{ background: `#${c}`,
                          border: form.primary_color === c ? "2px solid var(--text1)" : "2px solid transparent",
                          transform: form.primary_color === c ? "scale(1.15)" : "scale(1)" }} />
                    ))}
                  </div>
                  <input value={form.primary_color}
                    onChange={(e) => set("primary_color", e.target.value.replace("#",""))}
                    placeholder="6366F1" maxLength={6} />
                </div>
                <div className="form-group">
                  <label>Accent Color</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {PRESET_COLORS.map((c) => (
                      <div key={c} onClick={() => set("accent_color", c)} className="color-swatch"
                        style={{ background: `#${c}`,
                          border: form.accent_color === c ? "2px solid var(--text1)" : "2px solid transparent" }} />
                    ))}
                  </div>
                  <input value={form.accent_color}
                    onChange={(e) => set("accent_color", e.target.value.replace("#",""))}
                    placeholder="A78BFA" maxLength={6} />
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
              {FEATURE_LIST.map((f) => (
                <div key={f.key} className="toggle-row">
                  <div>
                    <div className="toggle-label">{f.label}</div>
                    <div className="toggle-desc">{f.desc}</div>
                  </div>
                  <Toggle checked={form.features[f.key] !== false} onChange={(v) => setFeature(f.key, v)} />
                </div>
              ))}
            </div>
          )}

          {/* Step 4 — Admin Account (NEW) */}
          {step === 4 && (
            <div>
              <div style={{
                background: "var(--accent-glow)", border: "1px solid var(--accent)",
                borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: "var(--accent)"
              }}>
                This creates the <strong>Super Admin</strong> login for {form.name}.
                They'll use these credentials to log into their academy portal.
              </div>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Admin Full Name *</label>
                  <input value={form.admin_name}
                    onChange={(e) => set("admin_name", e.target.value)}
                    placeholder="e.g. Rahul Sharma" autoFocus />
                </div>
                <div className="form-group full">
                  <label>Admin Email *</label>
                  <input type="email" value={form.admin_email}
                    onChange={(e) => set("admin_email", e.target.value)}
                    placeholder="admin@brightfuture.in" />
                </div>
                <div className="form-group full">
                  <label>Password *</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type={showPass ? "text" : "password"}
                      value={form.admin_password}
                      onChange={(e) => set("admin_password", e.target.value)}
                      style={{ flex: 1, fontFamily: "monospace" }}
                    />
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowPass((s) => !s)}>
                      {showPass ? "Hide" : "Show"}
                    </button>
                    <button className="btn btn-ghost btn-sm"
                      onClick={() => set("admin_password", generatePassword())}>
                      ↺ Generate
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                    A strong password has been auto-generated. You can change it or regenerate.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5 — Confirm */}
          {step === 5 && (
            <div>
              <div style={{
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: 12, padding: 20, marginBottom: 16
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    ["City", form.city || "—"],
                    ["Max Students", form.max_students],
                    ["Admin Email", form.admin_email],
                    ["Max Branches", form.max_branches],
                  ].map(([k, v]) => (
                    <div key={k} style={{ fontSize: 12 }}>
                      <span style={{ color: "var(--text3)" }}>{k}: </span>
                      <span style={{ color: "var(--text1)" }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
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
