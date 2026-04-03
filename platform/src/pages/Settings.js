import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";

const PLATFORM_FAVICON_KEY = "exponent_platform_favicon";
const PLATFORM_LOGO_KEY    = "exponent_platform_logo";

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

function ImageUploader({ label, storageKey, currentUrl, onUploaded, hint, shape = "square" }) {
  const [uploading, setUploading] = useState(false);
  const [preview,   setPreview]   = useState(currentUrl || localStorage.getItem(storageKey) || null);
  const [error,     setError]     = useState("");
  const [saved,     setSaved]     = useState(false);
  const fileRef = useRef();

  const size   = shape === "circle" ? 60 : 48;
  const radius = shape === "circle" ? "50%" : 10;

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
        // platform api.js baseURL = https://api.exponentgrow.in (no /api suffix)
        // so we must include /api explicitly here
        const res = await API.post("/api/upload/platform", { image: base64 });
        const url = res.data.url;
        if (storageKey) localStorage.setItem(storageKey, url);
        onUploaded(url);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(err.response?.data?.error || "Upload failed. Please check Cloudinary env vars on Render.");
        setPreview(currentUrl || localStorage.getItem(storageKey) || null);
      } finally { setUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    if (storageKey) localStorage.removeItem(storageKey);
    setPreview(null); setSaved(false); setError("");
    onUploaded(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
        <div style={{
          width: size, height: size, borderRadius: radius, overflow: "hidden",
          background: "var(--bg3)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {preview
            ? <img src={preview} alt={`${label} preview`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            : <span style={{ fontSize: 22, color: "var(--text3)" }}>{shape === "circle" ? "👤" : "🖼️"}</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : preview ? `Change ${label}` : `Upload ${label}`}
            </button>
            {preview && (
              <button className="btn btn-sm" style={{ color: "var(--red)", border: "1px solid var(--red)", background: "transparent" }} onClick={handleRemove}>
                Remove
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/x-icon" style={{ display: "none" }} onChange={handleFile} />
          {hint && <div style={{ fontSize: 11, color: "var(--text3)" }}>{hint}</div>}
        </div>
      </div>
      {error && <div style={{ fontSize: 12, color: "var(--red)",   marginTop: 4 }}>{error}</div>}
      {saved  && <div style={{ fontSize: 12, color: "var(--green)", marginTop: 4 }}>✅ Uploaded successfully!</div>}
    </div>
  );
}

export default function Settings() {
  const { admin } = useAuth();

  const [branding, setBranding]       = useState({
    favicon_url: localStorage.getItem(PLATFORM_FAVICON_KEY) || "",
    logo_url:    localStorage.getItem(PLATFORM_LOGO_KEY)    || "",
  });
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandMsg,    setBrandMsg]    = useState("");
  const [brandErr,    setBrandErr]    = useState("");

  const [pwForm, setPwForm]     = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg]       = useState("");
  const [pwErr, setPwErr]       = useState("");

  useEffect(() => {
    const cached = localStorage.getItem(PLATFORM_FAVICON_KEY);
    if (cached) applyPlatformFavicon(cached);

    // FIX: route is mounted at /platform/auth in index.js, so path is /platform/auth/branding
    // (NOT /platform/branding which gave 404)
    API.get("/platform/auth/branding").then(r => {
      if (r.data?.favicon_url) {
        setBranding(b => ({ ...b, favicon_url: r.data.favicon_url }));
        localStorage.setItem(PLATFORM_FAVICON_KEY, r.data.favicon_url);
        applyPlatformFavicon(r.data.favicon_url);
      }
      if (r.data?.logo_url) {
        setBranding(b => ({ ...b, logo_url: r.data.logo_url }));
        localStorage.setItem(PLATFORM_LOGO_KEY, r.data.logo_url);
      }
    }).catch(() => {});
  }, []);

  const saveBranding = async () => {
    setBrandSaving(true); setBrandErr(""); setBrandMsg("");
    try {
      // FIX: same — correct path is /platform/auth/branding
      await API.put("/platform/auth/branding", branding);
      if (branding.favicon_url) {
        localStorage.setItem(PLATFORM_FAVICON_KEY, branding.favicon_url);
        applyPlatformFavicon(branding.favicon_url);
      }
      if (branding.logo_url) localStorage.setItem(PLATFORM_LOGO_KEY, branding.logo_url);
      setBrandMsg("✅ Branding saved! Favicon & logo will now show on all browsers and devices.");
      setTimeout(() => setBrandMsg(""), 4000);
    } catch (e) {
      setBrandErr(e.response?.data?.error || "Failed to save branding.");
    } finally { setBrandSaving(false); }
  };

  const changePw = async () => {
    setPwErr(""); setPwMsg("");
    if (!pwForm.current)                 return setPwErr("Current password required");
    if (pwForm.newPw.length < 8)         return setPwErr("New password must be ≥8 characters");
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

      {/* ── Profile card ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">Platform Owner Profile</div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {branding.logo_url
            ? <img src={branding.logo_url} alt="logo" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }} />
            : <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--purple))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 24 }}>
                {admin?.name?.[0]?.toUpperCase()}
              </div>
          }
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
        <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20, lineHeight: 1.6 }}>
          Favicon and logo are uploaded to Cloudinary and <strong>saved in the database</strong>.
          They will appear on <strong>all browsers and devices</strong> — not just this one.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", marginBottom: 8 }}>Browser Tab Favicon</div>
            <ImageUploader
              label="Favicon"
              storageKey={PLATFORM_FAVICON_KEY}
              currentUrl={branding.favicon_url}
              onUploaded={url => setBranding(b => ({ ...b, favicon_url: url || "" }))}
              hint="32×32 or 64×64 PNG/ICO. Shown in the browser tab."
            />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", marginBottom: 8 }}>Platform Logo</div>
            <ImageUploader
              label="Logo"
              storageKey={PLATFORM_LOGO_KEY}
              currentUrl={branding.logo_url}
              onUploaded={url => setBranding(b => ({ ...b, logo_url: url || "" }))}
              hint="Shown in your profile. PNG or SVG recommended."
              shape="circle"
            />
          </div>
        </div>

        {brandErr && <div style={{ fontSize: 12, color: "var(--red)",   marginBottom: 10 }}>{brandErr}</div>}
        {brandMsg && <div style={{ fontSize: 12, color: "var(--green)", marginBottom: 10 }}>{brandMsg}</div>}
        <button className="btn btn-primary btn-sm" onClick={saveBranding} disabled={brandSaving}>
          {brandSaving ? "Saving…" : "Save Branding to Database"}
        </button>
      </div>

      {/* ── Change password ── */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">Change Password</div></div>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
          {[
            { label: "Current Password",    key: "current" },
            { label: "New Password",         key: "newPw" },
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
          🚀 Future roadmap: subdomain routing, Razorpay billing automation, usage analytics webhooks, white-label academy portals.
        </div>
      </div>
    </div>
  );
}
