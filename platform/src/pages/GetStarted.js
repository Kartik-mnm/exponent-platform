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
  yel:     "#f59e0b",
};

const WHATSAPP_NUMBER = "918956419453";
// API server for lead capture
const API = "https://acadfee.onrender.com";

export default function GetStarted({ onBack, onSignup }) {
  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 16px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 70% 50% at 50% 20%, ${C.acc}12 0%, transparent 70%)`,
      }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 680 }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          color: C.t3, fontSize: 13, fontWeight: 600, marginBottom: 28,
          display: "flex", alignItems: "center", gap: 6, padding: 0,
        }}>← Back to Home</button>

        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: `linear-gradient(135deg, ${C.acc}, ${C.pur})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontWeight: 900, fontSize: 22, color: "#fff",
            boxShadow: `0 8px 24px ${C.acc}44`,
          }}>E</div>
          <h1 style={{
            fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 900,
            color: C.t1, letterSpacing: "-0.5px", marginBottom: 10,
          }}>How would you like to start?</h1>
          <p style={{ fontSize: 15, color: C.t2, lineHeight: 1.6 }}>Choose the path that works best for you.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          <QuickSetupCard />
          <CreateInstantlyCard onSignup={onSignup} />
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: C.t3, marginTop: 28 }}>
          No credit card required · 7-day free trial · Cancel anytime
        </p>
      </div>
    </div>
  );
}

function QuickSetupCard() {
  const [step, setStep] = useState("idle");
  const [form, setForm] = useState({ name: "", phone: "", academy_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim() || !form.phone.trim() || !form.academy_name.trim()) {
      setError("All fields are required."); return;
    }
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) {
      setError("Enter a valid 10-digit Indian mobile number."); return;
    }
    setLoading(true);
    try {
      await fetch(`${API}/api/onboarding/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch (_) {}
    setStep("done");
    setLoading(false);
  };

  const waText = encodeURIComponent(
    `Hi! I'd like to set up my academy on Exponent.\nName: ${form.name}\nAcademy: ${form.academy_name}\nPhone: ${form.phone}`
  );
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

  return (
    <div style={{
      background: C.bg2, border: `1px solid ${C.border2}`,
      borderRadius: 18, padding: 28,
      display: "flex", flexDirection: "column", gap: 16,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 3, background: `linear-gradient(90deg, ${C.yel}, ${C.grn})`,
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 44, height: 44, flexShrink: 0, borderRadius: 12,
          background: `${C.yel}18`, border: `1px solid ${C.yel}30`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>📞</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.t1, marginBottom: 4 }}>Quick Setup</div>
          <div style={{ fontSize: 13, color: C.t2, lineHeight: 1.6 }}>We'll contact you within 24 hours and set everything up for you.</div>
        </div>
      </div>

      {step === "idle" && (
        <button onClick={() => setStep("form")} style={{
          width: "100%", padding: "11px", borderRadius: 10,
          border: `1px solid ${C.yel}44`, background: `${C.yel}12`, color: C.yel,
          fontWeight: 700, fontSize: 14, cursor: "pointer",
        }}>Submit My Details →</button>
      )}
      {step === "form" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Input placeholder="Full Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          <Input placeholder="Phone Number *" type="tel" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          <Input placeholder="Academy Name *" value={form.academy_name} onChange={v => setForm(f => ({ ...f, academy_name: v }))} />
          {error && <div style={{ fontSize: 12, color: "#f87171" }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{
            padding: "11px", borderRadius: 10, border: "none",
            background: loading ? C.border2 : `${C.yel}22`,
            color: loading ? C.t3 : C.yel, fontWeight: 700, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
          }}>{loading ? "Sending..." : "We'll Contact You →"}</button>
        </div>
      )}
      {step === "done" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.grn, marginBottom: 8 }}>Got it! We'll contact you within 24 hours.</div>
          <a href={waLink} target="_blank" rel="noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: C.grn,
            background: `${C.grn}14`, border: `1px solid ${C.grn}30`,
            borderRadius: 8, padding: "8px 16px", textDecoration: "none", fontWeight: 600,
          }}>💬 Also reach us on WhatsApp</a>
        </div>
      )}
      <div style={{ fontSize: 11, color: C.t3, lineHeight: 1.5 }}>
        ✓ Personal onboarding &nbsp;✓ We handle the setup &nbsp;✓ Free trial included
      </div>
    </div>
  );
}

function CreateInstantlyCard({ onSignup }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.acc}12, ${C.pur}0a)`,
      border: `2px solid ${C.acc}55`,
      borderRadius: 18, padding: 28,
      display: "flex", flexDirection: "column", gap: 16,
      position: "relative", overflow: "hidden",
      boxShadow: `0 16px 56px ${C.acc}18`,
    }}>
      <div style={{
        position: "absolute", top: 14, right: 14,
        background: `linear-gradient(135deg, ${C.acc}, ${C.pur})`,
        color: "#fff", fontSize: 10, fontWeight: 800,
        padding: "3px 10px", borderRadius: 20, letterSpacing: "0.06em",
      }}>RECOMMENDED</div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div style={{
          width: 44, height: 44, flexShrink: 0, borderRadius: 12,
          background: `${C.acc}18`, border: `1px solid ${C.acc}30`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>🌐</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.t1, marginBottom: 4 }}>Create Instantly</div>
          <div style={{ fontSize: 13, color: C.t2, lineHeight: 1.6 }}>Sign up now and access your academy dashboard immediately.</div>
        </div>
      </div>
      <button onClick={onSignup} style={{
        width: "100%", padding: "12px", borderRadius: 10, border: "none",
        background: `linear-gradient(135deg, ${C.acc}, ${C.pur})`,
        color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
        boxShadow: `0 6px 24px ${C.acc}44`,
      }}>🚀 Create My Academy →</button>
      <div style={{ fontSize: 11, color: C.t3, lineHeight: 1.5 }}>
        ✓ Ready in 2 minutes &nbsp;✓ 7-day free trial &nbsp;✓ No credit card
      </div>
    </div>
  );
}

function Input({ placeholder, value, onChange, type = "text" }) {
  return (
    <input type={type} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "10px 14px", background: "#07090f",
        border: `1px solid ${C.border2}`, borderRadius: 9, color: C.t1,
        fontSize: 14, outline: "none", boxSizing: "border-box",
      }}
    />
  );
}
