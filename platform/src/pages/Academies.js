import { useState, useEffect } from "react";
import API from "../api";
import AcademyWizard from "../components/AcademyWizard";
import AcademyEditModal from "../components/AcademyEditModal";

function AdminsModal({ academy, onClose }) {
  const [admins, setAdmins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPw, setNewPw]     = useState({});
  const [saving, setSaving]   = useState({});
  const [msg, setMsg]         = useState({});

  useEffect(() => {
    API.get(`/platform/academies/${academy.id}/admins`)
      .then(r => setAdmins(r.data)).catch(() => setAdmins([])).finally(() => setLoading(false));
  }, [academy.id]);

  const resetPassword = async (adminId) => {
    const pw = newPw[adminId];
    if (!pw || pw.length < 6) { setMsg({ ...msg, [adminId]: "⚠ Min 6 characters" }); return; }
    setSaving({ ...saving, [adminId]: true });
    try {
      await API.patch(`/auth/users/${adminId}/password`, { password: pw });
      setMsg({ ...msg, [adminId]: "✅ Password updated!" });
      setNewPw({ ...newPw, [adminId]: "" });
    } catch (e) {
      setMsg({ ...msg, [adminId]: "❌ " + (e.response?.data?.error || "Failed") });
    } finally { setSaving({ ...saving, [adminId]: false }); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div className="modal-title">👤 Admins — {academy.name}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? <div className="spinner">Loading admins…</div>
          : admins.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <div className="empty-text">No admins found for this academy.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {admins.map(a => (
                <div key={a.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text1)" }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>{a.email}</div>
                    </div>
                    <span className="badge badge-blue">{a.role}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="password" placeholder="New password…" value={newPw[a.id] || ""}
                      onChange={e => setNewPw({ ...newPw, [a.id]: e.target.value })} style={{ flex: 1, fontSize: 12 }} />
                    <button className="btn btn-secondary btn-sm" onClick={() => resetPassword(a.id)} disabled={saving[a.id]}>
                      {saving[a.id] ? "…" : "Reset"}
                    </button>
                  </div>
                  {msg[a.id] && <div style={{ fontSize: 11, marginTop: 6, color: msg[a.id].startsWith("✅") ? "var(--green)" : "var(--red)" }}>{msg[a.id]}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Academies() {
  const [academies, setAcademies]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [showWizard, setShowWizard]         = useState(false);
  const [editTarget, setEditTarget]         = useState(null);
  const [adminsTarget, setAdminsTarget]     = useState(null);
  const [confirmSuspend, setConfirmSuspend] = useState(null);
  const [confirmDelete, setConfirmDelete]   = useState(null);
  const [deleteInput, setDeleteInput]       = useState("");
  const [actionLoading, setActionLoading]   = useState(false);
  // Quick extend
  const [extendTarget, setExtendTarget]     = useState(null);
  const [extendDays, setExtendDays]         = useState(30);
  const [extending, setExtending]           = useState(false);
  const [extendMsg, setExtendMsg]           = useState("");

  const load = () => {
    setLoading(true);
    API.get("/platform/academies").then(r => setAcademies(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = academies.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.city || "").toLowerCase().includes(search.toLowerCase()) ||
    (a.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = async (id) => {
    setActionLoading(true);
    try { await API.delete(`/platform/academies/${id}`); setConfirmSuspend(null); load(); }
    finally { setActionLoading(false); }
  };

  const handleReactivate = async (id) => {
    await API.put(`/platform/academies/${id}`, { is_active: true }); load();
  };

  const handleHardDelete = async () => {
    if (deleteInput !== confirmDelete.name) return;
    setActionLoading(true);
    try {
      await API.delete(`/platform/academies/${confirmDelete.id}/hard`);
      setConfirmDelete(null); setDeleteInput(""); load();
    } catch (e) { alert("Delete failed: " + (e.response?.data?.error || e.message)); }
    finally { setActionLoading(false); }
  };

  const handleExtend = async () => {
    if (!extendTarget) return;
    setExtending(true); setExtendMsg("");
    try {
      const r = await API.patch(`/platform/academies/${extendTarget.id}/extend`, { days: extendDays });
      setExtendMsg(r.data.message);
      load();
    } catch (e) {
      setExtendMsg(e.response?.data?.error || "Failed");
    } finally { setExtending(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Academies</div>
          <div className="page-sub">{academies.length} total · {academies.filter(a => a.is_active).length} active</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowWizard(true)}>+ New Academy</button>
      </div>

      <div className="section">
        <input placeholder="🔍  Search by name, city or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400 }} />

        {loading ? <div className="spinner">⟳ Loading academies...</div>
        : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏫</div>
            <div className="empty-text">{search ? "No academies match." : "No academies yet."}</div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Academy</th><th>Owner</th><th>Plan</th><th>Students</th><th>Status</th><th>Trial Ends</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const trialDays = a.trial_ends_at ? Math.ceil((new Date(a.trial_ends_at) - new Date()) / 86400000) : null;
                    const trialColor = trialDays === null ? "var(--text3)" : trialDays < 0 ? "var(--red)" : trialDays <= 3 ? "var(--red)" : trialDays <= 7 ? "var(--yellow)" : "var(--green)";
                    return (
                      <tr key={a.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `#${a.primary_color||"6366f1"}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, overflow: "hidden" }}>
                              {a.logo_url ? <img src={a.logo_url} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} /> : a.name[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "var(--text1)" }}>{a.name}</div>
                              <div style={{ fontSize: 11, color: "var(--text3)" }}>/{a.slug} · {a.city || "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 13, color: "var(--text1)" }}>{a.email || "—"}</div>
                          <div style={{ fontSize: 11, color: "var(--text3)" }}>{a.phone || ""}</div>
                        </td>
                        <td><span className="badge badge-blue">{a.plan}</span></td>
                        <td>{a.student_count || 0} / {a.max_students}</td>
                        <td><span className={`badge ${a.is_active ? "badge-green" : "badge-red"}`}>{a.is_active ? "Active" : "Suspended"}</span></td>
                        <td>
                          {a.trial_ends_at ? (
                            <span style={{ fontSize: 12, fontWeight: 600, color: trialColor }}>
                              {trialDays < 0 ? `Expired ${Math.abs(trialDays)}d ago` : `${trialDays}d left`}
                            </span>
                          ) : <span style={{ color: "var(--text3)", fontSize: 12 }}>—</span>}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                            {/* Quick extend */}
                            <button
                              className="btn btn-sm"
                              style={{ background: "rgba(16,185,129,0.12)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.25)", fontWeight: 700 }}
                              onClick={() => { setExtendTarget(a); setExtendDays(30); setExtendMsg(""); }}
                            >
                              +30d
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditTarget(a)}>✎ Edit</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setAdminsTarget(a)}>👤</button>
                            {a.is_active ? (
                              <button className="btn btn-sm" style={{ background: "rgba(234,179,8,0.12)", color: "#ca8a04" }} onClick={() => setConfirmSuspend(a)}>⏸</button>
                            ) : (
                              <button className="btn btn-success btn-sm" onClick={() => handleReactivate(a.id)}>▶</button>
                            )}
                            <button className="btn btn-sm" style={{ background: "rgba(239,68,68,0.12)", color: "var(--red)" }}
                              onClick={() => { setConfirmDelete(a); setDeleteInput(""); }}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showWizard && <AcademyWizard onClose={() => setShowWizard(false)} onCreated={() => { setShowWizard(false); load(); }} />}
      {editTarget && <AcademyEditModal academy={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />}
      {adminsTarget && <AdminsModal academy={adminsTarget} onClose={() => setAdminsTarget(null)} />}

      {/* Quick Extend Modal */}
      {extendTarget && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">⏳ Extend Access — {extendTarget.name}</div>
              <button className="modal-close" onClick={() => setExtendTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text2)", marginBottom: 20, lineHeight: 1.6 }}>
                Current expiry: <strong style={{ color: "var(--text1)" }}>
                  {extendTarget.trial_ends_at ? new Date(extendTarget.trial_ends_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "None"}
                </strong>
              </p>
              <div className="form-group">
                <label>Extend by how many days?</label>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {[7, 14, 30, 60, 90, 365].map(d => (
                    <button key={d}
                      onClick={() => setExtendDays(d)}
                      className="btn btn-sm"
                      style={{
                        background: extendDays === d ? "var(--blue-600)" : "var(--bg3)",
                        color: extendDays === d ? "#fff" : "var(--text2)",
                        border: `1px solid ${extendDays === d ? "var(--blue-600)" : "var(--border2)"}`,
                      }}
                    >{d}d</button>
                  ))}
                </div>
              </div>
              {extendMsg && (
                <div className={`alert ${extendMsg.includes("Failed") || extendMsg.includes("error") ? "alert-danger" : "alert-green"}`} style={{ marginTop: 16 }}>
                  {extendMsg}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setExtendTarget(null)}>Close</button>
              <button className="btn btn-primary" onClick={handleExtend} disabled={extending}>
                {extending ? "Extending..." : `✓ Extend ${extendDays} Days`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend confirm */}
      {confirmSuspend && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header"><div className="modal-title">⏸ Suspend Academy</div><button className="modal-close" onClick={() => setConfirmSuspend(null)}>✕</button></div>
            <div className="modal-body">
              <p style={{ color: "var(--text2)", lineHeight: 1.6 }}>Suspend <strong style={{ color: "var(--text1)" }}>{confirmSuspend.name}</strong>? You can reactivate anytime.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmSuspend(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={actionLoading} onClick={() => handleSuspend(confirmSuspend.id)}>{actionLoading ? "…" : "Yes, Suspend"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Hard delete confirm */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header"><div className="modal-title" style={{ color: "var(--red)" }}>🗑 Permanently Delete Academy</div><button className="modal-close" onClick={() => setConfirmDelete(null)}>✕</button></div>
            <div className="modal-body">
              <p style={{ color: "var(--text2)", lineHeight: 1.6, marginBottom: 16 }}>This will <strong style={{ color: "var(--red)" }}>permanently delete</strong> <strong style={{ color: "var(--text1)" }}>{confirmDelete.name}</strong> and ALL its data. Cannot be undone.</p>
              <label style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", display: "block", marginBottom: 6 }}>Type the academy name to confirm:</label>
              <input placeholder={confirmDelete.name} value={deleteInput} onChange={e => setDeleteInput(e.target.value)} style={{ width: "100%", boxSizing: "border-box" }} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" disabled={deleteInput !== confirmDelete.name || actionLoading} onClick={handleHardDelete}>
                {actionLoading ? "Deleting…" : "Delete Forever"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
