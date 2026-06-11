import { useState, useEffect } from "react";
import API from "../api";

export default function Diagnostics() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedError, setExpandedError] = useState(null);
  const [msg, setMsg] = useState("");

  const load = (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    API.get("/platform/diagnostics")
      .then(r => {
        setData(r.data);
        setMsg("");
      })
      .catch(err => {
        setMsg("⚠️ Failed to load diagnostics: " + (err.response?.data?.error || err.message));
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const clearErrors = async () => {
    if (!window.confirm("Are you sure you want to clear the error logs?")) return;
    try {
      await API.post("/platform/diagnostics/clear-errors");
      load(true);
    } catch (err) {
      alert("Failed to clear error logs");
    }
  };

  if (loading) return (
    <div className="spinner">⟳ Loading system diagnostics…</div>
  );

  const db = data?.db || {};
  const services = data?.services || {};
  const server = data?.server || {};
  const cron = data?.cron || {};
  const recentErrors = data?.recentErrors || [];

  // Determine overall status
  let overallStatus = "Healthy";
  let overallColor = "badge-green";
  let overallIcon = "✅";
  
  if (db.latencyMs > 250 || recentErrors.length > 5 || cron.lastError) {
    overallStatus = "Issues Detected";
    overallColor = "badge-yellow";
    overallIcon = "⚠️";
  }
  if (db.latencyMs > 1000 || recentErrors.length > 15) {
    overallStatus = "Degraded";
    overallColor = "badge-red";
    overallIcon = "🚨";
  }

  const formatUptime = (seconds) => {
    if (!seconds) return "—";
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m} mins`;
  };

  const getCronStatus = (success, lastRunStart) => {
    if (success === true) return { text: "Success", class: "badge-green" };
    if (success === false) return { text: "Failed", class: "badge-red" };
    if (lastRunStart) return { text: "Running", class: "badge-blue" };
    return { text: "Never Run", class: "badge-yellow" };
  };

  const jobStatus = getCronStatus(cron.lastJobRunSuccess, cron.lastJobRunStart);
  const backupStatus = getCronStatus(cron.lastBackupRunSuccess, cron.lastBackupRunStart);

  return (
    <div>
      {msg && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{msg}</div>}

      {/* Top Banner / System Status */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{overallIcon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                System Status: <span className={`badge ${overallColor}`}>{overallStatus}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
                Real-time health check computed across active connection pools, latency, and background cron status.
              </div>
            </div>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => load(true)} 
            disabled={refreshing}
            style={{ minWidth: 100 }}
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {/* DB Latency */}
        <div className="stat-card" style={{ "--card-accent": db.latencyMs > 200 ? "#ef4444" : "#10b981", "--card-glow": db.latencyMs > 200 ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)" }}>
          <div className="icon">⚡</div>
          <div className="stat-label">Database Latency</div>
          <div className="stat-value" style={{ color: db.latencyMs > 200 ? "var(--red)" : "var(--green)" }}>
            {db.latencyMs ?? "—"} <span style={{ fontSize: 14 }}>ms</span>
          </div>
          <div className="stat-hint">
            Query check time (SELECT 1)
          </div>
        </div>

        {/* DB Pools */}
        <div className="stat-card" style={{ "--card-accent": "#06b6d4", "--card-glow": "rgba(6,182,212,0.12)" }}>
          <div className="icon">🔗</div>
          <div className="stat-label">Database Pool</div>
          <div className="stat-value" style={{ color: "#06b6d4" }}>
            {db.pool?.total ?? 0} <span style={{ fontSize: 14, color: "var(--text3)", fontWeight: 400 }}>total</span>
          </div>
          <div className="stat-hint">
            {db.pool?.idle ?? 0} idle · {db.pool?.waiting ?? 0} waiting queue
          </div>
        </div>

        {/* WhatsApp Clients */}
        <div className="stat-card" style={{ "--card-accent": "#25d366", "--card-glow": "rgba(37,211,102,0.12)" }}>
          <div className="icon">💬</div>
          <div className="stat-label">WhatsApp Clients</div>
          <div className="stat-value" style={{ color: "#25d366" }}>
            {services.whatsapp?.sessions?.filter(s => s.connected).length ?? 0}
            <span style={{ fontSize: 14, color: "var(--text3)", fontWeight: 400 }}> / {services.whatsapp?.activeSessionsCount ?? 0}</span>
          </div>
          <div className="stat-hint">
            Connected active sockets
          </div>
        </div>

        {/* Server Memory */}
        <div className="stat-card" style={{ "--card-accent": "#a855f7", "--card-glow": "rgba(168,85,247,0.12)" }}>
          <div className="icon">🧠</div>
          <div className="stat-label">Memory Usage</div>
          <div className="stat-value" style={{ color: "#a855f7", fontSize: 24 }}>
            {server.memoryHeapUsed ?? "—"}
          </div>
          <div className="stat-hint">
            RSS: {server.memoryRSS ?? "—"}
          </div>
        </div>

        {/* Server Uptime */}
        <div className="stat-card" style={{ "--card-accent": "#f59e0b", "--card-glow": "rgba(245,158,11,0.12)" }}>
          <div className="icon">⏱</div>
          <div className="stat-label">Server Uptime</div>
          <div className="stat-value" style={{ color: "#f59e0b", fontSize: 24 }}>
            {formatUptime(server.uptime)}
          </div>
          <div className="stat-hint">
            Node {server.nodeVersion ?? "—"} · {server.platform ?? "—"}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Background Cron status */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Background Cron Vitals</div>
            <span className={`badge ${cron.lastJobRunSuccess !== false && cron.lastBackupRunSuccess !== false ? "badge-green" : "badge-red"}`}>
              {cron.lastJobRunSuccess !== false && cron.lastBackupRunSuccess !== false ? "Active" : "Issues"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
            {/* Nightly Job */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Nightly Attendance & Alerts</span>
                <span className={`badge ${jobStatus.class}`} style={{ fontSize: 10 }}>
                  {jobStatus.text}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>
                Last Run: {cron.lastJobRunEnd ? new Date(cron.lastJobRunEnd).toLocaleString("en-IN") : "Never"}
              </div>
              {cron.lastError && (
                <div style={{ color: "var(--red)", fontSize: 11, marginTop: 4, background: "rgba(239,68,68,0.06)", padding: "6px 8px", borderRadius: 4 }}>
                  Task <strong>{cron.lastError.task}</strong> failed: {cron.lastError.message}
                </div>
              )}
            </div>

            <div className="divider" style={{ margin: 0 }} />

            {/* DB Backup */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>JSON DB Backup Email</span>
                <span className={`badge ${backupStatus.class}`} style={{ fontSize: 10 }}>
                  {backupStatus.text}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>
                Last Run: {cron.lastBackupRunEnd ? new Date(cron.lastBackupRunEnd).toLocaleString("en-IN") : "Never"}
              </div>
              {cron.lastBackupError && (
                <div style={{ color: "var(--red)", fontSize: 11, marginTop: 4, background: "rgba(239,68,68,0.06)", padding: "6px 8px", borderRadius: 4 }}>
                  Backup Error: {cron.lastBackupError}
                </div>
              )}
            </div>

            <div className="divider" style={{ margin: 0 }} />

            {/* External APIs Config */}
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, display: "block", marginBottom: 8 }}>Third-Party Configurations</span>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 8px", background: "var(--bg3)", borderRadius: 6 }}>
                  <span>📨</span>
                  <span>Resend:</span>
                  <span style={{ fontWeight: 600, color: services.resend?.configured ? "var(--green)" : "var(--red)" }}>
                    {services.resend?.configured ? "Configured" : "Missing"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, padding: "4px 8px", background: "var(--bg3)", borderRadius: 6 }}>
                  <span>🔥</span>
                  <span>Firebase FCM:</span>
                  <span style={{ fontWeight: 600, color: services.fcm?.initialized ? "var(--green)" : "var(--red)" }}>
                    {services.fcm?.initialized ? "Initialized" : "Missing"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp sessions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">WhatsApp Session Vitals</div>
            <div className="card-sub">{services.whatsapp?.sessions?.length || 0} active session(s) booted</div>
          </div>
          {services.whatsapp?.sessions?.length === 0 ? (
            <div className="empty-state" style={{ padding: "24px 0" }}>
              <div className="empty-text">No active sessions</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
              {services.whatsapp?.sessions?.map(s => (
                <div key={s.academy_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: "var(--bg3)" }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: s.connected ? "var(--green)" : "var(--red)",
                    boxShadow: s.connected ? "0 0 8px var(--green)" : "none"
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Academy ID: #{s.academy_id}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)" }}>
                      {s.name ? `${s.name} (${s.phone})` : "Authentication pending / loading"}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: s.connected ? "var(--green)" : "var(--red)" }}>
                    {s.connected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unhandled Exceptions Panel */}
      <div className="card">
        <div className="card-header" style={{ borderBottom: "1px solid var(--border)", paddingBottom: 14, marginBottom: 14 }}>
          <div>
            <div className="card-title">Unhandled Server Exceptions</div>
            <div className="card-sub">Last 20 unhandled errors captured in memory</div>
          </div>
          {recentErrors.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={clearErrors} style={{ background: "rgba(239,68,68,0.1)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)" }}>
              🗑 Clear Error Logs
            </button>
          )}
        </div>

        {recentErrors.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}>
            <div className="empty-icon">🛡</div>
            <div className="empty-text" style={{ color: "var(--green)" }}>No recent crashes</div>
            <div className="empty-sub">Your backend server is running completely error-free!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentErrors.map((err, i) => {
              const isOpen = expandedError === i;
              return (
                <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", background: "var(--bg3)" }}>
                  <div 
                    onClick={() => setExpandedError(isOpen ? null : i)}
                    style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span className={`badge ${err.method === "GET" ? "badge-blue" : err.method === "POST" ? "badge-green" : "badge-yellow"}`} style={{ fontSize: 10, minWidth: 50, textAlign: "center" }}>
                        {err.method}
                      </span>
                      <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "var(--text1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {err.path}
                      </span>
                      {err.user && (
                        <span style={{ fontSize: 11, color: "var(--text3)" }}>
                          ({err.user.role}: {err.user.name})
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>
                        {new Date(err.timestamp).toLocaleTimeString("en-IN")}
                      </span>
                      <span style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
                    </div>
                  </div>

                  {/* Expanded Stack trace details */}
                  {isOpen && (
                    <div style={{ padding: "14px", borderTop: "1px solid var(--border)", background: "var(--bg2)" }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--red)", marginBottom: 8, wordBreak: "break-all" }}>
                        {err.message}
                      </div>
                      {err.body && (
                        <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text2)", marginBottom: 10, background: "var(--bg3)", padding: 8, borderRadius: 4 }}>
                          <strong>Request Body:</strong> {err.body}
                        </div>
                      )}
                      <pre style={{ 
                        margin: 0, 
                        padding: 12, 
                        background: "#0f172a", 
                        color: "#f8fafc", 
                        fontFamily: "Consolas, Monaco, monospace", 
                        fontSize: 11, 
                        lineHeight: 1.5,
                        borderRadius: 6, 
                        overflowX: "auto",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-all"
                      }}>
                        {err.stack || "No stack trace recorded."}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
