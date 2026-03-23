import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg1)", padding: 20
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontSize: 36, fontWeight: 800, letterSpacing: -1,
            background: "linear-gradient(135deg, #6366f1, #a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            EXPONENT
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Platform Control
          </div>
        </div>

        {/* Card */}
        <div className="card">
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Welcome back</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>Sign in to manage your academies</div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email" value={email} required autoFocus
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kartik@exponent.app"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password" value={password} required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 7, padding: "10px 12px", fontSize: 13, color: "var(--red)"
              }}>
                {error}
              </div>
            )}

            <button
              type="submit" className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: "var(--text3)" }}>
          Exponent Platform · Admin access only
        </div>
      </div>
    </div>
  );
}
