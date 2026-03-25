import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

export default function Settings() {
  const { admin } = useAuth();
  const [pwForm, setPwForm]   = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg]     = useState("");
  const [pwErr, setPwErr]     = useState("");

  const changePw = async () => {
    setPwErr(""); setPwMsg("");
    if (!pwForm.current)             return setPwErr("Current password required");
    if (pwForm.newPw.length < 8)     return setPwErr("New password must be ≥8 characters");
    if (pwForm.newPw !== pwForm.confirm) return setPwErr("Passwords do not match");
    setPwSaving(true);
    try {
      await API.post("/platform/auth/change-password", { current: pwForm.current, newPassword: pwForm.newPw });
      setPwMsg("✅ Password updated successfully!");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (e) {
      setPwErr(e.response?.data?.error || "Failed to update password");
    } finally { setPwSaving(false); }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Profile card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">Platform Owner Profile</div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--purple))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 24 }}>
            {admin?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{admin?.name}</div>
            <div style={{ fontSize: 13, color: "var(--text3)" }}>{admin?.email}</div>
            <span className="badge badge-blue" style={{ marginTop: 6 }}>Platform Owner</span>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">Change Password</div></div>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
          {[
            { label: "Current Password", key: "current" },
            { label: "New Password", key: "newPw" },
            { label: "Confirm New Password", key: "confirm" },
          ].map(f => (
            <div className="form-group" key={f.key}>
              <label>{f.label}</label>
              <input type="password" value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder="••••••••" />
            </div>
          ))}
          {pwErr && <div className="alert alert-danger">{pwErr}</div>}
          {pwMsg && <div className="alert alert-success">{pwMsg}</div>}
          <button className="btn btn-primary" onClick={changePw} disabled={pwSaving} style={{ width: 180 }}>
            {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>

      {/* Architecture info */}
      <div className="card">
        <div className="card-header"><div className="card-title">Platform Architecture</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Frontend",    value: "React 18 (Netlify)",    icon: "⚛️" },
            { label: "Backend",     value: "Node.js + Express (Render)", icon: "🟩" },
            { label: "Database",    value: "PostgreSQL (Render)",   icon: "🐘" },
            { label: "File Upload", value: "Cloudinary CDN",         icon: "☁️" },
            { label: "Auth",        value: "JWT + Refresh Tokens",   icon: "🔐" },
            { label: "Multi-tenant",value: "Shared DB + academy_id", icon: "🏗️" },
          ].map(r => (
            <div key={r.label} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", background: "var(--bg3)", borderRadius: 8 }}>
              <span style={{ fontSize: 20 }}>{r.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: 12, color: "var(--text1)", fontWeight: 600 }}>{r.value}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div style={{ fontSize: 11, color: "var(--text3)" }}>
          🚀 Future roadmap: subdomain routing (nishchay.exponent.app), Razorpay billing automation, usage analytics webhooks, white-label academy portals.
        </div>
      </div>
    </div>
  );
}
