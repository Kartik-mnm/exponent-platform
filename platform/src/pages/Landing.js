import { useState, useEffect } from "react";

/* ─────────────────────────────────────────
   OWNER CONSTANTS  (unchanged)
───────────────────────────────────────── */
const OWNER_EMAIL    = "aspirantth@gmail.com";
const OWNER_PHONE    = "8956419453";
const OWNER_WHATSAPP = "918956419453";

/* ─────────────────────────────────────────
   DESIGN TOKENS  — refined dark slate palette
   Primary accent: electric indigo  #4F6EF7
   Secondary accent: warm ivory     #F0EDE8
   Base: deep charcoal              #0A0B0F
───────────────────────────────────────── */
const T = {
  /* backgrounds */
  bg:    "#0A0B0F",
  bg2:   "#0F1117",
  bg3:   "#151820",
  bg4:   "#1B1F2B",
  /* borders */
  bdr:   "#1E2235",
  bdr2:  "#252C42",
  /* text */
  t1:    "#F0EDE8",  /* warm ivory — not cold white */
  t2:    "#8A93B2",
  t3:    "#3D4560",
  /* accent: electric indigo */
  a:     "#4F6EF7",
  a2:    "#7A90FA",
  /* supporting tints */
  grn:   "#22C55E",
  grn2:  "#16A34A",
  yel:   "#EAB308",
  red:   "#EF4444",
  cyn:   "#22D3EE",
  pur:   "#A78BFA",
};

/* ─────────────────────────────────────────
   BUTTON COMPONENTS
───────────────────────────────────────── */

/* Primary — solid indigo, no gradient, micro-shadow */
const PrimaryBtn = ({ children, onClick, large, style: extra = {} }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: large ? "13px 28px" : "9px 20px",
        borderRadius: 8,
        fontWeight: 600, fontSize: large ? 15 : 13,
        letterSpacing: "0.01em",
        cursor: "pointer", border: "none",
        background: hov ? "#6680F8" : T.a,
        color: "#fff",
        boxShadow: hov
          ? `0 0 0 3px ${T.a}30, 0 6px 24px ${T.a}40`
          : `0 2px 12px ${T.a}30`,
        transform: hov ? "translateY(-1px)" : "none",
        transition: "all 0.18s ease",
        ...extra,
      }}
    >
      {children}
    </button>
  );
};

/* Ghost — hairline border, transparent */
const GhostBtn = ({ children, onClick, href }) => {
  const [hov, setHov] = useState(false);
  const s = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "9px 20px", borderRadius: 8,
    fontWeight: 600, fontSize: 13,
    letterSpacing: "0.01em",
    cursor: "pointer",
    background: hov ? T.bg3 : "transparent",
    color: hov ? T.t1 : T.t2,
    border: `1px solid ${hov ? T.bdr2 : T.bdr}`,
    textDecoration: "none",
    transition: "all 0.18s ease",
    transform: hov ? "translateY(-1px)" : "none",
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
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: "4px 13px", borderRadius: 20,
    background: `${T.a}12`, border: `1px solid ${T.a}28`,
    fontSize: 11, fontWeight: 700, color: T.a2,
    letterSpacing: "0.08em", textTransform: "uppercase",
    marginBottom: 18,
  }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: T.a2, display: "inline-block" }} />
    {children}
  </div>
);

