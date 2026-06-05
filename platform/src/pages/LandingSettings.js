import { useState, useEffect } from "react";
import API from "../api";

const S = {
  card: { background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 12, padding: "28px 32px", marginBottom: 24 },
  h: { fontSize: 16, fontWeight: 700, color: "var(--text1)", marginBottom: 4 },
  sub: { fontSize: 13, color: "var(--text3)", marginBottom: 24 },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 6, display: "block" },
  input: {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    border: "1px solid var(--border)", background: "var(--bg3)",
    color: "var(--text1)", fontSize: 14, outline: "none", boxSizing: "border-box",
  },
  btn: {
    padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer",
    fontWeight: 700, fontSize: 14, background: "var(--accent)", color: "#000",
  },
  ghost: {
    padding: "10px 24px", borderRadius: 8, cursor: "pointer",
    fontWeight: 600, fontSize: 14, background: "transparent",
    border: "1px solid var(--border)", color: "var(--text2)",
  },
  tag: { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: "var(--accent)", color: "#000", marginLeft: 8 },
  divider: { height: 1, background: "var(--border)", margin: "20px 0" },
};

export default function LandingSettings() {
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState(null);
  const [backendReady, setBackendReady] = useState(true);
  const [stats, setStats]       = useState({
    academies: { v: "2,400", s: "+" },
    students:  { v: "4.8",   s: "L" },
    fees:      { v: "₹120",  s: "Cr" },
  });
  const [pricing, setPricing] = useState([
    { name: "Starter", price: 999, popular: false, desc: "For small institutes getting started.", features: ["Up to 100 students", "1 branch & 2 staff members", "Basic fee tracking", "Email support"] },
    { name: "Growth",  price: 2499, popular: true,  desc: "For established institutes expanding rapidly.", features: ["Unlimited students", "Multiple branches & admin roles", "Complete fee & attendance CRM", "Parent SMS/App notifications", "Priority WhatsApp support"] },
  ]);

  useEffect(() => {
    API.get("/platform/settings/landing")
      .then(r => {
        if (r.data.stats)   setStats(r.data.stats);
        if (r.data.pricing) setPricing(r.data.pricing);
        setBackendReady(true);
      })
      .catch(err => {
        // 404 = backend not deployed yet with new route
        if (err?.response?.status === 404) setBackendReady(false);
      })
      .finally(() => setLoading(false));
  }, []);

  function flash(text, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  }

  async function saveStats() {
    setSaving(true);
    try {
      await API.put("/platform/settings/landing", { stats });
      flash("Stats saved! Changes are live on exponentgrow.in 🎉");
    } catch { flash("Failed to save stats", false); }
    setSaving(false);
  }

  async function savePricing() {
    setSaving(true);
    try {
      await API.put("/platform/settings/landing", { pricing });
      flash("Pricing saved! Changes are live on exponentgrow.in 🎉");
    } catch { flash("Failed to save pricing", false); }
    setSaving(false);
  }

  function updatePlan(idx, field, val) {
    setPricing(prev => prev.map((p, i) => i === idx ? { ...p, [field]: field === "price" ? Number(val) : val } : p));
  }

  function updateFeature(planIdx, featIdx, val) {
    setPricing(prev => prev.map((p, i) => {
      if (i !== planIdx) return p;
      const features = [...p.features];
      features[featIdx] = val;
      return { ...p, features };
    }));
  }

  function addFeature(planIdx) {
    setPricing(prev => prev.map((p, i) => i === planIdx ? { ...p, features: [...p.features, "New feature"] } : p));
  }

  function removeFeature(planIdx, featIdx) {
    setPricing(prev => prev.map((p, i) => {
      if (i !== planIdx) return p;
      return { ...p, features: p.features.filter((_, j) => j !== featIdx) };
    }));
  }

  if (loading) return <div style={{ padding: 40, color: "var(--text2)" }}>Loading settings…</div>;

  return (
    <div style={{ maxWidth: 860, paddingBottom: 60 }}>

      {/* Toast */}
      {msg && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 1000,
          background: msg.ok ? "#16a34a" : "#dc2626",
          color: "#fff", padding: "12px 20px", borderRadius: 10,
          fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>{msg.text}</div>
      )}

      {/* Backend not deployed yet banner */}
      {!backendReady && (
        <div style={{ marginBottom: 20, padding: "16px 20px", background: "#7c2d12", border: "1px solid #f97316", borderRadius: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fed7aa", marginBottom: 6 }}>⚠️ Backend Not Updated Yet</div>
          <div style={{ fontSize: 13, color: "#fdba74", lineHeight: 1.6 }}>
            The save buttons won't work until Render deploys the latest commit.
            Go to <strong>Render → your service → Manual Deploy → Deploy latest commit</strong>.
            After ~2 min, refresh this page.
          </div>
        </div>
      )}

      {/* Preview link */}
      <div style={{ marginBottom: 24, padding: "12px 20px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text1)" }}>Landing Page Settings</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 2 }}>Changes go live on <strong>exponentgrow.in</strong> instantly after saving.</div>
        </div>
        <a href="https://exponentgrow.in" target="_blank" rel="noreferrer"
          style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", textDecoration: "none", padding: "8px 16px", border: "1px solid var(--accent)", borderRadius: 8 }}>
          Preview Site ↗
        </a>
      </div>

      {/* ─── STATS ─── */}
      <div style={S.card}>
        <div style={S.h}>📊 Stats Section</div>
        <div style={S.sub}>These 3 numbers appear on the homepage. Format them however you like (e.g. "2,400+", "4.8L", "₹120Cr").</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 24 }}>
          {/* Academies */}
          <div>
            <label style={S.label}>🏫 Institutes Active — Number</label>
            <input style={S.input} value={stats.academies.v}
              onChange={e => setStats(p => ({ ...p, academies: { ...p.academies, v: e.target.value } }))} />
            <label style={{ ...S.label, marginTop: 10 }}>Suffix (e.g. +, L, Cr)</label>
            <input style={S.input} value={stats.academies.s}
              onChange={e => setStats(p => ({ ...p, academies: { ...p.academies, s: e.target.value } }))} />
          </div>
          {/* Students */}
          <div>
            <label style={S.label}>🎓 Students Managed — Number</label>
            <input style={S.input} value={stats.students.v}
              onChange={e => setStats(p => ({ ...p, students: { ...p.students, v: e.target.value } }))} />
            <label style={{ ...S.label, marginTop: 10 }}>Suffix</label>
            <input style={S.input} value={stats.students.s}
              onChange={e => setStats(p => ({ ...p, students: { ...p.students, s: e.target.value } }))} />
          </div>
          {/* Fees */}
          <div>
            <label style={S.label}>💰 Fees Processed — Number</label>
            <input style={S.input} value={stats.fees.v}
              onChange={e => setStats(p => ({ ...p, fees: { ...p.fees, v: e.target.value } }))} />
            <label style={{ ...S.label, marginTop: 10 }}>Suffix</label>
            <input style={S.input} value={stats.fees.s}
              onChange={e => setStats(p => ({ ...p, fees: { ...p.fees, s: e.target.value } }))} />
          </div>
        </div>

        {/* Live preview */}
        <div style={{ background: "var(--bg3)", borderRadius: 10, padding: "16px 20px", marginBottom: 24, display: "flex", gap: 40, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 4, width: "100%" }}>PREVIEW</div>
          {[
            { label: "Institutes active", val: stats.academies.v, sfx: stats.academies.s },
            { label: "Students managed", val: stats.students.v, sfx: stats.students.s },
            { label: "Fees processed", val: stats.fees.v, sfx: stats.fees.s },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text1)" }}>
                {item.val}<span style={{ color: "var(--accent)" }}>{item.sfx}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{item.label}</div>
            </div>
          ))}
        </div>

        <button style={S.btn} onClick={saveStats} disabled={saving || !backendReady}>
          {saving ? "Saving…" : !backendReady ? "Deploy backend first" : "💾 Save Stats"}
        </button>
      </div>

      {/* ─── PRICING ─── */}
      <div style={S.card}>
        <div style={S.h}>💳 Pricing Plans</div>
        <div style={S.sub}>Edit the price and features for each plan shown on the landing page.</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 24 }}>
          {pricing.map((plan, pi) => (
            <div key={pi} style={{ background: "var(--bg3)", borderRadius: 10, padding: 20, border: `1px solid ${plan.popular ? "var(--accent)" : "var(--border)"}` }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text1)" }}>{plan.name}</div>
                {plan.popular && <span style={S.tag}>Recommended</span>}
              </div>

              <label style={S.label}>Price (₹/month)</label>
              <input type="number" style={{ ...S.input, marginBottom: 12 }} value={plan.price}
                onChange={e => updatePlan(pi, "price", e.target.value)} />

              <label style={S.label}>Description</label>
              <input style={{ ...S.input, marginBottom: 16 }} value={plan.desc}
                onChange={e => updatePlan(pi, "desc", e.target.value)} />

              <div style={S.divider} />

              <label style={{ ...S.label, marginBottom: 10 }}>Features</label>
              {plan.features.map((f, fi) => (
                <div key={fi} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <span style={{ color: "var(--accent)", fontSize: 12, flexShrink: 0 }}>✓</span>
                  <input style={{ ...S.input, flex: 1 }} value={f}
                    onChange={e => updateFeature(pi, fi, e.target.value)} />
                  <button onClick={() => removeFeature(pi, fi)}
                    style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>✕</button>
                </div>
              ))}
              <button onClick={() => addFeature(pi)}
                style={{ ...S.ghost, marginTop: 8, fontSize: 13, padding: "7px 14px" }}>+ Add Feature</button>
            </div>
          ))}
        </div>

        <button style={S.btn} onClick={savePricing} disabled={saving || !backendReady}>
          {saving ? "Saving…" : !backendReady ? "Deploy backend first" : "💾 Save Pricing"}
        </button>
      </div>
    </div>
  );
}
