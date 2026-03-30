// ── Leads Page ────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import API from "../api";

const WA_NUMBER = "918956419453";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (h < 1)  return "Just now";
  if (h < 24) return `${h}h ago`;
  if (d < 7)  return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function Leads() {
  const [leads, setLeads]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [converting, setConverting] = useState(null);
  const [discarding, setDiscarding] = useState(null);
  const [msg, setMsg]               = useState("");

  const load = () => {
    setLoading(true);
    API.get("/platform/leads")
      .then(r => setLeads(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = leads.filter(l =>
    (l.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.phone || "").includes(search)
  );

  const handleConvert = async (lead) => {
    if (!window.confirm(`Convert "${lead.name}" to a 7-day trial academy?`)) return;
    setConverting(lead.id);
    try {
      const r = await API.patch(`/platform/leads/${lead.id}/convert`);
      setMsg(r.data.message);
      load();
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed");
    } finally { setConverting(null); }
  };

  const handleDiscard = async (lead) => {
    if (!window.confirm(`Discard lead "${lead.name}"? This cannot be undone.`)) return;
    setDiscarding(lead.id);
    try {
      await API.delete(`/platform/leads/${lead.id}`);
      setMsg("Lead discarded.");
      load();
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed");
    } finally { setDiscarding(null); }
  };

  // Clean academy name — strip the [LEAD] prefix for display
  const cleanName = (raw) => (raw || "").replace(/^\[LEAD\]\s*/i, "").trim();

  const waLink = (lead) => {
    const text = encodeURIComponent(
      `Hi! I'm following up on your interest in Exponent Academy OS.\n\nAcademy: ${cleanName(lead.name)}\n\nWe'd love to help you set up your academy. Want to start your 7-day free trial?`
    );
    return `https://wa.me/${lead.phone?.replace(/\D/g, "") || WA_NUMBER}?text=${text}`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Leads</div>
          <div className="page-sub">{leads.length} pending lead{leads.length !== 1 ? "s" : ""} · Follow up within 24 hours</div>
        </div>
      </div>

      {msg && (
        <div className="alert alert-green" style={{ marginBottom: 16 }}>
          ✓ {msg}
          <button onClick={() => setMsg("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>✕</button>
        </div>
      )}

      {leads.length === 0 && !loading ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text1)", marginBottom: 8 }}>No leads yet</div>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>When someone clicks "Quick Setup" on your landing page, they'll appear here.</div>
        </div>
      ) : (
        <div className="section">
          <input
            placeholder="🔍  Search by name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 16, maxWidth: 360 }}
          />

          {loading ? (
            <div className="spinner">⟳ Loading leads...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map(lead => (
                <div key={lead.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    {/* Avatar */}
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #f59e0b22, #f59e0b11)",
                      border: "2px solid rgba(245,158,11,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, fontWeight: 700, color: "#f59e0b",
                    }}>
                      {cleanName(lead.name)[0]?.toUpperCase() || "📝"}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text1)", marginBottom: 4 }}>
                        {cleanName(lead.name)}
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {lead.phone && (
                          <div style={{ fontSize: 13, color: "var(--text2)", display: "flex", alignItems: "center", gap: 4 }}>
                            📞 {lead.phone}
                          </div>
                        )}
                        {lead.email && (
                          <div style={{ fontSize: 13, color: "var(--text2)", display: "flex", alignItems: "center", gap: 4 }}>
                            ✉️ {lead.email}
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: "var(--text3)" }}>
                          🕒 {timeAgo(lead.created_at)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      {/* WhatsApp follow-up */}
                      <a
                        href={waLink(lead)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm"
                        style={{ background: "rgba(37,211,102,0.12)", color: "#25d366", border: "1px solid rgba(37,211,102,0.25)", textDecoration: "none" }}
                      >
                        💬 WhatsApp
                      </a>

                      {/* Call */}
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="btn btn-ghost btn-sm"
                          style={{ textDecoration: "none" }}
                        >
                          📞 Call
                        </a>
                      )}

                      {/* Convert to trial */}
                      <button
                        className="btn btn-sm"
                        style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.25)" }}
                        onClick={() => handleConvert(lead)}
                        disabled={converting === lead.id}
                      >
                        {converting === lead.id ? "Converting..." : "⬆ Convert to Trial"}
                      </button>

                      {/* Discard */}
                      <button
                        className="btn btn-sm"
                        style={{ background: "rgba(239,68,68,0.08)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)" }}
                        onClick={() => handleDiscard(lead)}
                        disabled={discarding === lead.id}
                      >
                        {discarding === lead.id ? "..." : "🗑"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="empty-state">
                  <div className="empty-text">No leads match your search.</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
