import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

// ——————————————————————————————————————————————————
// Apply favicon to this browser tab
function applyFavicon(url) {
  if (!url) return;
  const existing = document.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon']");
  existing.forEach(el => el.parentNode.removeChild(el));
  const link = document.createElement("link");
  link.rel  = "icon";
  link.id   = "favicon-el";
  link.type = url.endsWith(".ico") ? "image/x-icon" : "image/png";
  link.href = url + "?v=" + Date.now();
  document.head.appendChild(link);
}

// —— Uploader used for both favicon and logo —————————————————————————
function ImageUploader({ label, currentUrl, onUploaded, accept, hint }) {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(currentUrl || null);
  const [error,     setError]     = useState("");
  const [saved,     setSaved]     = useState(false);
  const fileRef = useRef();

  useEffect(() => { setPreview(currentUrl || null); }, [currentUrl]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(""); setSaved(false);
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","image/svg+xml","image/x-icon","image/vnd.microsoft.icon"];
    if (!allowed.includes(file.type)) { setError("Invalid file type. Use JPEG, PNG, WebP, SVG, or ICO."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("File too large. Max 2MB."); return; }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      setPreview(base64);
      setUploading(true);
      try {
        // Upload to Cloudinary
        const res = await API.post("/upload/platform", { image: base64 });
        const url = res.data.url;
        onUploaded(url);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(err.response?.data?.error || "Upload failed.");
        setPreview(currentUrl || null);
      } finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 10, overflow: "hidden",
          background: "var(--bg3)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {preview
            ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <span style={{ fontSize: 22, color: "var(--text3)" }}>🖼</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading..." : preview ? `Change ${label}` : `Upload ${label}`}
          </button>
          <input ref={fileRef} type="file" accept={accept || "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/x-icon"}
            style={{ display: "none" }} onChange={handleFile} />
          {hint && <div style={{ fontSize: 11, color: "var(--text3)" }}>{hint}</div>}
        </div>
      </div>
      {error  && <div style={{ fontSize: 12, color: "var(--red)",   marginTop: 2 }}>{error}</div>}
      {saved  && <div style={{ fontSize: 12, color: "var(--green)", marginTop: 2 }}>✅ Saved! Visible on all browsers now.</div>}
    </div>
  );
}

// ——————————————————————————————————————————————————
export default function Settings() {
  const { admin } = useAuth();
  const [pwForm,   setPwForm]   = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg,    setPwMsg]    = useState("");
  const [pwErr,    setPwErr]    = useState("");

  // Branding loaded from server (not localStorage)
  const [branding, setBranding] = useState({ favicon_url: null, logo_url: null });
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandMsg,    setBrandMsg]    = useState("");

  // Load current branding from server on mount
  useEffect(() => {
    API.get("/platform/auth/branding")
      .then(r => setBranding(r.data))
      .catch(() => {});
  }, []);

  // Save branding to DB and apply immediately to this tab
  const saveBranding = async (field, url) => {
    const updated = { ...branding, [field]: url };
    setBranding(updated);
    setBrandSaving(true);
    try {
      await API.put("/platform/auth/branding", updated);
      setBrandMsg("✅ Branding saved to server \u2014 visible on all browsers!");
      setTimeout(() => setBrandMsg(""), 4000);
      // Apply to this tab immediately
      if (field === "favicon_url") applyFavicon(url);
      // Cache in localStorage for instant next-visit (optional, server is authoritative)
      try {
        if (field === "favicon_url") localStorage.setItem("exponent_favicon_url", url);
        if (field === "logo_url")    localStorage.setItem("exponent_logo_url", url);
      } catch(e) {}
    } catch (err) {
      setBrandMsg("⚠ Failed to save: " + (err.response?.data?.error || err.message));
    } finally { setBrandSaving(false); }
  };

  const changePw = async () => {
    setPwErr(""); setPwMsg("");
    if (!pwForm.current)                 return setPwErr("Current password required");
    if (pwForm.newPw.length < 8)         return setPwErr("New password must be 8+ characters");
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

      {/* Platform Branding — saved to DB, works on ALL browsers */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">Platform Branding</div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 16, padding: "8px 12px", background: "var(--bg3)", borderRadius: 8, border: "1px solid var(--border)" }}>
          💡 These are saved to the <strong>server database</strong> — they appear on <strong>all browsers and devices</strong>, including incognito and mobile.
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", marginBottom: 6 }}>Browser Tab Favicon</div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10 }}>
            Shown in the browser tab. Recommended: 32x32 PNG or ICO.
          </div>
          <ImageUploader
            label="Favicon"
            currentUrl={branding.favicon_url}
            onUploaded={(url) => saveBranding("favicon_url", url)}
            hint="PNG, ICO, SVG — max 2MB"
          />
        </div>

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)", marginBottom: 6 }}>Sidebar Logo</div>
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10 }}>
            Shown in the sidebar of the admin panel. Recommended: square PNG, at least 128x128.
          </div>
          <ImageUploader
            label="Logo"
            currentUrl={branding.logo_url}
            onUploaded={(url) => saveBranding("logo_url", url)}
            hint="PNG, JPG, SVG — max 2MB"
          />
        </div>

        {brandMsg && (
          <div style={{ marginTop: 12, fontSize: 13, padding: "8px 12px", background: "var(--bg3)", borderRadius: 8, border: "1px solid var(--border)" }}>
            {brandMsg}
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">Change Password</div></div>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
          {[
            { label: "Current Password",     key: "current" },
            { label: "New Password",          key: "newPw" },
            { label: "Confirm New Password",  key: "confirm" },
          ].map(f => (
            <div className="form-group" key={f.key}>
              <label>{f.label}</label>
              <input type="password" value={pwForm[f.key]}
                onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
            </div>
          ))}
          {pwErr && <div className="alert alert-danger">{pwErr}</div>}
          {pwMsg && <div className="alert alert-success">{pwMsg}</div>}
          <button className="btn btn-primary" onClick={changePw} disabled={pwSaving} style={{ width: 180 }}>
            {pwSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      {/* Architecture info */}
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
      </div>
    </div>
  );
}
