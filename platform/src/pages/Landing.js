import { useState, useEffect } from "react";

/* ─────────────────────────────────────────
   OWNER CONSTANTS  (unchanged)
───────────────────────────────────────── */
const OWNER_EMAIL    = "aspirantth@gmail.com";
const OWNER_PHONE    = "8956419453";
const OWNER_WHATSAPP = "918956419453";

/* ─────────────────────────────────────────
   DESIGN TOKENS — Black & Neon Lime
───────────────────────────────────────── */
const T = {
  /* backgrounds */
  bg:    "#050505",
  bg2:   "#0F0F0F",
  bg3:   "#1A1A1A",
  bg4:   "#222222",
  /* borders */
  bdr:   "#2A2A2A",
  bdr2:  "#3A3A3A",
  /* text */
  t1:    "#FFFFFF",
  t2:    "#A6A6A6",
  t3:    "#6B6B6B",
  /* accent: neon lime / chartreuse */
  a:     "#E1FF00",
  a2:    "#C7E600",
  aDark: "#1A2000",
  /* supporting tints */
  grn:   "#22C55E",
  yel:   "#EAB308",
  red:   "#EF4444",
  cyn:   "#22D3EE",
};

/* ─────────────────────────────────────────
   BUTTON COMPONENTS
───────────────────────────────────────── */

/* Primary — Neon, black text */
const PrimaryBtn = ({ children, onClick, large, style: extra = {} }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: large ? "14px 28px" : "10px 22px",
        borderRadius: 8,
        fontWeight: 700, fontSize: large ? 15 : 14,
        letterSpacing: "0.02em",
        cursor: "pointer", border: "none",
        background: hov ? T.a2 : T.a,
        color: "#000",
        transition: "all 0.2s ease",
        ...extra,
      }}
    >
      {children}
    </button>
  );
};

/* Ghost — transparent with faint border */
const GhostBtn = ({ children, onClick, href, style: extra = {} }) => {
  const [hov, setHov] = useState(false);
  const s = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "10px 22px", borderRadius: 8,
    fontWeight: 600, fontSize: 14,
    letterSpacing: "0.02em",
    cursor: "pointer",
    background: hov ? T.bg3 : "transparent",
    color: T.t1,
    border: `1px solid ${T.bdr}`,
    textDecoration: "none",
    transition: "all 0.2s ease",
    ...extra,
  };
  const handlers = {
    onMouseEnter: () => setHov(true),
    onMouseLeave: () => setHov(false),
  };
  if (href) return <a href={href} style={s} {...handlers}>{children}</a>;
  return <button onClick={onClick} style={s} {...handlers}>{children}</button>;
};

/* Section label badge */
const Label = ({ children }) => (
  <div style={{
    display: "inline-flex", alignItems: "center", gap: 8,
    fontSize: 12, fontWeight: 700, color: T.a,
    letterSpacing: "0.1em", textTransform: "uppercase",
    marginBottom: 20,
  }}>
    <span style={{ width: 6, height: 6, background: T.a, display: "inline-block" }} />
    {children}
  </div>
);

