import { useState } from "react";
import API from "../api";

const FEATURE_LIST = [
  { key: "attendance",    label: "Attendance",    icon: "📋", desc: "Track daily student attendance" },
  { key: "tests",         label: "Tests",         icon: "📝", desc: "Performance & test results" },
  { key: "expenses",      label: "Expenses",      icon: "💸", desc: "Branch expense tracking" },
  { key: "admissions",    label: "Admissions",    icon: "📋", desc: "Online admission enquiry form" },
  { key: "notifications", label: "Notifications", icon: "🔔", desc: "FCM push notifications" },
  { key: "id_cards",      label: "ID Cards",      icon: "🪪", desc: "Student ID card generation" },
  { key: "qr_scanner",   label: "QR Scanner",    icon: "⊞",  desc: "QR-based attendance scanner" },
  { key: "reports",       label: "Reports",       icon: "📊", desc: "Financial reports & analytics" },
];

const PRESET_COLORS = [
  "2563EB","6366F1","8B5CF6","EC4899","EF4444",
  "F97316","F59E0B","10B981","06B6D4","64748B",
];

const PLANS = [
  { id: "basic",      label: "Basic",      desc: "Up to 200 students, 3 branches" },
  { id: "pro",        label: "Pro",        desc: "Up to 500 students, 10 branches" },
  { id: "enterprise", label: "Enterprise", desc: "Unlimited students & branches" },
];

function Toggle({ checked, onChange, disabled }) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, cursor: disabled ? "not-allowed" : "pointer",
        background: checked ? "var(--accent)" : "var(--border)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{
        position: "absolute", top: 2, left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: "50%", background: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        transition: "left 0.2s",
      }} />
    </div>
  );
}

function ImageUploadField({ label, hint, value, onChange, fieldKey }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErr("File must be under 5MB"); return; }
    setUploading(true); setErr("");
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "https://acadfee.onrender.com"}/upload/photo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: e.target.result }),
        });
        const data = await res.json();
        if (data.url) onChange(data.url);
        else setErr("Upload failed");
      } catch { setErr("Upload failed"); }
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="form-group full">
      <label>{label} <span style={{ color: "var(--text3)", fontWeight: 400 }}>{hint}</span></label>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {/* Preview */}
        <div style={{
          width: 56, height: 56, borderRadius: 10, flexShrink: 0,
          background: "var(--bg3)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", fontSize: 22,
        }}>
          {value
            ? <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <span style={{ opacity: 0.3 }}>🖼</span>
          }
        </div>
        <div style={{ flex: 1 }}>
          <input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste URL or upload file below…"
            style={{ marginBottom: 6 }}
          />
          <label style={{
            display: "inline-block", padding: "5px 12px",
            background: "var(--bg3)", border: "1px solid var(--border)",
            borderRadius: 6, cursor: "pointer", fontSize: 12, color: "var(--text2)",
          }}>
            {uploading ? "⏳ Uploading…" : "📁 Upload File"}
            <input type="file" accept="image/*" style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])} disabled={uploading} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange("")}
              style={{ marginLeft: 8, background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 12 }}>
              ✕ Remove
            </button>
          )}
          {err && <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>{err}</div>}
        </div>
      </div>
    </div>
  );
}

