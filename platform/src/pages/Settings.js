import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

const PLATFORM_FAVICON_KEY = "exponent_platform_favicon";

// Apply favicon to the platform tab dynamically
function applyPlatformFavicon(url) {
  const existing = document.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon']");
  existing.forEach(el => el.parentNode.removeChild(el));
  if (!url) return;
  const link = document.createElement("link");
  link.rel  = "icon";
  link.type = url.endsWith(".ico") ? "image/x-icon" : "image/png";
  link.href = url + "?v=" + Date.now();
  document.head.appendChild(link);
}

function FaviconUploader() {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(null);
  const [error,     setError]     = useState("");
  const [saved,     setSaved]     = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const saved = localStorage.getItem(PLATFORM_FAVICON_KEY);
    if (saved) setPreview(saved);
  }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setSaved(false);

    const allowed = ["image/jpeg","image/png","image/webp","image/gif","image/svg+xml","image/x-icon","image/vnd.microsoft.icon"];
    if (!allowed.includes(file.type)) {
      setError("Invalid file type. Use JPEG, PNG, WebP, SVG, or ICO.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("File too large. Max 2MB for favicon.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);
      setUploading(true);
      try {
        // FIX: platform api.js baseURL is https://api.exponentgrow.in (no /api suffix)
        // so we must include /api in the path here.
        // The server mounts upload at /api/upload, so the full endpoint is /api/upload/platform.
        const res = await API.post("/api/upload/platform", { image: base64 });
        const url = res.data.url;
        localStorage.setItem(PLATFORM_FAVICON_KEY, url);
        applyPlatformFavicon(url);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(err.response?.data?.error || "Upload failed. Please check Cloudinary env vars on Render.");
        setPreview(localStorage.getItem(PLATFORM_FAVICON_KEY) || null);
      } finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    localStorage.removeItem(PLATFORM_FAVICON_KEY);
    applyPlatformFavicon(null);
    setPreview(null);
    setSaved(false);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10, overflow: "hidden",
          background: "var(--bg3)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {preview
            ? <img src={preview} alt="favicon preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <span style={{ fontSize: 22, color: "var(--text3)" }}>🌐</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading…" : preview ? "Change Favicon" : "Upload Favicon"}
            </button>
            {preview && (
              <button className="btn btn-sm" style={{ color: "var(--red)", border: "1px solid var(--red)", background: "transparent" }} onClick={handleRemove}>
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/x-icon"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <div style={{ fontSize: 11, color: "var(--text3)" }}>
            Recommended: 32×32 or 64×64 PNG/ICO. Shown in the browser tab.
          </div>
        </div>
      </div>
      {error  && <div style={{ fontSize: 12, color: "var(--red)",   marginTop: 4 }}>{error}</div>}
      {saved  && <div style={{ fontSize: 12, color: "var(--green)", marginTop: 4 }}>✅ Favicon updated — check your browser tab!</div>}
    </div>
  );
}

export default function Settings() {
  const { admin } = useAuth();
  const [pwForm, setPwForm]     = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg]       = useState("");
  const [pwErr, setPwErr]       = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(PLATFORM_FAVICON_KEY);
    if (saved) applyPlatformFavicon(saved);
  }, []);

  const changePw = async () => {
    setPwErr(""); setPwMsg("");
    if (!pwForm.current)                 return setPwErr("Current password required");
    if (pwForm.newPw.length < 8)         return setPwErr("New password must be ≥8 characters");
    if (pwForm.newPw !== pwForm.confirm) return setPwErr("Passwords do not match");
    setPwSaving(true);
    try {
      // FIX: same prefix issue — platform auth route is at /platform/auth/change-password
      await API.post("/platform/auth/change-password", { current: pwForm.current, newPassword: pwForm.newPw });
      setPwMsg("✅ Password updated successfully!");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch (e) {
      setPwErr(e.response?.data?.error || "Failed to update password");
    } finally { setPwSaving(false); }
  };

  return (
    <div style={{ maxWidth: 680 }}>

      {/* ── Profile card ── */}
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

      {/* ── Platform Branding ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">Platform Branding</div>
        </div>
        <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>Browser Tab Favicon</div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>
          This favicon appears in the browser tab when you are logged in to <strong>exponentgrow.in</strong>.
          Stored in your browser — upload once and it persists.
        </div>
        <FaviconUploader />
      </div>

      {/* ── Change password ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">Change Password</div></div>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
          {[
            { label: "Current Password", key: "current" },
            { label: "New Password",     key: "newPw" },
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

      {/* ── Architecture info ── */}
      <div className="card">
        <div className="card-header"><div className="card-title">Platform Architecture</div></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Frontend",     value: "React 18 (Vercel)",          icon: "⚛️" },
            { label: "Backend",      value: "Node.js + Express (Render)",  icon: "🟩" },
            { label: "Database",     value: "PostgreSQL (Render)",         icon: "🐘" },
            { label: "File Upload",  value: "Cloudinary CDN",              icon: "☁️" },
            { label: "Auth",         value: "JWT + Refresh Tokens",        icon: "🔐" },
            { label: "Multi-tenant", value: "Shared DB + academy_id",      icon: "🏗️" },
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
