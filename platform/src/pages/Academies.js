import { useState, useEffect } from "react";
import API from "../api";
import AcademyWizard from "../components/AcademyWizard";
import AcademyEditModal from "../components/AcademyEditModal";

export default function Academies() {
  const [academies, setAcademies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
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
        {/* Search bar */}
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
                          <div
                            style={{
                              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                              background: `#${a.primary_color || "6366f1"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff", fontWeight: 700, fontSize: 14
                            }}
                          >
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
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditTarget(a)}>
                            ✎ Edit
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

      {/* New Academy Wizard */}
      {showWizard && (
        <AcademyWizard
          onClose={() => setShowWizard(false)}
          onCreated={() => { setShowWizard(false); load(); }}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <AcademyEditModal
          academy={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); load(); }}
        />
      )}

      {/* Confirm deactivate */}
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