/* Reusable section heading */
const SecHeading = ({ label, title, sub }) => (
  <div style={{ textAlign: "center", marginBottom: 64 }}>
    {label && <Label>{label}</Label>}
    <h2 style={{
      fontSize: "clamp(26px,3.5vw,40px)",
      fontWeight: 800, color: T.t1,
      letterSpacing: "-0.6px", lineHeight: 1.2,
      marginBottom: 14,
    }}>{title}</h2>
    {sub && (
      <p style={{ fontSize: 16, color: T.t2, maxWidth: 520, margin: "0 auto", lineHeight: 1.75 }}>{sub}</p>
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
    { label: "FAQ",          id: "faq"          },
  ];

  const handleLink = (id) => { setMobileOpen(false); scrollTo(id); };

  const navBg = scrolled || mobileOpen ? `${T.bg}F0` : "transparent";
  const navBorder = scrolled || mobileOpen ? `1px solid ${T.bdr}` : "1px solid transparent";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 6%", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: navBg,
        backdropFilter: scrolled || mobileOpen ? "blur(18px) saturate(1.2)" : "none",
        borderBottom: navBorder,
        transition: "all 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {logoUrl
            ? <img src={logoUrl} alt="Exponent" style={{ width: 30, height: 30, borderRadius: 7, objectFit: "contain" }} />
            : (
              <div style={{
                width: 30, height: 30, borderRadius: 7,
                background: T.a,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 900, fontSize: 13,
                boxShadow: `0 2px 10px ${T.a}50`,
              }}>E</div>
            )
          }
          <div>
            <div style={{
              fontSize: 13, fontWeight: 800, letterSpacing: "0.12em",
              color: T.t1,
            }}>EXPONENT</div>
            <div style={{ fontSize: 8.5, color: T.t3, letterSpacing: "0.14em", textTransform: "uppercase" }}>Academy OS</div>
          </div>
        </div>

        {/* Desktop nav links */}
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {navLinks.map(l => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              style={{
                fontSize: 13, color: T.t2, background: "none", border: "none",
                cursor: "pointer", fontWeight: 500, padding: 0,
                display: "var(--nav-link-display, inline-block)",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => e.target.style.color = T.t1}
              onMouseLeave={e => e.target.style.color = T.t2}
            >{l.label}</button>
          ))}
        </div>

        {/* CTA group */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={onLogin}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: T.t2, fontWeight: 500,
              display: typeof window !== "undefined" && window.innerWidth < 480 ? "none" : "block",
              transition: "color 0.15s",
            }}
            onMouseEnter={e => e.target.style.color = T.t1}
            onMouseLeave={e => e.target.style.color = T.t2}
          >Sign In</button>
          <PrimaryBtn onClick={onGetStarted}>Get Started →</PrimaryBtn>
          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
            style={{
              display: "none", background: "none",
              border: `1px solid ${T.bdr2}`, borderRadius: 7,
              cursor: "pointer", padding: "6px 9px", color: T.t2,
              fontSize: 16, lineHeight: 1,
            }}
            className="hamburger-btn"
          >{mobileOpen ? "✕" : "☰"}</button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 60, left: 0, right: 0, zIndex: 99,
          background: `${T.bg}F8`,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${T.bdr}`,
          padding: "20px 6% 28px",
          display: "flex", flexDirection: "column", gap: 4,
        }}>
          {navLinks.map(l => (
            <button
              key={l.id}
              onClick={() => handleLink(l.id)}
              style={{
                fontSize: 15, color: T.t1, background: "none", border: "none",
                cursor: "pointer", fontWeight: 600,
                padding: "14px 0", textAlign: "left",
                borderBottom: `1px solid ${T.bdr}`,
              }}
            >{l.label}</button>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexDirection: "column" }}>
            <button
              onClick={() => { setMobileOpen(false); onLogin(); }}
              style={{
                padding: "12px", borderRadius: 8,
                background: T.bg3, border: `1px solid ${T.bdr2}`,
                color: T.t1, fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}
            >Sign In</button>
            <button
              onClick={() => { setMobileOpen(false); onGetStarted(); }}
              style={{
                padding: "12px", borderRadius: 8,
                background: T.a, border: "none",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                boxShadow: `0 4px 18px ${T.a}40`,
              }}
            >Get Started Free →</button>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:768px){.hamburger-btn{display:block!important}:root{--nav-link-display:none}}
        @media(min-width:769px){.hamburger-btn{display:none!important}:root{--nav-link-display:inline-block}}
      `}</style>
    </>
  );
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function Hero({ onGetStarted }) {
  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      textAlign: "center",
      padding: "120px 6% 100px",
      position: "relative", overflow: "hidden",
      background: T.bg,
    }}>
      {/* Subtle top glow */}
      <div style={{
        position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)",
        width: 700, height: 400, borderRadius: "50%",
        background: `radial-gradient(ellipse at center, ${T.a}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Dot-grid texture */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `radial-gradient(${T.bdr}99 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(ellipse 75% 70% at 50% 40%, black 20%, transparent 90%)",
        WebkitMaskImage: "radial-gradient(ellipse 75% 70% at 50% 40%, black 20%, transparent 90%)",
        opacity: 0.6,
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 780, margin: "0 auto" }}>

        {/* Trust badge */}
        <div style={{ marginBottom: 32 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 15px", borderRadius: 20,
            background: `${T.grn}12`, border: `1px solid ${T.grn}28`,
            fontSize: 12, color: T.grn, fontWeight: 600, letterSpacing: "0.02em",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: T.grn, display: "inline-block",
              boxShadow: `0 0 0 3px ${T.grn}30`,
            }} />
            Trusted by coaching academies across India
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: "clamp(38px,6.5vw,72px)",
          fontWeight: 900, lineHeight: 1.08,
          letterSpacing: "-2px",
          color: T.t1,
          marginBottom: 24,
        }}>
          Run Your Academy<br />
          <span style={{
            color: T.a2,
            WebkitTextFillColor: T.a2,
          }}>Like a Pro —</span>{" "}
          <span style={{ color: T.t2, fontWeight: 700 }}>Not a Spreadsheet.</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontSize: 18, color: T.t2,
          maxWidth: 560, margin: "0 auto 44px",
          lineHeight: 1.75, fontWeight: 400,
        }}>
          Exponent is the all-in-one academy management software for coaching institutes.
          Manage students, fees, attendance, and parent notifications — all in one place.
        </p>

        {/* CTA buttons */}
        <div style={{
          display: "flex", gap: 12, justifyContent: "center",
          flexWrap: "wrap", marginBottom: 64,
        }}>
          <PrimaryBtn large onClick={onGetStarted}>Start Free Trial — 7 Days</PrimaryBtn>
          <GhostBtn onClick={() => scrollTo("how-it-works")}>▶ See How It Works</GhostBtn>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 0, justifyContent: "center",
          flexWrap: "wrap",
          borderTop: `1px solid ${T.bdr}`,
          paddingTop: 40,
        }}>
          {[
            { v: "40+",    l: "Academies"          },
            { v: "2,000+", l: "Students Managed"   },
            { v: "98%",    l: "Fee Collection Rate" },
            { v: "4.9★",   l: "Average Rating"     },
          ].map((s, i) => (
            <div key={s.l} style={{
              textAlign: "center",
              padding: "0 36px",
              borderRight: i < 3 ? `1px solid ${T.bdr}` : "none",
            }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: T.t1, letterSpacing: "-0.5px" }}>{s.v}</div>
              <div style={{ fontSize: 11, color: T.t3, marginTop: 4, letterSpacing: "0.03em" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   DASHBOARD PREVIEW
───────────────────────────────────────── */
function DashPreview() {
  const stats = [
    { l: "Active Students", v: "247",  c: T.a   },
    { l: "Fees Collected",  v: "₹1.8L", c: T.grn },
    { l: "Pending Dues",    v: "₹24K", c: T.yel  },
    { l: "Attendance",      v: "94%",  c: T.cyn  },
  ];
  const rows = [
    { n: "Priya Sharma",    b: "JEE Adv.", s: "paid",    d: "₹0"     },
    { n: "Rahul Deshmukh",  b: "NEET",    s: "pending",  d: "₹2,500" },
    { n: "Sneha Patil",     b: "Class 10", s: "paid",    d: "₹0"     },
    { n: "Arjun Verma",     b: "JEE Main", s: "partial", d: "₹1,200" },
    { n: "Kavya Singh",     b: "Foundation", s: "paid",  d: "₹0"     },
  ];
  const sc = { paid: T.grn, pending: T.red, partial: T.yel };

  return (
    <section style={{ padding: "0 6% 100px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{
          background: T.bg2,
          border: `1px solid ${T.bdr}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px ${T.bdr}`,
        }}>
          {/* Window chrome */}
          <div style={{
            background: T.bg3, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 6,
            borderBottom: `1px solid ${T.bdr}`,
          }}>
            {["#FF5F56","#FEBC2E","#28C840"].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            ))}
            <div style={{
              flex: 1, background: T.bg, borderRadius: 5,
              padding: "4px 10px", fontSize: 10.5, color: T.t3, marginLeft: 8,
            }}>app.exponentgrow.in/dashboard</div>
          </div>

          <div style={{ display: "flex", minHeight: 340 }}>
            {/* Sidebar */}
            <div style={{
              width: 170, background: T.bg,
              borderRight: `1px solid ${T.bdr}`,
              padding: "14px 8px", flexShrink: 0,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 800, color: T.a,
                letterSpacing: "0.14em", padding: "3px 8px", marginBottom: 10,
              }}>EXPONENT</div>
              {["Dashboard","Students","Payments","Attendance","Reports"].map((item, i) => (
                <div key={item} style={{
                  padding: "7px 10px", borderRadius: 6,
                  fontSize: 12, marginBottom: 2,
                  color: i === 0 ? T.a2 : T.t3,
                  background: i === 0 ? `${T.a}14` : "transparent",
                  fontWeight: i === 0 ? 600 : 400,
                  borderLeft: i === 0 ? `2px solid ${T.a}` : "2px solid transparent",
                }}>{item}</div>
              ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: 18, overflow: "hidden" }}>
              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
                {stats.map(s => (
                  <div key={s.l} style={{
                    background: T.bg3, borderRadius: 9,
                    padding: "11px 13px",
                    border: `1px solid ${T.bdr}`,
                    borderTop: `2px solid ${s.c}`,
                  }}>
                    <div style={{ fontSize: 9, color: T.t3, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.l}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <div style={{
                background: T.bg3, borderRadius: 9,
                border: `1px solid ${T.bdr}`, overflow: "hidden",
              }}>
                <div style={{
                  padding: "9px 13px",
                  borderBottom: `1px solid ${T.bdr}`,
                  fontSize: 10.5, fontWeight: 700, color: T.t2,
                }}>Recent Students</div>
                {rows.map(r => (
                  <div key={r.n} style={{
                    display: "flex", alignItems: "center",
                    padding: "8px 13px",
                    borderBottom: `1px solid ${T.bdr}80`,
                    gap: 10,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      background: T.a, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: "#fff", fontWeight: 700, flexShrink: 0,
                    }}>{r.n[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: T.t1 }}>{r.n}</div>
                      <div style={{ fontSize: 10, color: T.t3 }}>{r.b}</div>
                    </div>
                    <span style={{
                      fontSize: 10, padding: "2px 7px", borderRadius: 10,
                      background: `${sc[r.s]}18`, color: sc[r.s], fontWeight: 600,
                    }}>{r.s}</span>
                    <div style={{
                      fontSize: 11, color: r.d === "₹0" ? T.grn : T.red,
                      fontWeight: 700, minWidth: 42, textAlign: "right",
                    }}>{r.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TRUSTED BY
───────────────────────────────────────── */
function TrustedBy() {
  return (
    <section style={{
      padding: "44px 6%",
      borderTop: `1px solid ${T.bdr}`,
      borderBottom: `1px solid ${T.bdr}`,
    }}>
      <p style={{
        textAlign: "center", fontSize: 11, color: T.t3,
        marginBottom: 22, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.12em",
      }}>Trusted by coaching academies across India</p>
      <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
        {["Nishchay Academy","BrightFuture Coaching","TargetIIT Classes","Gurukul Institute","Rise Academy","NextGen Tutorials"].map(a => (
          <div key={a} style={{
            fontSize: 13, fontWeight: 700, color: T.t3,
            letterSpacing: "0.01em",
          }}>{a}</div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FEATURES
───────────────────────────────────────── */
const FEATS = [
  { icon: "👤", color: T.a,   title: "Smart Student Management",  desc: "Add, edit, and track every student. Batch assignments, roll numbers, photo ID cards, and QR attendance — all from one place.",     pts: ["Student profiles with photos","Batch & branch assignment","QR code ID cards","Parent contact info"] },
  { icon: "💳", color: T.grn, title: "Automated Fee Collection",   desc: "Generate fee records, track dues, and print professional receipts instantly.",                                                          pts: ["Monthly fee records","Partial payment tracking","Printable receipts","Outstanding dues dashboard"] },
  { icon: "✅", color: T.cyn, title: "One-tap Attendance",         desc: "Mark attendance in seconds with QR scanner, bulk marking, and auto parent alerts.",                                                       pts: ["QR-based scanning","Bulk attendance marking","Absent alerts to parents","Monthly attendance reports"] },
  { icon: "🔔", color: T.pur, title: "Parent Notifications",       desc: "Instantly notify parents about fees, attendance, and test results via push notifications.",                                               pts: ["Fee due reminders","Absent day alerts","Exam result sharing","Custom announcements"] },
  { icon: "📊", color: T.yel, title: "Reports & Analytics",        desc: "Get a full view of your academy's financial health, attendance trends, and performance.",                                                  pts: ["Revenue reports","Attendance analytics","Branch performance","Monthly summaries"] },
  { icon: "🏫", color: T.red, title: "Multi-branch Ready",         desc: "Manage multiple branches, assign staff, and track all performance from one login.",                                                       pts: ["Unlimited branches","Branch-wise reports","Staff role management","Centralized billing"] },
];

function Features() {
  const [hov, setHov] = useState(null);
  return (
    <section id="features" style={{ padding: "110px 6%" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <SecHeading
          label="Features"
          title="Built for academies that want to grow, not just survive."
          sub="Everything your coaching institute needs to run professionally, without the chaos."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 1 }}>
          {FEATS.map((f, i) => (
            <div
              key={f.title}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              style={{
                background: hov === i ? T.bg3 : T.bg2,
                border: `1px solid ${hov === i ? T.bdr2 : T.bdr}`,
                borderRadius: 0,
                padding: "32px 28px",
                transition: "all 0.22s ease",
                cursor: "default",
                /* create seamless grid using outlines + overlap trick */
                margin: "-0.5px",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                fontSize: 20,
                background: `${f.color}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 18,
                border: `1px solid ${f.color}20`,
                transition: "background 0.2s",
              }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: T.t1, marginBottom: 9 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: T.t2, lineHeight: 1.72, marginBottom: 18 }}>{f.desc}</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7 }}>
                {f.pts.map(b => (
                  <li key={b} style={{ fontSize: 12.5, color: T.t2, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: f.color, fontSize: 10, fontWeight: 700 }}>✓</span> {b}
                  </li>
                ))}
              </ul>
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
const STEPS = [
  { num: "01", icon: "🔐", color: T.a,   title: "Create Your Academy Account", desc: "Sign up in under 2 minutes. Add your academy name, logo, branches, and staff. No technical setup needed." },
  { num: "02", icon: "👤", color: T.grn, title: "Add Students & Batches",        desc: "Import your student list or add them one by one. Assign to batches, generate roll numbers, and print ID cards." },
  { num: "03", icon: "💳", color: T.pur, title: "Set Up Fee Structures",          desc: "Define monthly fees per batch. The system auto-generates fee records every month and tracks who has paid." },
  { num: "04", icon: "🚀", color: T.yel, title: "Operate & Grow",                 desc: "Mark attendance, send notifications, collect payments, and view reports. Your academy runs on autopilot." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{
      padding: "110px 6%",
      background: T.bg2,
      borderTop: `1px solid ${T.bdr}`,
      borderBottom: `1px solid ${T.bdr}`,
    }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <SecHeading
          label="How It Works"
          title="Set up in 4 simple steps."
          sub="From zero to a fully-managed academy in one afternoon."
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{
              display: "flex", gap: 28, alignItems: "flex-start",
              position: "relative",
              paddingBottom: i < STEPS.length - 1 ? 48 : 0,
            }}>
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div style={{
                  position: "absolute", left: 21, top: 50,
                  width: 1, height: "calc(100% - 50px)",
                  background: `linear-gradient(${T.bdr2}, transparent)`,
                }} />
              )}
              {/* Step number circle */}
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: `${s.color}12`,
                border: `1.5px solid ${s.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 10.5, color: s.color, fontWeight: 700, marginBottom: 5, letterSpacing: "0.1em" }}>
                  STEP {s.num}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: T.t1, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: T.t2, lineHeight: 1.72 }}>{s.desc}</p>
              </div>
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
  { id: "basic",      name: "Starter",    price: 499,  color: T.t2,  popular: false, desc: "Perfect for small academies just getting started.",           cta: "Start Free Trial", pts: ["Up to 100 students","1 branch","Fee management","Basic attendance","Email support","Student ID cards"] },
  { id: "pro",        name: "Pro",         price: 999,  color: T.a2,  popular: true,  desc: "For growing academies that need more power.",                 cta: "Start Free Trial", pts: ["Up to 500 students","Up to 5 branches","Fee + Payment tracking","QR attendance scanner","Parent notifications","Reports & Analytics","Priority support"] },
  { id: "enterprise", name: "Enterprise",  price: 1999, color: T.yel, popular: false, desc: "For large institutes with multiple centres.",                 cta: "Contact Us",       pts: ["Unlimited students","Unlimited branches","Everything in Pro","Custom branding","Multi-admin access","Dedicated onboarding","Phone + WhatsApp support"] },
];

function Pricing({ onGetStarted }) {
  const [annual, setAnnual] = useState(false);
  return (
    <section id="pricing" style={{ padding: "110px 6%" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <SecHeading
          label="Pricing"
          title="Plans that grow with your academy."
          sub="Simple, transparent pricing. No hidden charges. Cancel anytime."
        />

        {/* Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 56 }}>
          <span style={{ fontSize: 13.5, color: !annual ? T.t1 : T.t3, fontWeight: 600 }}>Monthly</span>
          <div
            onClick={() => setAnnual(!annual)}
            style={{
              width: 44, height: 24, borderRadius: 12,
              background: annual ? T.a : T.bdr2,
              cursor: "pointer", position: "relative", transition: "background 0.2s",
            }}
          >
            <div style={{
              position: "absolute", top: 3, left: annual ? 22 : 3,
              width: 18, height: 18, borderRadius: "50%",
              background: "#fff", transition: "left 0.2s",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }} />
          </div>
          <span style={{ fontSize: 13.5, color: annual ? T.t1 : T.t3, fontWeight: 600 }}>
            Annual{" "}
            <span style={{
              marginLeft: 6, fontSize: 10.5, color: T.grn,
              background: `${T.grn}14`, padding: "2px 8px",
              borderRadius: 10, fontWeight: 700,
            }}>Save 20%</span>
          </span>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(285px,1fr))", gap: 12, alignItems: "start" }}>
          {PLANS.map(p => (
            <div key={p.id} style={{
              background: p.popular ? T.bg3 : T.bg2,
              border: `1px solid ${p.popular ? T.a + "60" : T.bdr}`,
              borderRadius: 14, padding: 32,
              position: "relative",
              boxShadow: p.popular ? `0 0 0 1px ${T.a}30, 0 24px 60px ${T.a}14` : "none",
              transform: p.popular ? "scale(1.02)" : "none",
            }}>
              {p.popular && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  background: T.a, color: "#fff",
                  fontSize: 10, fontWeight: 800, padding: "4px 16px",
                  borderRadius: 20, whiteSpace: "nowrap", letterSpacing: "0.06em",
                }}>MOST POPULAR</div>
              )}
              <div style={{
                fontSize: 11.5, fontWeight: 800, color: p.color,
                marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em",
              }}>{p.name}</div>
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 38, fontWeight: 900, color: T.t1, letterSpacing: "-1px" }}>
                  ₹{Math.round(p.price * (annual ? 0.8 : 1))}
                </span>
                <span style={{ fontSize: 13, color: T.t3 }}>/{annual ? "mo (billed yearly)" : "month"}</span>
              </div>
              <p style={{ fontSize: 13.5, color: T.t2, marginBottom: 24, lineHeight: 1.65 }}>{p.desc}</p>

              {p.id === "enterprise"
                ? (
                  <a
                    href={`mailto:${OWNER_EMAIL}?subject=Enterprise Plan Inquiry`}
                    style={{
                      display: "block", width: "100%", padding: "11px",
                      borderRadius: 8, fontWeight: 700, fontSize: 13.5,
                      cursor: "pointer", marginBottom: 24,
                      background: T.bg4, color: T.t1,
                      textAlign: "center", textDecoration: "none",
                      border: `1px solid ${T.bdr2}`,
                      boxSizing: "border-box",
                    }}
                  >Contact Us →</a>
                )
                : (
                  <button
                    onClick={onGetStarted}
                    style={{
                      width: "100%", padding: "11px", borderRadius: 8,
                      fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                      border: p.popular ? "none" : `1px solid ${T.bdr2}`,
                      marginBottom: 24,
                      background: p.popular ? T.a : T.bg4,
                      color: p.popular ? "#fff" : T.t1,
                      boxShadow: p.popular ? `0 4px 20px ${T.a}40` : "none",
                      transition: "opacity 0.15s",
                    }}
                  >{p.cta} →</button>
                )
              }

              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {p.pts.map(f => (
                  <li key={f} style={{ fontSize: 13, color: T.t2, display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ color: p.color, fontSize: 12, flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p style={{
          textAlign: "center", fontSize: 12.5, color: T.t3, marginTop: 28,
        }}>
          All plans include a <strong style={{ color: T.t2 }}>7-day free trial</strong>. No credit card required.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────── */
const TESTI = [
  { n: "Rajesh Kulkarni",   r: "Director, TargetIIT Classes, Nagpur",       a: "R", c: T.a,   t: "Before Exponent, I was chasing students for fees on WhatsApp. Now the system sends reminders automatically and I can see every pending due from my phone. Best investment I made for my academy." },
  { n: "Sunita Deshpande",  r: "Owner, BrightFuture Coaching, Pune",         a: "S", c: T.grn, t: "Setting up 3 branches used to be a nightmare. With Exponent, I manage all of them from one dashboard. The QR scanner alone saves my staff 30 minutes every single day." },
  { n: "Amit Sharma",       r: "Founder, Rise Academy, Mumbai",              a: "A", c: T.pur, t: "The parent notification feature is a game-changer. Parents love getting real-time updates. My renewal rate jumped to 94% this year." },
  { n: "Priya Naik",        r: "Administrator, Gurukul Institute, Nashik",   a: "P", c: T.yel, t: "We switched from Excel to Exponent and never looked back. The reports are beautiful and the fee receipts print professionally. Parents are impressed." },
];

function Testimonials() {
  return (
    <section style={{
      padding: "110px 6%",
      background: T.bg2,
      borderTop: `1px solid ${T.bdr}`,
      borderBottom: `1px solid ${T.bdr}`,
    }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <SecHeading
          label="Testimonials"
          title="Loved by academy owners across India."
          sub="Don't take our word for it. Here's what academy owners say."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {TESTI.map(t => (
            <div key={t.n} style={{
              background: T.bg3,
              border: `1px solid ${T.bdr}`,
              borderRadius: 12, padding: 28,
            }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color: T.yel, fontSize: 13 }}>★</span>
                ))}
              </div>
              <p style={{
                fontSize: 14, color: T.t2, lineHeight: 1.8,
                marginBottom: 22, fontStyle: "italic",
              }}>"{t.t}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  background: `${t.c}18`, border: `1.5px solid ${t.c}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 15, color: t.c,
                }}>{t.a}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.t1 }}>{t.n}</div>
                  <div style={{ fontSize: 11, color: T.t3 }}>{t.r}</div>
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
   FOUNDER STORY
───────────────────────────────────────── */
function FounderStory() {
  return (
    <section id="about" style={{ padding: "100px 6%" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: T.a, margin: "0 auto 20px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, fontWeight: 900, color: "#fff",
          boxShadow: `0 4px 24px ${T.a}40`,
        }}>K</div>
        <div style={{ fontSize: 10.5, color: T.t3, marginBottom: 6, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
          From the Founder
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 800, color: T.t1, marginBottom: 20 }}>Why I built Exponent</h3>
        <p style={{ fontSize: 15.5, color: T.t2, lineHeight: 1.9, marginBottom: 28 }}>
          "I saw my family's coaching academy drowning in paperwork — fee registers, attendance notebooks, parent calls, WhatsApp reminders.
          It was chaos. I built Exponent to fix exactly that. After 2 years and 40+ academies using it, I know we're on the right track.
          We're not a big Silicon Valley startup. We're a small team that genuinely understands what coaching academy owners go through every day."
        </p>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.t1 }}>Kartik Ninawe</div>
        <div style={{ fontSize: 12, color: T.t3, marginBottom: 20 }}>Founder, Exponent Platform</div>
        <div style={{ marginTop: 16, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={`mailto:${OWNER_EMAIL}`} style={{
            fontSize: 12.5, color: T.t2, textDecoration: "none",
            padding: "7px 16px", background: T.bg2, borderRadius: 7,
            border: `1px solid ${T.bdr2}`,
          }}>✉ {OWNER_EMAIL}</a>
          <a href={`https://wa.me/${OWNER_WHATSAPP}`} target="_blank" rel="noreferrer" style={{
            fontSize: 12.5, color: T.grn, textDecoration: "none",
            padding: "7px 16px", background: T.bg2, borderRadius: 7,
            border: `1px solid ${T.bdr2}`,
          }}>WhatsApp: {OWNER_PHONE}</a>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   SECURITY
───────────────────────────────────────── */
function Security() {
  const items = [
    { i: "🔒", t: "Bank-grade Security",     d: "AES-256 encryption at rest, TLS in transit. Your data is always protected." },
    { i: "🇮🇳", t: "Made in India",           d: "Built for Indian coaching institutes. GST-ready, INR pricing, Hindi support coming." },
    { i: "☁️", t: "99.9% Uptime",            d: "Enterprise-grade hosting. Automatic backups every 6 hours. Your data never disappears." },
    { i: "🔵", t: "Your Data, Your Control", d: "You own 100% of your data. Export anytime. We never share student data." },
  ];
  return (
    <section id="security" style={{
      padding: "100px 6%",
      background: T.bg2,
      borderTop: `1px solid ${T.bdr}`,
      borderBottom: `1px solid ${T.bdr}`,
    }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <SecHeading
          label="Security & Privacy"
          title="Your data is safe with us."
          sub="We take the security of your academy's data as seriously as you do."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
          {items.map(x => (
            <div key={x.t} style={{
              background: T.bg3, border: `1px solid ${T.bdr}`,
              borderRadius: 12, padding: 26,
            }}>
              <div style={{ fontSize: 26, marginBottom: 14 }}>{x.i}</div>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: T.t1, marginBottom: 8 }}>{x.t}</div>
              <div style={{ fontSize: 13, color: T.t2, lineHeight: 1.7 }}>{x.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FAQ
───────────────────────────────────────── */
const FAQS = [
  { q: "Is there a free trial?",               a: "Yes! Every plan starts with a 7-day free trial. No credit card required." },
  { q: "Can I manage multiple branches?",       a: "Absolutely. The Pro and Enterprise plans support multiple branches with their own staff, students, and reports." },
  { q: "How do parent notifications work?",     a: "Parents receive push notifications. You send attendance alerts, fee reminders, and announcements with one click." },
  { q: "Can I export my data?",                 a: "Yes. Export student lists, fee reports, and attendance records in PDF or Excel at any time." },
  { q: "What payment methods do you accept?",   a: "UPI, debit/credit cards, net banking, and bank transfers. All payments processed securely." },
  { q: "Do I need technical knowledge?",        a: "Not at all. Designed for non-technical academy owners. Setup takes less than an hour." },
  { q: "Can I cancel anytime?",                 a: "Yes. No lock-ins, no cancellation fees. Cancel from your dashboard anytime." },
  { q: "Is my student data private?",           a: "100% yes. Encrypted, stored securely, never shared with third parties. You own your data." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" style={{ padding: "110px 6%" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <SecHeading
          label="FAQ"
          title="Frequently Asked Questions."
          sub="Everything you need to know before getting started."
        />
        {FAQS.map((f, i) => (
          <div
            key={i}
            onClick={() => setOpen(open === i ? null : i)}
            style={{ borderBottom: `1px solid ${T.bdr}`, cursor: "pointer" }}
          >
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "18px 0",
            }}>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: open === i ? T.t1 : T.t2 }}>{f.q}</span>
              <span style={{
                color: T.a2, fontSize: 18, fontWeight: 300, lineHeight: 1,
                transform: open === i ? "rotate(45deg)" : "none",
                transition: "transform 0.2s",
                flexShrink: 0, marginLeft: 12,
              }}>+</span>
            </div>
            {open === i && (
              <div style={{
                fontSize: 13.5, color: T.t2, lineHeight: 1.8, paddingBottom: 18,
              }}>{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FINAL CTA
───────────────────────────────────────── */
function FinalCTA({ onGetStarted }) {
  return (
    <section style={{
      padding: "110px 6%",
      textAlign: "center",
      background: T.bg2,
      borderTop: `1px solid ${T.bdr}`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Faint center glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 300, borderRadius: "50%",
        background: `radial-gradient(ellipse at center, ${T.a}10 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{ maxWidth: 620, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <h2 style={{
          fontSize: "clamp(28px,4vw,48px)",
          fontWeight: 900, color: T.t1,
          lineHeight: 1.18, letterSpacing: "-1px", marginBottom: 16,
        }}>Ready to transform your academy?</h2>
        <p style={{
          fontSize: 16, color: T.t2, lineHeight: 1.75, marginBottom: 40,
        }}>
          Join coaching institutes already running smarter with Exponent.
          Start your free 7-day trial — no credit card needed.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <PrimaryBtn large onClick={onGetStarted}>Start Free Trial — 7 Days</PrimaryBtn>
          <GhostBtn href={`mailto:${OWNER_EMAIL}`}>Talk to Us</GhostBtn>
        </div>
        <p style={{ marginTop: 22, fontSize: 12, color: T.t3 }}>
          No credit card · Setup in under 1 hour · Cancel anytime
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
const FOOTER_LINKS = {
  Product: [
    { label: "Features",     action: "scroll", id: "features"     },
    { label: "Pricing",      action: "scroll", id: "pricing"      },
    { label: "How It Works", action: "scroll", id: "how-it-works" },
    { label: "FAQ",          action: "scroll", id: "faq"          },
  ],
  Company: [
    { label: "About",            action: "scroll", id: "about" },
    { label: "Founder Story",    action: "scroll", id: "about" },
    { label: "Privacy Policy",   action: "href",   href: "/privacy" },
    { label: "Terms of Service", action: "href",   href: "/terms"   },
    { label: "Contact",          action: "href",   href: "/contact" },
  ],
  Support: [
    { label: "Help Center",      action: "href", href: `mailto:${OWNER_EMAIL}?subject=Help`                                         },
    { label: "Contact Us",       action: "href", href: `mailto:${OWNER_EMAIL}`                                                      },
    { label: "WhatsApp Support", action: "href", href: `https://wa.me/${OWNER_WHATSAPP}?text=Hi%2C+I+need+help+with+Exponent`       },
    { label: "Request Demo",     action: "href", href: `mailto:${OWNER_EMAIL}?subject=Demo Request`                                  },
  ],
};

function Footer() {
  const year = new Date().getFullYear();
  const linkStyle = {
    fontSize: 13, color: T.t3, textDecoration: "none",
    cursor: "pointer", background: "none", border: "none",
    padding: 0, fontFamily: "inherit", transition: "color 0.15s",
  };
  const renderLink = (l) => {
    if (l.action === "scroll") return (
      <button
        key={l.label}
        onClick={() => scrollTo(l.id)}
        style={linkStyle}
        onMouseEnter={e => e.target.style.color = T.t2}
        onMouseLeave={e => e.target.style.color = T.t3}
      >{l.label}</button>
    );
    const isMailto = l.href?.startsWith("mailto:");
    return (
      <a
        key={l.label}
        href={l.href}
        target={isMailto ? "_self" : "_blank"}
        rel={isMailto ? undefined : "noopener noreferrer"}
        style={linkStyle}
        onMouseEnter={e => e.target.style.color = T.t2}
        onMouseLeave={e => e.target.style.color = T.t3}
      >{l.label}</a>
    );
  };

  return (
    <footer style={{
      padding: "56px 6% 36px",
      borderTop: `1px solid ${T.bdr}`,
      background: T.bg,
    }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", flexWrap: "wrap",
          gap: 40, marginBottom: 48,
        }}>
          {/* Brand */}
          <div style={{ maxWidth: 240 }}>
            <div style={{
              fontSize: 16, fontWeight: 900, letterSpacing: "0.12em",
              color: T.t1, marginBottom: 10,
            }}>EXPONENT</div>
            <p style={{ fontSize: 13, color: T.t3, lineHeight: 1.75 }}>
              The all-in-one academy management platform for coaching institutes across India.
            </p>
            <div style={{ marginTop: 14, fontSize: 12, color: T.t3, lineHeight: 1.9 }}>
              <div>✉ {OWNER_EMAIL}</div>
              <div>☎ {OWNER_PHONE}</div>
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: T.t3,
                textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16,
              }}>{title}</div>
              {links.map(l => (
                <div key={l.label} style={{ marginBottom: 11 }}>{renderLink(l)}</div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: `1px solid ${T.bdr}`,
          paddingTop: 24,
          display: "flex", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12,
          alignItems: "center",
        }}>
          <div style={{ fontSize: 12, color: T.t3 }}>
            © {year} Exponent Platform. All rights reserved. Made with ❤ in India.
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Privacy Policy",   href: "/privacy" },
              { label: "Terms of Service", href: "/terms"   },
              { label: "Contact",          href: "/contact" },
            ].map(l => (
              <a
                key={l.label}
                href={l.href}
                style={{ fontSize: 12, color: T.t3, textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = T.t2}
                onMouseLeave={e => e.target.style.color = T.t3}
              >{l.label}</a>
            ))}
            <button
              onClick={() => scrollTo("security")}
              style={{ fontSize: 12, color: T.t3, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
            >Security</button>
          </div>
        </div>
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
      /* Apply body font styling again here to make sure it loads correctly even if styled-components isn't set up */
      fontFamily: "'Inter','Satoshi',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      background: T.bg, color: T.t1,
      minHeight: "100vh",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    }}>
      <Navbar onGetStarted={onGetStarted} onLogin={onLogin} />
      <Hero onGetStarted={onGetStarted} />
      <DashPreview />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Pricing onGetStarted={onGetStarted} />
      <Testimonials />
      <FounderStory />
      <Security />
      <FAQ />
      <FinalCTA onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
}