export default function AcademyEditModal({ academy, onClose, onSaved }) {
  // Ensure all features are explicit booleans — fixes the reactivate/deactivate bug
  const normaliseFeatures = (f) => {
    const defaults = { attendance: true, tests: true, expenses: true, admissions: true,
      notifications: true, id_cards: true, qr_scanner: true, reports: true };
    return Object.fromEntries(
      FEATURE_LIST.map(({ key }) => [key, (f || {})[key] !== false ? (defaults[key] || true) : false])
    );
  };

  const [form, setForm]     = useState({ ...academy, features: normaliseFeatures(academy.features) });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [saved, setSaved]   = useState(false);
  const [tab, setTab]       = useState("info");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Fix: always send explicit boolean, never undefined
  const setFeature = (key, val) => setForm((f) => ({
    ...f,
    features: { ...normaliseFeatures(f.features), [key]: Boolean(val) },
  }));

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      // Send features as explicit object with all keys
      await API.put(`/platform/academies/${academy.id}`, {
        ...form,
        features: normaliseFeatures(form.features),
      });
      setSaved(true);
      setTimeout(() => { setSaved(false); onSaved(); }, 800);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save changes");
      setSaving(false);
    }
  };

  const primaryHex = form.primary_color
    ? (form.primary_color.startsWith("#") ? form.primary_color : `#${form.primary_color}`)
    : "#6366f1";
  const accentHex = form.accent_color
    ? (form.accent_color.startsWith("#") ? form.accent_color : `#${form.accent_color}`)
    : "#a78bfa";

  const tabs = [
    { id: "info",     label: "ℹ Info" },
    { id: "branding", label: "🎨 Branding" },
    { id: "contact",  label: "📞 Contact" },
    { id: "features", label: "🔧 Features" },
    { id: "limits",   label: "📈 Limits" },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 640, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, background: primaryHex,
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0,
            }}>
              {form.logo_url
                ? <img src={form.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                : form.name[0]?.toUpperCase()
              }
            </div>
            <div>
              <div className="modal-title">{academy.name}</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>/{academy.slug} · ID {academy.id}</div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 0, padding: "0 16px", borderBottom: "1px solid var(--border)", overflowX: "auto" }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "10px 14px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              color: tab === t.id ? "var(--accent)" : "var(--text3)",
              borderBottom: tab === t.id ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -1, transition: "color 0.15s",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>

          {/* ── INFO ── */}
          {tab === "info" && (
            <div className="form-grid">
              <div className="form-group full">
                <label>Academy Name *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="form-group full">
                <label>Tagline <span style={{ color: "var(--text3)", fontWeight: 400 }}>(shown under academy name)</span></label>
                <input value={form.tagline || ""} onChange={(e) => set("tagline", e.target.value)}
                  placeholder="e.g. Empowering students since 2015" />
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
                <label>Pincode</label>
                <input value={form.pincode || ""} onChange={(e) => set("pincode", e.target.value)} />
              </div>
              <div className="form-group">
                <label>Slug <span style={{ color: "var(--text3)", fontWeight: 400 }}>(read-only)</span></label>
                <input value={form.slug || ""} readOnly style={{ opacity: 0.5, cursor: "not-allowed" }} />
              </div>
            </div>
          )}

          {/* ── BRANDING ── */}
          {tab === "branding" && (
            <div>
              {/* Live preview card */}
              <div style={{
                background: `linear-gradient(135deg, ${primaryHex}22, ${accentHex}11)`,
                border: `1px solid ${primaryHex}44`,
                borderRadius: 12, padding: 16, marginBottom: 20,
              }}>
                <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Live Preview</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, background: primaryHex,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontWeight: 800, fontSize: 20, overflow: "hidden",
                    border: `2px solid ${primaryHex}66`,
                  }}>
                    {form.logo_url
                      ? <img src={form.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      : form.name[0]?.toUpperCase()
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "var(--text1)" }}>{form.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>{form.tagline || "No tagline set"}</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: primaryHex, border: "2px solid rgba(255,255,255,0.2)" }} title={`Primary: #${form.primary_color}`} />
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: accentHex, border: "2px solid rgba(255,255,255,0.2)" }} title={`Accent: #${form.accent_color}`} />
                  </div>
                </div>
              </div>

              <div className="form-grid">
                <ImageUploadField
                  label="Logo Image"
                  hint="(shown in sidebar & login)"
                  value={form.logo_url || ""}
                  onChange={(v) => set("logo_url", v)}
                />
                <ImageUploadField
                  label="Favicon / App Icon"
                  hint="(32×32 or 64×64 PNG)"
                  value={form.favicon_url || ""}
                  onChange={(v) => set("favicon_url", v)}
                />

                <div className="form-group">
                  <label>Primary Color</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {PRESET_COLORS.map((c) => (
                      <div key={c} onClick={() => set("primary_color", c)}
                        style={{
                          width: 24, height: 24, borderRadius: 6, background: `#${c}`,
                          cursor: "pointer", transition: "transform 0.15s",
                          border: (form.primary_color || "").toUpperCase() === c.toUpperCase()
                            ? "2px solid var(--text1)" : "2px solid transparent",
                          transform: (form.primary_color || "").toUpperCase() === c.toUpperCase()
                            ? "scale(1.25)" : "scale(1)",
                        }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="color" value={primaryHex}
                      onChange={(e) => set("primary_color", e.target.value.replace("#", ""))}
                      style={{ width: 36, height: 32, padding: 2, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", background: "var(--bg3)" }} />
                    <input value={form.primary_color || ""}
                      onChange={(e) => set("primary_color", e.target.value.replace("#", ""))}
                      placeholder="2563EB" maxLength={6}
                      style={{ flex: 1, fontFamily: "monospace", textTransform: "uppercase" }} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Accent Color</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {PRESET_COLORS.map((c) => (
                      <div key={c} onClick={() => set("accent_color", c)}
                        style={{
                          width: 24, height: 24, borderRadius: 6, background: `#${c}`,
                          cursor: "pointer", transition: "transform 0.15s",
                          border: (form.accent_color || "").toUpperCase() === c.toUpperCase()
                            ? "2px solid var(--text1)" : "2px solid transparent",
                          transform: (form.accent_color || "").toUpperCase() === c.toUpperCase()
                            ? "scale(1.25)" : "scale(1)",
                        }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="color" value={accentHex}
                      onChange={(e) => set("accent_color", e.target.value.replace("#", ""))}
                      style={{ width: 36, height: 32, padding: 2, border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", background: "var(--bg3)" }} />
                    <input value={form.accent_color || ""}
                      onChange={(e) => set("accent_color", e.target.value.replace("#", ""))}
                      placeholder="38BDF8" maxLength={6}
                      style={{ flex: 1, fontFamily: "monospace", textTransform: "uppercase" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CONTACT ── */}
          {tab === "contact" && (
            <div className="form-grid">
              <div className="form-group">
                <label>Primary Phone</label>
                <input type="tel" value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} placeholder="9876543210" />
              </div>
              <div className="form-group">
                <label>Secondary Phone</label>
                <input type="tel" value={form.phone2 || ""} onChange={(e) => set("phone2", e.target.value)} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="academy@example.com" />
              </div>
              <div className="form-group">
                <label>Website</label>
                <input value={form.website || ""} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
              </div>
              <div className="form-group full">
                <label>Full Address <span style={{ color: "var(--text3)", fontWeight: 400 }}>(shown on receipts & forms)</span></label>
                <textarea value={form.address || ""} onChange={(e) => set("address", e.target.value)} rows={3}
                  placeholder="Building, Street, Area, City — PIN" />
              </div>
            </div>
          )}

          {/* ── FEATURES ── */}
          {tab === "features" && (
            <div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14, padding: "8px 12px", background: "var(--bg3)", borderRadius: 8, border: "1px solid var(--border)" }}>
                💡 Disabled features are hidden from the academy's sidebar and cannot be accessed by their admins or students.
              </div>
              {FEATURE_LIST.map((f) => {
                const isOn = (form.features || {})[f.key] !== false;
                return (
                  <div key={f.key} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "12px 14px", borderRadius: 10, marginBottom: 8,
                    background: isOn ? "var(--bg2)" : "var(--bg3)",
                    border: `1px solid ${isOn ? "var(--border)" : "rgba(239,68,68,0.15)"}`,
                    transition: "all 0.2s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8, fontSize: 16,
                        background: isOn ? `${primaryHex}22` : "rgba(239,68,68,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        opacity: isOn ? 1 : 0.5,
                      }}>
                        {f.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: isOn ? "var(--text1)" : "var(--text3)" }}>{f.label}</div>
                        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{f.desc}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: isOn ? "var(--green)" : "var(--red)", fontWeight: 600 }}>
                        {isOn ? "ON" : "OFF"}
                      </span>
                      <Toggle checked={isOn} onChange={(v) => setFeature(f.key, v)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── LIMITS ── */}
          {tab === "limits" && (
            <div>
              {/* Plan selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 10 }}>Subscription Plan</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {PLANS.map((p) => (
                    <div key={p.id} onClick={() => set("plan", p.id)}
                      style={{
                        flex: 1, padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                        border: `2px solid ${form.plan === p.id ? "var(--accent)" : "var(--border)"}`,
                        background: form.plan === p.id ? "rgba(99,102,241,0.08)" : "var(--bg3)",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13, color: form.plan === p.id ? "var(--accent)" : "var(--text1)" }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 3 }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Max Students</label>
                  <input type="number" min={1} max={10000}
                    value={form.max_students || 200}
                    onChange={(e) => set("max_students", parseInt(e.target.value) || 200)} />
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Current: {academy.student_count || 0} enrolled</div>
                </div>
                <div className="form-group">
                  <label>Max Branches</label>
                  <input type="number" min={1} max={100}
                    value={form.max_branches || 3}
                    onChange={(e) => set("max_branches", parseInt(e.target.value) || 3)} />
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Current: {academy.branch_count || 0} created</div>
                </div>
                <div className="form-group">
                  <label>Trial Ends At <span style={{ color: "var(--text3)", fontWeight: 400 }}>(optional)</span></label>
                  <input type="date"
                    value={form.trial_ends_at ? form.trial_ends_at.split("T")[0] : ""}
                    onChange={(e) => set("trial_ends_at", e.target.value || null)} />
                </div>
                <div className="form-group">
                  <label>Active Status</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                    <Toggle
                      checked={form.is_active !== false}
                      onChange={(v) => set("is_active", v)}
                    />
                    <span style={{ fontSize: 13, fontWeight: 600, color: form.is_active !== false ? "var(--green)" : "var(--red)" }}>
                      {form.is_active !== false ? "Active" : "Suspended"}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Toggle to suspend or reactivate this academy.</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, padding: "10px 12px", fontSize: 13, color: "var(--red)", marginTop: 14 }}>
              ⚠ {error}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || saved}
            style={{ minWidth: 140, justifyContent: "center",
              background: saved ? "var(--green)" : undefined }}>
            {saved ? "✓ Saved!" : saving ? "Saving…" : "✓ Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
