import { useState, useEffect } from "react";
import API from "../api";

const ACTION_COLORS = {
  CREATE_ACADEMY:           "badge-green",
  UPDATE_ACADEMY:           "badge-blue",
  SUSPEND_ACADEMY:          "badge-yellow",
  DELETE_ACADEMY_PERMANENT: "badge-red",
  CREATE_ADMIN:             "badge-green",
};

const ACTION_ICONS = {
  CREATE_ACADEMY:           "🏫",
  UPDATE_ACADEMY:           "✎",
  SUSPEND_ACADEMY:          "⏸",
  DELETE_ACADEMY_PERMANENT: "🗑",
  CREATE_ADMIN:             "👤",
};

export default function AuditLog() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    API.get("/platform/audit-log")
      .then(r => setLogs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    (l.target || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.action  || "").toLowerCase().includes(search.toLowerCase()) ||
    (l.admin_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Audit Log</div>
          <div className="page-sub">{logs.length} events · Last 200 actions</div>
        </div>
      </div>

      <div className="section">
        <input
          placeholder="🔍  Search by academy, action or admin..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 16, maxWidth: 400 }}
        />

        {loading ? (
          <div className="spinner">⟳ Loading audit log...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-text">{search ? "No matching entries." : "No audit events yet."}</div>
            <div className="empty-sub">Actions like creating, editing, suspending, or deleting academies will appear here.</div>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Details</th>
                    <th>Admin</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16 }}>{ACTION_ICONS[l.action] || "📝"}</span>
                          <span className={`badge ${ACTION_COLORS[l.action] || "badge-blue"}`}
                            style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                            {l.action.replace(/_/g, " ")}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--text1)" }}>{l.target || "—"}</td>
                      <td style={{ fontSize: 12, color: "var(--text3)", maxWidth: 240 }}>
                        {l.details && Object.keys(l.details).length > 0
                          ? Object.entries(l.details).map(([k, v]) =>
                              <span key={k} style={{ display: "inline-block", marginRight: 8 }}>
                                <span style={{ color: "var(--text2)" }}>{k}:</span>{" "}
                                {Array.isArray(v) ? v.join(", ") : String(v)}
                              </span>
                            )
                          : "—"}
                      </td>
                      <td style={{ fontSize: 13, color: "var(--text2)" }}>{l.admin_name || "system"}</td>
                      <td style={{ fontSize: 12, color: "var(--text3)", whiteSpace: "nowrap" }}>
                        {new Date(l.created_at).toLocaleString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
