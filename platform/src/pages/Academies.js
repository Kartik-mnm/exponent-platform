import { useState, useEffect } from "react";
import API from "../api";
import AcademyWizard from "../components/AcademyWizard";
import AcademyEditModal from "../components/AcademyEditModal";

function AdminsModal({ academy, onClose }) {
  const [admins, setAdmins]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [newPw, setNewPw]           = useState({});
  const [saving, setSaving]         = useState({});
  const [msg, setMsg]               = useState({});

  useEffect(() => {
    API.get(`/platform/academies/${academy.id}/admins`)
      .then((r) => setAdmins(r.data))
      .catch(() => setAdmins([]))
      .finally(() => setLoading(false));
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
    } finally {
      setSaving({ ...saving, [adminId]: false });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <div className="modal-title">👤 Admins — {academy.name}</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="spinner">Loading admins…</div>
          ) : admins.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <div className="empty-text">No admins found for this academy.</div>
              <div className="empty-sub">Create one using the Academy Wizard or add via the API.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {admins.map((a) => (
                <div key={a.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text1)" }}>{a.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>{a.email}</div>
                    </div>
                    <span className="badge badge-blue">{a.role}</span>
                  </div>
                  {/* Password reset inline */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="password"
                      placeholder="New password…"
                      value={newPw[a.id] || ""}
                      onChange={(e) => setNewPw({ ...newPw, [a.id]: e.target.value })}
                      style={{ flex: 1, fontSize: 12 }}
                    />
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => resetPassword(a.id)}
                      disabled={saving[a.id]}
                    >
                      {saving[a.id] ? "…" : "Reset"}
                    </button>
                  </div>
                  {msg[a.id] && (
                    <div style={{ fontSize: 11, marginTop: 6, color: msg[a.id].startsWith("✅") ? "var(--green)" : "var(--red)" }}>
                      {msg[a.id]}
                    </div>
                  )}
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
  const [academies, setAcademies]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [showWizard, setShowWizard]       = useState(false);
  const [editTarget, setEditTarget]       = useState(null);
  const [adminsTarget, setAdminsTarget]   = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const load = () => {
    setLoading(true);
    API.get("/platform/academies")
      .then((r) => setAcademies(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = academies.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDeactivate = async (id) => {
    await API.delete(`/platform/academies/${id}`);
    setConfirmDeactivate(null);
    load();
  };

  const handleReactivate = async (id) => {
    await API.put(`/platform/academies/${id}`, { is_active: true });
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Academies</div>
          <div className="page-sub">{academies.length} total · {academies.filter((a) => a.is_active).length} active</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowWizard(true)}>
          + New Academy
        </button>
      </div>

      <div className="section">
        <input
          placeholder="🔍  Search academies by name or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400 }}
        />

        {loading ? (
          <div className="spinner">⟳ Loading academies...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏫</div>
            <div className="empty-text">{search ? "No academies match your search." : "No academies yet. Create your first one!"}</div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Academy</th>
                    <th>Location</th>
                    <th>Plan</th>
                    <th>Students</th>
                    <th>Branches</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                            background: `#${a.primary_color || "6366f1"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 700, fontSize: 14
                          }}>
                            {a.logo_url
                              ? <img src={a.logo_url} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover" }} />
                              : a.name[0].toUpperCase()
                            }
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text1)" }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: "var(--text3)" }}>/{a.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td>{a.city || "—"}</td>
                      <td><span className="badge badge-blue">{a.plan}</span></td>
                      <td>{a.student_count || 0} / {a.max_students}</td>
                      <td>{a.branch_count || 0}</td>
                      <td>
                        <span className={`badge ${a.is_active ? "badge-green" : "badge-red"}`}>
                          {a.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditTarget(a)}>
                            ✎ Edit
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setAdminsTarget(a)}>
                            👤 Admins
                          </button>
                          {a.is_active ? (
                            <button
                              className="btn btn-sm"
                              style={{ background: "rgba(239,68,68,0.12)", color: "var(--red)" }}
                              onClick={() => setConfirmDeactivate(a)}
                            >
                              Suspend
                            </button>
                          ) : (
                            <button className="btn btn-success btn-sm" onClick={() => handleReactivate(a.id)}>
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showWizard && (
        <AcademyWizard onClose={() => setShowWizard(false)} onCreated={() => { setShowWizard(false); load(); }} />
      )}

      {editTarget && (
        <AcademyEditModal academy={editTarget} onClose={() => setEditTarget(null)} onSaved={() => { setEditTarget(null); load(); }} />
      )}

      {adminsTarget && (
        <AdminsModal academy={adminsTarget} onClose={() => setAdminsTarget(null)} />
      )}

      {confirmDeactivate && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <div className="modal-title">Suspend Academy</div>
              <button className="modal-close" onClick={() => setConfirmDeactivate(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ color: "var(--text2)", lineHeight: 1.6 }}>
                Are you sure you want to suspend <strong style={{ color: "var(--text1)" }}>{confirmDeactivate.name}</strong>?
                Their portal will show a "Account Suspended" message. You can reactivate anytime.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setConfirmDeactivate(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDeactivate(confirmDeactivate.id)}>
                Yes, Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
