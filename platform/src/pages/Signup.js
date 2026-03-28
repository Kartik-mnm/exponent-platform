import { useState } from "react";

const C = {
  bg:      "#07090f",
  bg2:     "#0d1117",
  bg3:     "#131720",
  border:  "#1e2535",
  border2: "#28304a",
  t1:      "#eef1fb",
  t2:      "#8892b5",
  t3:      "#454f72",
  acc:     "#6366f1",
  grn:     "#10b981",
  pur:     "#a855f7",
  red:     "#ef4444",
};

// API server — always acadfee.onrender.com (backend)
const API_BASE = "https://acadfee.onrender.com";

export default function Signup({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    owner_name: "", email: "", phone: "", academy_name: "", password: "",
  });
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const errs = {};
    if (!form.owner_name.trim()) errs.owner_name = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = "Valid email required";
    const rawPhone = form.phone.replace(/[\s\-+().]/g, "");
    if (!rawPhone || !/^\d{7,15}$/.test(rawPhone))
      errs.phone = "Enter a valid phone number";
    if (!form.academy_name.trim()) errs.academy_name = "Required";
    if (form.password.length < 6)  errs.password = "Minimum 6 characters";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/onboarding/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: form.phone.replace(/[\s\-+().]/g, ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      onSuccess?.(data);
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 70% 50% at 50% 20%, ${C.acc}10 0%, transparent 70%)`,
      }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          color: C.t3, fontSize: 13, fontWeight: 600,
          marginBottom: 24, display: "flex", alignItems: "center", gap: 6, padding: 0,
        }}>← Back</button>

        <div style={{
          background: C.bg2, border: `1px solid ${C.border2}`,
          borderRadius: 20, padding: "36px 32px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 13,
              background: `linear-gradient(135deg, ${C.acc}, ${C.pur})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px", fontWeight: 900, fontSize: 20, color: "#fff",
              boxShadow: `0 6px 20px ${C.acc}44`,
            }}>E</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: C.t1, letterSpacing: "-0.4px", marginBottom: 6 }}>
              Create your academy
            </h2>
            <p style={{ fontSize: 13, color: C.t2 }}>7-day free trial · No credit card needed</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <FormField label="Owner / Director Name" placeholder="e.g. Kartik Ninawe"
              value={form.owner_name} onChange={set("owner_name")} error={fieldErrors.owner_name} />
            <FormField label="Email Address" placeholder="you@example.com" type="email"
              value={form.email} onChange={set("email")} error={fieldErrors.email} />
            <FormField label="Phone Number" placeholder="e.g. 9876543210" type="tel"
              value={form.phone} onChange={set("phone")} error={fieldErrors.phone} />
            <FormField label="Academy Name" placeholder="e.g. Nishchay Academy"
              value={form.academy_name} onChange={set("academy_name")} error={fieldErrors.academy_name} />

            <div>
              <label style={{
                fontSize: 12, fontWeight: 700, color: C.t3, display: "block",
                marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
              }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={e => set("password")(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 42px 10px 14px", background: C.bg3,
                    border: `1px solid ${fieldErrors.password ? C.red : C.border2}`,
                    borderRadius: 9, color: C.t1, fontSize: 14, outline: "none", boxSizing: "border-box",
                  }}
                />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: C.t3, fontSize: 15,
                }}>{showPw ? "🙈" : "🔒"}</button>
              </div>
              {fieldErrors.password && <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>{fieldErrors.password}</div>}
            </div>
          </div>

          {error && (
            <div style={{
              marginTop: 16, padding: "10px 14px",
              background: `${C.red}14`, border: `1px solid ${C.red}30`,
              borderRadius: 9, fontSize: 13, color: C.red,
            }}>{error}</div>
          )}

          <button type="button" onClick={handleSubmit} disabled={loading} style={{
            width: "100%", padding: "13px", marginTop: 22,
            borderRadius: 11, border: "none",
            background: loading ? C.border2 : `linear-gradient(135deg, ${C.acc}, ${C.pur})`,
            color: loading ? C.t3 : "#fff",
            fontWeight: 800, fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : `0 8px 28px ${C.acc}44`,
            transition: "all 0.2s",
          }}>
            {loading ? "Creating your academy..." : "🚀 Create My Academy"}
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: C.t3, marginTop: 16, lineHeight: 1.6 }}>
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, placeholder, value, onChange, type = "text", error }) {
  return (
    <div>
      <label style={{
        fontSize: 12, fontWeight: 700, color: "#454f72", display: "block",
        marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em",
      }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "10px 14px", background: "#131720",
          border: `1px solid ${error ? "#ef4444" : "#28304a"}`,
          borderRadius: 9, color: "#eef1fb", fontSize: 14,
          outline: "none", boxSizing: "border-box",
        }}
      />
      {error && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{error}</div>}
    </div>
  );
}
