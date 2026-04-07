export default function TermsOfService() {
  const updated = "April 2026";

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
    updated: { fontSize: 13, color: "#64748b", marginBottom: 40 },
    h2: { fontSize: 18, fontWeight: 700, marginTop: 36, marginBottom: 10, color: "#0f172a" },
    p: { marginBottom: 14 },
    ul: { paddingLeft: 22, marginBottom: 14 },
    li: { marginBottom: 6 },
    divider: { borderTop: "1px solid #e2e8f0", margin: "40px 0" },
    contact: {
      background: "#f8fafc", border: "1px solid #e2e8f0",
      borderRadius: 12, padding: "20px 24px",
    },
    footer: { marginTop: 48, fontSize: 12, color: "#94a3b8", textAlign: "center" },
    a: { color: "#6366f1", textDecoration: "none" },
  };

  return (
    <div style={s.wrap}>
      <div style={s.logo}>
        <div style={s.logoMark}>E</div>
        <span style={s.logoText}>Exponent Platform</span>
      </div>

      <h1 style={s.h1}>Terms of Service</h1>
      <div style={s.updated}>Last updated: {updated}</div>

      <p style={s.p}>
        Welcome to Exponent Platform. By accessing or using our service, you agree to be bound by these Terms of Service. Please read them carefully.
      </p>

      <h2 style={s.h2}>1. Acceptance of Terms</h2>
      <p style={s.p}>
        By creating an account or using Exponent Platform (&ldquo;the Service&rdquo;), you agree to these Terms of Service and our{" "}
        <a href="/privacy" style={s.a}>Privacy Policy</a>. If you do not agree, you must not use the Service.
      </p>

      <h2 style={s.h2}>2. Description of Service</h2>
      <p style={s.p}>
        Exponent Platform provides cloud-based academy management software for coaching institutes, including tools for student management, fee collection, attendance tracking, and parent communications.
      </p>

      <h2 style={s.h2}>3. Account Registration</h2>
      <p style={s.p}>
        To use the Service, you must register an account and provide accurate, complete information. You are responsible for:
      </p>
      <ul style={s.ul}>
        <li style={s.li}>Maintaining the confidentiality of your account credentials.</li>
        <li style={s.li}>All activities that occur under your account.</li>
        <li style={s.li}>Notifying us immediately of any unauthorized access.</li>
      </ul>

      <h2 style={s.h2}>4. Acceptable Use</h2>
      <p style={s.p}>You agree to use the Service only for lawful purposes. You must not:</p>
      <ul style={s.ul}>
        <li style={s.li}>Use the Service to store or transmit unlawful or harmful content.</li>
        <li style={s.li}>Attempt to gain unauthorized access to other accounts or systems.</li>
        <li style={s.li}>Reverse engineer, copy, or redistribute the Service.</li>
        <li style={s.li}>Use the Service to spam or harass others.</li>
      </ul>

      <h2 style={s.h2}>5. Subscription and Payment</h2>
      <p style={s.p}>
        The Service is offered on a subscription basis. Pricing is listed on our website. Subscriptions are billed monthly or annually as selected. We reserve the right to change pricing with 30 days&rsquo; notice.
      </p>

      <h2 style={s.h2}>6. Free Trial</h2>
      <p style={s.p}>
        New accounts receive a 7-day free trial. No credit card is required during the trial. After the trial period, you must subscribe to continue using the Service.
      </p>

      <h2 style={s.h2}>7. Data Ownership</h2>
      <p style={s.p}>
        You retain full ownership of all data you enter into the Service. We do not claim any rights over your academy&rsquo;s data. You may export your data at any time.
      </p>

      <h2 style={s.h2}>8. Service Availability</h2>
      <p style={s.p}>
        We strive for 99.9% uptime, but do not guarantee uninterrupted access. Scheduled maintenance will be communicated in advance where possible.
      </p>

      <h2 style={s.h2}>9. Termination</h2>
      <p style={s.p}>
        You may cancel your subscription at any time from your account settings. We reserve the right to suspend or terminate accounts that violate these Terms. Upon termination, your data will be retained for 30 days before deletion.
      </p>

      <h2 style={s.h2}>10. Limitation of Liability</h2>
      <p style={s.p}>
        To the maximum extent permitted by law, Exponent Platform shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
      </p>

      <h2 style={s.h2}>11. Modifications to Terms</h2>
      <p style={s.p}>
        We may update these Terms from time to time. We will notify you of significant changes via email or an in-app notification. Continued use of the Service after changes constitutes acceptance.
      </p>

      <h2 style={s.h2}>12. Governing Law</h2>
      <p style={s.p}>
        These Terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Nagpur, Maharashtra, India.
      </p>

      <div style={s.divider} />

      <div style={s.contact}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Contact us</div>
        <p style={{ ...s.p, marginBottom: 6 }}>For any questions about these Terms:</p>
        <div style={{ fontSize: 14, lineHeight: 2 }}>
          <div><strong>Kartik Ninawe</strong></div>
          <div>Nagpur, Maharashtra, India</div>
          <div>
            Email:{" "}
            <a href="mailto:aspirantth@gmail.com" style={s.a}>aspirantth@gmail.com</a>
          </div>
          <div>
            Phone:{" "}
            <a href="tel:+918956419453" style={s.a}>+91 89564 19453</a>
          </div>
        </div>
      </div>

      <div style={s.footer}>
        &copy; {new Date().getFullYear()} Exponent Platform &nbsp;&middot;&nbsp;
        <a href="/" style={{ ...s.a, color: "#94a3b8" }}>Back to app</a>
        &nbsp;&middot;&nbsp;
        <a href="/privacy" style={{ ...s.a, color: "#94a3b8" }}>Privacy Policy</a>
      </div>
    </div>
  );
}