/* Reusable section heading */
const SecHeading = ({ label, title, sub, center = false }) => (
  <div style={{ textAlign: center ? "center" : "left", marginBottom: 54 }}>
    {label && <Label>{label}</Label>}
    <h2 style={{
      fontSize: "clamp(32px, 4vw, 48px)",
      fontWeight: 800, color: T.t1,
      letterSpacing: "-1px", lineHeight: 1.1,
      marginBottom: 16,
    }}>{title}</h2>
    {sub && (
      <p style={{
        fontSize: 17, color: T.t2,
        maxWidth: center ? 600 : 540,
        margin: center ? "0 auto" : "0",
        lineHeight: 1.6,
      }}>{sub}</p>
    )}
  </div>
);

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function Navbar({ onGetStarted, onLogin }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoUrl,    setLogoUrl]    = useState(
    () => { try { return localStorage.getItem("exponent_logo_url") || null; } catch { return null; } }
  );

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    fetch("https://api.exponentgrow.in/platform/auth/public-branding")
      .then(r => r.json())
      .then(data => {
        if (data.logo_url) {
          setLogoUrl(data.logo_url);
          try { localStorage.setItem("exponent_logo_url", data.logo_url); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { label: "Features",     id: "features"     },
    { label: "Pricing",      id: "pricing"      },
    { label: "How It Works", id: "how-it-works" },
  ];

  const handleLink = (id) => { setMobileOpen(false); scrollTo(id); };

  const navBg = scrolled || mobileOpen ? `${T.bg}E6` : "transparent";
  const navBorder = scrolled || mobileOpen ? `1px solid ${T.bdr}` : "1px solid transparent";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 6%", height: 70,
        display: "flex", alignItems: "center", justifyItems: "center",
        background: navBg,
        backdropFilter: scrolled || mobileOpen ? "blur(12px)" : "none",
        borderBottom: navBorder,
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, maxWidth: 1200, margin: "0 auto" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {logoUrl
              ? <img src={logoUrl} alt="Exponent" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "contain" }} />
              : (
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: T.a,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#000", fontWeight: 900, fontSize: 15,
                }}>E</div>
              )
            }
            <div style={{
              fontSize: 16, fontWeight: 800, letterSpacing: "-0.5px",
              color: T.t1, display: "flex", alignItems: "center", gap: 6
            }}>
              ExponentGrow <span style={{ fontSize: 10, background: T.bg3, padding: "2px 6px", borderRadius: 4, color: T.t2, fontWeight: 600 }}>OS</span>
            </div>
          </div>

          {/* Desktop nav links */}
          <div style={{ display: "flex", gap: 40, alignItems: "center", position: "absolute", left: "50%", transform: "translateX(-50%)" }} className="desktop-links">
            {navLinks.map(l => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                style={{
                  fontSize: 14, color: T.t2, background: "none", border: "none",
                  cursor: "pointer", fontWeight: 500, padding: 0,
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => e.target.style.color = T.t1}
                onMouseLeave={e => e.target.style.color = T.t2}
              >{l.label}</button>
            ))}
          </div>

          {/* CTA group */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <button
              onClick={onLogin}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, color: T.t1, fontWeight: 600,
                display: typeof window !== "undefined" && window.innerWidth < 480 ? "none" : "block",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => e.target.style.color = T.t2}
              onMouseLeave={e => e.target.style.color = T.t1}
            >Log in</button>
            <PrimaryBtn onClick={onGetStarted} style={{ padding: "8px 16px" }} className="desktop-btn">Get Started</PrimaryBtn>
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu"
              style={{
                display: "none", background: "none",
                border: "none", color: T.t1,
                fontSize: 24, lineHeight: 1, padding: 0,
              }}
              className="hamburger-btn"
            >{mobileOpen ? "✕" : "☰"}</button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 70, left: 0, right: 0, zIndex: 99,
          background: T.bg, padding: "20px 6% 32px",
          display: "flex", flexDirection: "column", gap: 4,
          borderBottom: `1px solid ${T.bdr}`,
        }}>
          {navLinks.map(l => (
            <button
              key={l.id}
              onClick={() => handleLink(l.id)}
              style={{
                fontSize: 18, color: T.t1, background: "none", border: "none",
                cursor: "pointer", fontWeight: 600,
                padding: "16px 0", textAlign: "left",
                borderBottom: `1px solid ${T.bdr}`,
              }}
            >{l.label}</button>
          ))}
          <div style={{ display: "flex", gap: 12, marginTop: 24, flexDirection: "column" }}>
            <GhostBtn onClick={() => { setMobileOpen(false); onLogin(); }} style={{ width: "100%", padding: "14px" }}>Log in</GhostBtn>
            <PrimaryBtn onClick={() => { setMobileOpen(false); onGetStarted(); }} large style={{ width: "100%" }}>Get StartedFree</PrimaryBtn>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:850px){
          .hamburger-btn{display:block!important}
          .desktop-links{display:none!important}
          .desktop-btn{display:none!important}
        }
      `}</style>
    </>
  );
}

/* ─────────────────────────────────────────
   HERO & DASH PREVIEW
───────────────────────────────────────── */
function Hero({ onGetStarted }) {
  const stats = [
    { l: "Total Students",  v: "1,204", c: T.a },
    { l: "Revenue (M)",     v: "₹2.4L", c: T.t1 },
    { l: "Attendance",      v: "94%",   c: T.t1 },
  ];
  return (
    <section style={{
      padding: "160px 6% 80px",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: T.bg, position: "relative", overflow: "hidden",
    }}>
      {/* Subtle faint highlight behind the dashboard */}
      <div style={{
        position: "absolute", top: "20%", right: "10%",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${T.aDark} 0%, transparent 60%)`,
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: 1200, width: "100%",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center",
      }} className="hero-grid">

        {/* Text Content */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 14px", borderRadius: 20,
            background: T.bg2, border: `1px solid ${T.bdr}`,
            fontSize: 12, color: T.t2, fontWeight: 600,
            marginBottom: 30,
          }}>
            <span style={{ color: T.a }}>●</span> New V2.0 Platform Live
          </div>

          <h1 style={{
            fontSize: "clamp(48px, 6vw, 76px)",
            fontWeight: 800, lineHeight: 1.05,
            letterSpacing: "-2px", color: T.t1,
            marginBottom: 24,
          }}>
            Manage your<br />academy.<br />
            <span style={{ color: T.a }}>Grow faster.</span>
          </h1>

          <p style={{
            fontSize: 18, color: T.t2, lineHeight: 1.6,
            marginBottom: 40, maxWidth: 480,
          }}>
            One platform for admissions, attendance, fees, tests, and reports. Drop the spreadsheets — run everything from a single dashboard.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
            <PrimaryBtn large onClick={onGetStarted}>Get Started Free</PrimaryBtn>
            <GhostBtn large onClick={() => scrollTo("how-it-works")} href="#how-it-works" style={{ border: "none", padding: "14px", color: T.t2 }}>
              Learn more <span style={{ marginLeft: 4 }}>→</span>
            </GhostBtn>
          </div>

          {/* Social Proof */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 40 }}>
            <div style={{ display: "flex" }}>
              {["#4FA5FF","#FF4F4F","#FFD04F","#4FFF5F"].map((c, i) => (
                <div key={i} style={{
                  width: 30, height: 30, borderRadius: "50%", background: c,
                  border: `2px solid ${T.bg}`, marginLeft: i > 0 ? -12 : 0,
                }} />
              ))}
            </div>
            <div style={{ fontSize: 13, color: T.t2, fontWeight: 500 }}>
              Join <span style={{ color: T.t1, fontWeight: 700 }}>2,400+</span> institutes in India.
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div style={{ position: "relative", zIndex: 2 }} className="hero-img-wrap">
          <div style={{
            background: T.bg2,
            border: `1px solid ${T.bdr}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: `0 30px 80px rgba(0,0,0,0.8)`,
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.bdr}`, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FF5F56" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FEBC2E" }} />
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28C840" }} />
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 13, color: T.t2, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>Total Students</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: T.t1, marginBottom: 6 }}>1,204</div>
              <div style={{ fontSize: 13, color: T.a, fontWeight: 600, marginBottom: 32 }}>+12% this month</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { n: "Priya Sharma", t: "Fee Paid — Class 10", v: "₹2,500", c: T.a },
                  { n: "Rahul Das", t: "Admission — JEE", v: "New", c: T.t1 },
                  { n: "Sneha Patil", t: "Absent — Group B", v: "Alert sent", c: T.t2 },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, background: T.bg3, padding: 16, borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.bg4, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {item.n[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.t1 }}>{item.n}</div>
                      <div style={{ fontSize: 13, color: T.t3 }}>{item.t}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: item.c }}>{item.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media(max-width:1024px){
          .hero-grid{grid-template-columns:1fr; text-align:center;}
          .hero-grid > div:first-child{align-items:center; display:flex; flexDirection:column;}
          .hero-img-wrap{display:none;}
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────────
   STATS DIVIDER
───────────────────────────────────────── */
function Stats() {
  return (
    <section style={{ borderTop: `1px solid ${T.bdr}`, borderBottom: `1px solid ${T.bdr}`, padding: "60px 6%" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40 }}>
        {[
          { v: "2,400", s: "+", l: "Institutes active" },
          { v: "4.8", s: "L", l: "Students managed" },
          { v: "₹120", s: "Cr", l: "Fees processed yearly" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "left", borderLeft: i > 0 ? `1px solid ${T.bdr}` : "none", paddingLeft: i > 0 ? 40 : 0 }}>
            <div style={{ fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 800, color: T.t1, letterSpacing: "-1px" }}>
              {s.v}<span style={{ color: T.a }}>{s.s}</span>
            </div>
            <div style={{ fontSize: 14, color: T.t2, marginTop: 4, fontWeight: 500 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FEATURES
───────────────────────────────────────── */
const FEATS = [
  { icon: "📝", title: "Add students instantly", desc: "Easily enroll new students, auto-generate roll numbers, and organize them into specific batches and branches." },
  { icon: "💳", title: "Automate fee tracking", desc: "No more ledgers. Generate fee records automatically, track partial payments, and view outstanding dues." },
  { icon: "📱", title: "Smart QR Attendance", desc: "Generate ID cards with QR codes and mark attendance simply by scanning from your smartphone camera." },
  { icon: "🔔", title: "Engage Parents", desc: "Send automated SMS or push notifications for absences, fee reminders, or exam results directly to parents." },
];

function Features() {
  return (
    <section id="features" style={{ padding: "120px 6%", borderBottom: `1px solid ${T.bdr}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 60 }}>
          <Label>Features</Label>
          <h2 style={{ fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 800, color: T.t1, letterSpacing: "-1px", lineHeight: 1.1, maxWidth: 600 }}>
            Everything your<br />institute needs
          </h2>
          <p style={{ fontSize: 18, color: T.t2, marginTop: 24, maxWidth: 600, lineHeight: 1.6 }}>
            A full command center for your academy. Stop juggling between WhatsApp, Excel, and accounting software.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {FEATS.map((f, i) => (
            <div key={i} style={{
              background: T.bg2, border: `1px solid ${T.bdr}`,
              padding: 40, borderRadius: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: T.bg3, border: `1px solid ${T.bdr}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                marginBottom: 24
              }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.t1, marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: T.t2, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   HOW IT WORKS
───────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n: "01", t: "Create an account", d: "Sign up in 2 minutes. Enter your academy details and set up your branches." },
    { n: "02", t: "Add your students", d: "Import your student list in bulk or add them individually. Assign them to batches." },
    { n: "03", t: "Start operating", d: "Generate ID cards, collect fees, and track attendance all from one place." },
  ];
  return (
    <section id="how-it-works" style={{ padding: "120px 6%", borderBottom: `1px solid ${T.bdr}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Label>How it Works</Label>
        <h2 style={{ fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 800, color: T.t1, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 60 }}>
          Up and running<br />in 30 minutes
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
          {steps.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.a, marginBottom: 16 }}>{s.n}</div>
              <div style={{ width: "100%", height: 1, background: T.bdr, marginBottom: 24 }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, color: T.t1, marginBottom: 12 }}>{s.t}</h3>
              <p style={{ fontSize: 15, color: T.t2, lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   PRICING
───────────────────────────────────────── */
const PLANS = [
  {
    name: "Starter", price: 999, popular: false,
    desc: "For small institutes getting started.",
    features: ["Up to 100 students", "1 branch & 2 staff members", "Basic fee tracking", "Email support"],
  },
  {
    name: "Growth", price: 2499, popular: true,
    desc: "For established institutes expanding rapidly.",
    features: ["Unlimited students", "Multiple branches & admin roles", "Complete fee & attendance CRM", "Parent SMS/App notifications", "Priority WhatsApp support"],
  }
];

function Pricing({ onGetStarted }) {
  return (
    <section id="pricing" style={{ padding: "120px 6%", borderBottom: `1px solid ${T.bdr}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Label>Pricing</Label>
        <h2 style={{ fontSize: "clamp(36px, 4vw, 48px)", fontWeight: 800, color: T.t1, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 60 }}>
          Simple, honest pricing
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "stretch" }}>
          {PLANS.map((p, i) => (
            <div key={i} style={{
              background: T.bg2, border: `1px solid ${p.popular ? T.a : T.bdr}`,
              borderRadius: 16, padding: 40,
              position: "relative",
              display: "flex", flexDirection: "column"
            }}>
              {p.popular && (
                <div style={{
                  position: "absolute", top: -12, right: 32,
                  background: T.a, color: "#000",
                  fontSize: 11, fontWeight: 800, padding: "4px 12px",
                  borderRadius: 20, textTransform: "uppercase", letterSpacing: "1px"
                }}>Recommended</div>
              )}
              <div style={{ fontSize: 15, fontWeight: 700, color: T.t2, marginBottom: 16, textTransform: "uppercase", letterSpacing: "1px" }}>{p.name}</div>
              <div style={{ marginBottom: 24, display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: T.t1 }}>₹</span>
                <span style={{ fontSize: 48, fontWeight: 800, color: T.t1, letterSpacing: "-1.5px" }}>{p.price}</span>
                <span style={{ fontSize: 15, color: T.t3 }}>/mo</span>
              </div>
              <p style={{ fontSize: 15, color: T.t2, lineHeight: 1.6, marginBottom: 32 }}>{p.desc}</p>

              <div style={{ width: "100%", height: 1, background: T.bdr, marginBottom: 32 }} />

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 16, flex: 1, marginBottom: 40 }}>
                {p.features.map((f, j) => (
                  <li key={j} style={{ fontSize: 15, color: T.t1, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: p.popular ? T.a : T.bg4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: p.popular ? "#000" : T.a, fontSize: 10, fontWeight: 800 }}>✓</span>
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <PrimaryBtn
                onClick={onGetStarted}
                large
                style={{
                  width: "100%",
                  background: p.popular ? T.a : "transparent",
                  color: p.popular ? "#000" : T.t1,
                  border: `1px solid ${p.popular ? T.a : T.bdr}`,
                }}
              >
                Get Started
              </PrimaryBtn>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────── */
function Testimonials() {
  const reviews = [
    { n: "Rajesh Kulkarni", r: "TargetIIT Classes", t: "Before Exponent, I was chasing students for fees on WhatsApp. Now the system sends reminders automatically. Best investment I made for my academy.", c: "#4FA5FF" },
    { n: "Sunita Deshpande", r: "BrightFuture Coaching", t: "Setting up 3 branches used to be a nightmare. With Exponent, I manage all of them from one dashboard. The QR scanner saves my staff 30 minutes every day.", c: "#22C55E" }
  ];
  return (
    <section style={{ padding: "120px 6%", borderBottom: `1px solid ${T.bdr}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Label>Trusted by the best</Label>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800, color: T.t1, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 60 }}>
          Loved by 2,400+<br />institute owners
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ background: T.bg2, border: `1px solid ${T.bdr}`, padding: "40px", borderRadius: 16 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
                {[1,2,3,4,5].map(x => <span key={x} style={{ color: T.a, fontSize: 18 }}>★</span>)}
              </div>
              <p style={{ fontSize: 16, color: T.t2, lineHeight: 1.6, marginBottom: 32 }}>"{r.t}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: r.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700 }}>
                  {r.n[0]}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.t1 }}>{r.n}</div>
                  <div style={{ fontSize: 14, color: T.t3 }}>{r.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FINAL CTA
───────────────────────────────────────── */
function FinalCTA({ onGetStarted }) {
  return (
    <section style={{ padding: "120px 6%" }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        background: `linear-gradient(135deg, ${T.bg2} 0%, ${T.bg} 100%)`,
        border: `1px solid ${T.bdr}`,
        borderRadius: 24, padding: "80px 6%",
        textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        {/* Faint Glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, height: 300, background: T.aDark, filter: "blur(100px)", pointerEvents: "none", zIndex: 0 }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 800, color: T.t1, letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 24 }}>
            Ready to run your<br />institute smarter?
          </h2>
          <p style={{ fontSize: 18, color: T.t2, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            Join thousands of institutes making the switch. Drop your spreadsheets and bring operations into one platform.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <PrimaryBtn large onClick={onGetStarted}>Get Started Free</PrimaryBtn>
            <GhostBtn large href={`mailto:${OWNER_EMAIL}`}>Talk to sales</GhostBtn>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${T.bdr}`, padding: "80px 6% 40px", background: T.bg }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 60 }}>
        <div style={{ maxWidth: 300 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.t1, letterSpacing: "-0.5px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, background: T.a, borderRadius: 4, color: "#000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>E</div>
            ExponentGrow
          </div>
          <p style={{ fontSize: 14, color: T.t2, lineHeight: 1.6, marginBottom: 24 }}>
            The all-in-one operating system for coaching institutes, tuition centers, and academies in India.
          </p>
        </div>

        <div style={{ display: "flex", gap: 80, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.t1, marginBottom: 20 }}>Product</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {["Features", "Pricing", "Integrations", "Security"].map(l => (
                <a key={l} href="#" style={{ fontSize: 14, color: T.t2, textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.t1, marginBottom: 20 }}>Company</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {["About", "Customers", "Contact", "Privacy Policy", "Terms"].map(l => (
                <a key={l} href="#" style={{ fontSize: 14, color: T.t2, textDecoration: "none" }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "60px auto 0", borderTop: `1px solid ${T.bdr}`, paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: T.t3 }}>
        <div>© {new Date().getFullYear()} Exponent Platform. All rights reserved.</div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────── */
export default function Landing({ onLogin, onGetStarted }) {
  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      background: T.bg, color: T.t1,
      minHeight: "100vh",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    }}>
      <Navbar onGetStarted={onGetStarted} onLogin={onLogin} />
      <Hero onGetStarted={onGetStarted} />
      <Stats />
      <Features />
      <HowItWorks />
      <Pricing onGetStarted={onGetStarted} />
      <Testimonials />
      <FinalCTA onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}
