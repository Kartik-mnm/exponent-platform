export default function Contact() {
  const s = {
    wrap: {
      maxWidth: 760,
      margin: "0 auto",
      padding: "48px 24px 80px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
      color: "#1a1a2e",
      lineHeight: 1.75,
      fontSize: 15,
      background: "#fff",
      minHeight: "100vh",
    },
    logo: { display: "flex", alignItems: "center", gap: 10, marginBottom: 40 },
    logoMark: {
      width: 36, height: 36, borderRadius: 8,
      background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 800, fontSize: 18,
    },
    logoText: { fontWeight: 700, fontSize: 18, color: "#1a1a2e" },
    h1: { fontSize: 30, fontWeight: 800, marginBottom: 6, color: "#0f172a" },
    sub: { fontSize: 16, color: "#64748b", marginBottom: 40 },
    h2: { fontSize: 18, fontWeight: 700, marginTop: 36, marginBottom: 10, color: "#0f172a" },
    p: { marginBottom: 14 },
    card: {
      background: "#f8fafc", border: "1px solid #e2e8f0",
      borderRadius: 12, padding: "24px 28px", marginBottom: 20,
    },
    row: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14, fontSize: 15 },
    icon: { fontSize: 22, width: 36, textAlign: "center", flexShrink: 0 },
    label: { fontWeight: 600, color: "#0f172a", marginRight: 6 },
    a: { color: "#6366f1", textDecoration: "none" },
    footer: { marginTop: 48, fontSize: 12, color: "#94a3b8", textAlign: "center" },
  };

  return (
    <div style={s.wrap}>
      <div style={s.logo}>
        <div style={s.logoMark}>E</div>
        <span style={s.logoText}>Exponent Platform</span>
      </div>

      <h1 style={s.h1}>Contact Us</h1>
      <div style={s.sub}>We&rsquo;re here to help. Reach out to us anytime.</div>

      <div style={s.card}>
        <h2 style={{ ...s.h2, marginTop: 0 }}>Get in Touch</h2>
        <p style={s.p}>
          Whether you have a question about features, pricing, need a demo, or want to report an issue — we&rsquo;re happy to help!
        </p>

        <div style={s.row}>
          <span style={s.icon}>👤</span>
          <div>
            <span style={s.label}>Name:</span> Kartik Ninawe
          </div>
        </div>
        <div style={s.row}>
          <span style={s.icon}>📧</span>
          <div>
            <span style={s.label}>Email:</span>
            <a href="mailto:aspirantth@gmail.com" style={s.a}>aspirantth@gmail.com</a>
          </div>
        </div>
        <div style={s.row}>
          <span style={s.icon}>📞</span>
          <div>
            <span style={s.label}>Phone:</span>
            <a href="tel:+918956419453" style={s.a}>+91 89564 19453</a>
          </div>
        </div>
        <div style={s.row}>
          <span style={s.icon}>💬</span>
          <div>
            <span style={s.label}>WhatsApp:</span>
            <a href="https://wa.me/918956419453?text=Hi%2C+I%27d+like+to+know+more+about+Exponent" target="_blank" rel="noopener noreferrer" style={s.a}>
              Chat on WhatsApp
            </a>
          </div>
        </div>
        <div style={s.row}>
          <span style={s.icon}>📍</span>
          <div>
            <span style={s.label}>Location:</span> Nagpur, Maharashtra, India
          </div>
        </div>
      </div>

      <div style={s.card}>
        <h2 style={{ ...s.h2, marginTop: 0 }}>Response Time</h2>
        <p style={{ ...s.p, marginBottom: 0 }}>
          We typically respond within <strong>24 hours</strong> on business days. For urgent issues, WhatsApp is the fastest way to reach us.
        </p>
      </div>

      <div style={s.footer}>
        &copy; {new Date().getFullYear()} Exponent Platform &nbsp;&middot;&nbsp;
        <a href="/" style={{ ...s.a, color: "#94a3b8" }}>Back to app</a>
        &nbsp;&middot;&nbsp;
        <a href="/privacy" style={{ ...s.a, color: "#94a3b8" }}>Privacy Policy</a>
        &nbsp;&middot;&nbsp;
        <a href="/terms" style={{ ...s.a, color: "#94a3b8" }}>Terms of Service</a>
      </div>
    </div>
  );
}
