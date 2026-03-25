import { useState, useEffect } from "react";

// ──────────────────────────────────────────────────────────────────────
const COLORS = {
  bg:        "#07090f",
  bg2:       "#0d1117",
  bg3:       "#131720",
  border:    "#1e2535",
  border2:   "#28304a",
  text1:     "#eef1fb",
  text2:     "#8892b5",
  text3:     "#454f72",
  accent:    "#6366f1",
  accent2:   "#818cf8",
  green:     "#10b981",
  yellow:    "#f59e0b",
  red:       "#ef4444",
  purple:    "#a855f7",
  cyan:      "#06b6d4",
};

// ── Reusable styled components ──────────────────────────────────────────────────
const Badge = ({ children, color = COLORS.accent }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700,
    background: `${color}18`, color, border: `1px solid ${color}33`,
    letterSpacing: "0.04em",
  }}>
    <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
    {children}
  </span>
);

const Btn = ({ children, primary, large, onClick, href, style = {} }) => {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: large ? "14px 32px" : "10px 22px",
    borderRadius: 10, fontWeight: 700,
    fontSize: large ? 15 : 14,
    cursor: "pointer", transition: "all 0.2s",
    textDecoration: "none", border: "none",
    ...style,
  };
  const s = primary
    ? { ...base, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`, color: "#fff", boxShadow: `0 8px 32px ${COLORS.accent}44` }
    : { ...base, background: "transparent", color: COLORS.text2, border: `1px solid ${COLORS.border2}` };
  if (href) return <a href={href} style={s}>{children}</a>;
  return <button style={s} onClick={onClick}>{children}</button>;
};

const SectionLabel = ({ children }) => (
  <div style={{ textAlign: "center", marginBottom: 12 }}>
    <Badge color={COLORS.accent}>{children}</Badge>
  </div>
);

const SectionHeading = ({ children, sub }) => (
  <div style={{ textAlign: "center", marginBottom: 48 }}>
    <h2 style={{ fontSize: 36, fontWeight: 800, color: COLORS.text1, letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 14 }}>{children}</h2>
    {sub && <p style={{ fontSize: 17, color: COLORS.text2, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>{sub}</p>}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: COLORS.bg2,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16, padding: 28,
    transition: "border-color 0.2s, transform 0.2s",
    ...style,
  }}>
    {children}
  </div>
);

// ── NAVBAR ────────────────────────────────────────────────────────────────────────────────
function Navbar({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "0 5%",
      height: 64,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: scrolled ? `${COLORS.bg}ee` : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? `1px solid ${COLORS.border}` : "1px solid transparent",
      transition: "all 0.3s",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 900, fontSize: 15,
          boxShadow: `0 4px 14px ${COLORS.accent}55`,
        }}>E</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.06em",
            background: `linear-gradient(135deg, ${COLORS.accent2}, ${COLORS.purple})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>EXPONENT</div>
          <div style={{ fontSize: 9, color: COLORS.text3, letterSpacing: "0.1em", textTransform: "uppercase" }}>Academy OS</div>
        </div>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {["Features", "Pricing", "How It Works", "FAQ"].map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
            style={{ fontSize: 13, color: COLORS.text2, textDecoration: "none", fontWeight: 500,
              transition: "color 0.15s" }}
            onMouseEnter={e => e.target.style.color = COLORS.text1}
            onMouseLeave={e => e.target.style.color = COLORS.text2}>{l}</a>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={onLogin} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: COLORS.text2, fontWeight: 500 }}>Sign In</button>
        <Btn primary onClick={onLogin} style={{ padding: "8px 20px", fontSize: 13 }}>Get Started Free →</Btn>
      </div>
    </nav>
  );
}

// ── HERO ────────────────────────────────────────────────────────────────────────────────
function Hero({ onLogin }) {
  return (
    <section style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", textAlign: "center",
      padding: "120px 5% 80px",
      background: `radial-gradient(ellipse 80% 60% at 50% -20%, ${COLORS.accent}18 0%, transparent 70%)`,
      position: "relative", overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(${COLORS.border}44 1px, transparent 1px), linear-gradient(90deg, ${COLORS.border}44 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
        {/* Trust pill */}
        <div style={{ marginBottom: 28 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 20,
            background: `${COLORS.green}14`, border: `1px solid ${COLORS.green}33`,
            fontSize: 12, color: COLORS.green, fontWeight: 600,
          }}>
            ✨ Trusted by 40+ academies across India
          </span>
        </div>

        {/* Main headline */}
        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 900, lineHeight: 1.1,
          letterSpacing: "-1.5px",
          color: COLORS.text1,
          marginBottom: 20,
        }}>
          Run Your Academy
          <br />
          <span style={{
            background: `linear-gradient(135deg, ${COLORS.accent2}, ${COLORS.purple})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Like a Pro — Not a Spreadsheet.</span>
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: 19, color: COLORS.text2, maxWidth: 580,
          margin: "0 auto 40px", lineHeight: 1.7,
        }}>
          Exponent is the all-in-one academy management software for coaching institutes.
          Manage students, fees, attendance, and parent notifications — all in one place.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
          <Btn primary large onClick={onLogin}>🚀 Start Free Trial — 14 Days</Btn>
          <Btn large href="#how-it-works">▶ Watch How It Works</Btn>
        </div>

        {/* Social proof numbers */}
        <div style={{
          display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap",
          paddingTop: 40, borderTop: `1px solid ${COLORS.border}`,
        }}>
          {[
            { value: "40+",  label: "Academies",       icon: "🏫" },
            { value: "2,000+", label: "Students Managed", icon: "🎓" },
            { value: "98%",  label: "Fee Collection Rate", icon: "💰" },
            { value: "4.9★",  label: "Average Rating",  icon: "⭐" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text1 }}>{s.icon} {s.value}</div>
              <div style={{ fontSize: 12, color: COLORS.text3, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── DASHBOARD PREVIEW ────────────────────────────────────────────────────────────
function DashPreview() {
  const stats = [
    { label: "Active Students", value: "247", color: COLORS.accent, icon: "🎓" },
    { label: "Fees Collected",  value: "₹1.8L", color: COLORS.green, icon: "💰" },
    { label: "Pending Dues",   value: "₹24K",  color: COLORS.yellow, icon: "⚠️" },
    { label: "Attendance Today",value: "94%",   color: COLORS.cyan,   icon: "✅" },
  ];
  const students = [
    { name: "Priya Sharma",    batch: "JEE Adv.",    status: "paid",    due: "₹0" },
    { name: "Rahul Deshmukh",  batch: "NEET",        status: "pending", due: "₹2,500" },
    { name: "Sneha Patil",     batch: "Class 10",    status: "paid",    due: "₹0" },
    { name: "Arjun Verma",     batch: "JEE Main",    status: "partial", due: "₹1,200" },
    { name: "Kavya Singh",     batch: "Foundation",  status: "paid",    due: "₹0" },
  ];
  const statusColor = { paid: COLORS.green, pending: COLORS.red, partial: COLORS.yellow };

  return (
    <section style={{ padding: "0 5% 80px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          background: COLORS.bg2, border: `1px solid ${COLORS.border}`,
          borderRadius: 20, overflow: "hidden",
          boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px ${COLORS.border}`,
        }}>
          {/* Browser chrome */}
          <div style={{ background: COLORS.bg3, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${COLORS.border}` }}>
            {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
            <div style={{ flex: 1, background: COLORS.bg, borderRadius: 6, padding: "5px 12px", fontSize: 11, color: COLORS.text3, marginLeft: 8 }}>app.exponent.academy/dashboard</div>
          </div>

          {/* Dashboard content */}
          <div style={{ display: "flex", minHeight: 360 }}>
            {/* Sidebar */}
            <div style={{ width: 180, background: COLORS.bg, borderRight: `1px solid ${COLORS.border}`, padding: "16px 10px", flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.accent, letterSpacing: "0.1em", padding: "4px 8px", marginBottom: 8 }}>EXPONENT</div>
              {["🔵 Dashboard","👤 Students","💳 Payments","✅ Attendance","📊 Reports"].map((item, i) => (
                <div key={item} style={{
                  padding: "7px 10px", borderRadius: 7, fontSize: 12,
                  color: i === 0 ? COLORS.accent : COLORS.text3,
                  background: i === 0 ? `${COLORS.accent}14` : "transparent",
                  marginBottom: 2, fontWeight: i === 0 ? 600 : 400,
                }}>{item}</div>
              ))}
            </div>

            {/* Main content */}
            <div style={{ flex: 1, padding: 20, overflow: "hidden" }}>
              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                {stats.map(s => (
                  <div key={s.label} style={{
                    background: COLORS.bg3, borderRadius: 10, padding: "12px 14px",
                    border: `1px solid ${COLORS.border}`, borderTop: `2px solid ${s.color}`,
                  }}>
                    <div style={{ fontSize: 9, color: COLORS.text3, fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.icon} {s.value}</div>
                  </div>
                ))}
              </div>

              {/* Student table */}
              <div style={{ background: COLORS.bg3, borderRadius: 10, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: `1px solid ${COLORS.border}`, fontSize: 11, fontWeight: 700, color: COLORS.text2 }}>Recent Students</div>
                {students.map(s => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", padding: "8px 14px", borderBottom: `1px solid ${COLORS.border}88`, gap: 12 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: COLORS.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{s.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text1 }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: COLORS.text3 }}>{s.batch}</div>
                    </div>
                    <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: `${statusColor[s.status]}18`, color: statusColor[s.status], fontWeight: 600 }}>{s.status}</span>
                    <div style={{ fontSize: 11, color: s.due === "₹0" ? COLORS.green : COLORS.red, fontWeight: 700 }}>{s.due}</div>
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

// ── LOGOS / TRUSTED BY ─────────────────────────────────────────────────────────
function TrustedBy() {
  const academies = [
    "Nishchay Academy", "BrightFuture Coaching", "TargetIIT Classes",
    "Gurukul Institute", "Rise Academy", "NextGen Tutorials",
  ];
  return (
    <section style={{ padding: "40px 5%", borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
      <div style={{ textAlign: "center", fontSize: 13, color: COLORS.text3, marginBottom: 24, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Trusted by coaching academies across India
      </div>
      <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
        {academies.map((a, i) => (
          <div key={a} style={{ fontSize: 14, fontWeight: 700, color: COLORS.text3, letterSpacing: "0.03em", opacity: 0.7 + i * 0.05 }}>{a}</div>
        ))}
      </div>
    </section>
  );
}

// ── FEATURES ────────────────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "👤", color: COLORS.accent, title: "Smart Student Management",
    desc: "Add, edit, and track every student. Batch assignments, roll numbers, photo ID cards, and QR attendance — all managed from one place.",
    bullets: ["Student profiles with photos", "Batch & branch assignment", "QR code ID cards", "Parent contact info"],
  },
  {
    icon: "💳", color: COLORS.green, title: "Automated Fee Collection",
    desc: "Generate fee records, track dues, and print professional receipts instantly. Know exactly who paid, when, and what's pending.",
    bullets: ["Monthly fee records", "Partial payment tracking", "Printable receipts", "Outstanding dues dashboard"],
  },
  {
    icon: "✅", color: COLORS.cyan, title: "One-tap Attendance",
    desc: "Mark attendance in seconds. QR scanner for quick entry, bulk marking, and automatic parent notifications for absentees.",
    bullets: ["QR-based scanning", "Bulk attendance marking", "Absent alerts to parents", "Monthly attendance reports"],
  },
  {
    icon: "🔔", color: COLORS.purple, title: "Parent Notifications",
    desc: "Instantly notify parents about fees, attendance, test results, and announcements via push notifications — no WhatsApp forwarding needed.",
    bullets: ["Fee due reminders", "Absent day alerts", "Exam result sharing", "Custom announcements"],
  },
  {
    icon: "📊", color: COLORS.yellow, title: "Reports & Analytics",
    desc: "Get a bird's eye view of your academy's financial health, attendance trends, and student performance in beautiful, printable reports.",
    bullets: ["Revenue reports", "Attendance analytics", "Branch performance", "Monthly summaries"],
  },
  {
    icon: "🏫", color: COLORS.red, title: "Multi-branch Ready",
    desc: "Running more than one branch? No problem. Manage multiple branches, assign staff, and track performance — all from a single login.",
    bullets: ["Unlimited branches", "Branch-wise reports", "Staff role management", "Centralized billing"],
  },
];

function Features() {
  const [hover, setHover] = useState(null);
  return (
    <section id="features" style={{ padding: "100px 5%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionLabel>Features</SectionLabel>
        <SectionHeading
          sub="Everything your coaching institute needs to run professionally, without the chaos."
        >
          Built for academies that want to grow, not just survive.
        </SectionHeading>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                background: COLORS.bg2,
                border: `1px solid ${hover === i ? f.color + "55" : COLORS.border}`,
                borderRadius: 16, padding: 28,
                transition: "all 0.25s",
                transform: hover === i ? "translateY(-4px)" : "none",
                boxShadow: hover === i ? `0 16px 48px ${f.color}18` : "none",
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, fontSize: 22,
                background: `${f.color}16`, display: "flex", alignItems: "center",
                justifyContent: "center", marginBottom: 16,
                border: `1px solid ${f.color}22`,
              }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: COLORS.text1, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: COLORS.text2, lineHeight: 1.7, marginBottom: 16 }}>{f.desc}</p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {f.bullets.map(b => (
                  <li key={b} style={{ fontSize: 13, color: COLORS.text2, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: f.color, fontSize: 11 }}>✓</span> {b}
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

// ── HOW IT WORKS ─────────────────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", icon: "🔐", color: COLORS.accent,  title: "Create Your Academy Account",    desc: "Sign up in under 2 minutes. Add your academy name, logo, branches, and staff. No technical setup needed." },
  { num: "02", icon: "👤", color: COLORS.green,  title: "Add Students & Batches",           desc: "Import your student list or add them one by one. Assign to batches, generate roll numbers, and print ID cards." },
  { num: "03", icon: "💳", color: COLORS.purple, title: "Set Up Fee Structures",            desc: "Define monthly fees per batch. The system auto-generates fee records every month and tracks who has paid." },
  { num: "04", icon: "🚀", color: COLORS.yellow, title: "Operate & Grow",                   desc: "Mark attendance, send notifications, collect payments, and view reports. Your academy runs on autopilot." },
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "100px 5%", background: `linear-gradient(180deg, ${COLORS.bg} 0%, ${COLORS.bg2} 100%)` }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <SectionLabel>How It Works</SectionLabel>
        <SectionHeading sub="From zero to a fully-managed academy in one afternoon.">
          Set up in 4 simple steps.
        </SectionHeading>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display: "flex", gap: 24, alignItems: "flex-start", position: "relative" }}>
              {/* Line connector */}
              {i < STEPS.length - 1 && (
                <div style={{ position: "absolute", left: 27, top: 56, width: 2, height: 60, background: `linear-gradient(${s.color}44, transparent)` }} />
              )}
              {/* Step circle */}
              <div style={{
                width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                background: `${s.color}18`, border: `2px solid ${s.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>{s.icon}</div>
              {/* Content */}
              <div style={{ paddingBottom: 52 }}>
                <div style={{ fontSize: 11, color: s.color, fontWeight: 700, marginBottom: 4, letterSpacing: "0.1em" }}>STEP {s.num}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text1, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: COLORS.text2, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── PRICING ───────────────────────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: "basic", name: "Starter", price: 499, period: "month",
    desc: "Perfect for small academies just getting started.",
    color: COLORS.text2,
    features: [
      "Up to 100 students", "1 branch", "Fee management",
      "Basic attendance", "Email support", "Student ID cards",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "pro", name: "Pro", price: 999, period: "month",
    desc: "For growing academies that need more power.",
    color: COLORS.accent, popular: true,
    features: [
      "Up to 500 students", "Up to 5 branches", "Fee + Payment tracking",
      "QR attendance scanner", "Push notifications to parents",
      "Reports & Analytics", "Priority support",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "enterprise", name: "Enterprise", price: 1999, period: "month",
    desc: "For large institutes with multiple centres.",
    color: COLORS.yellow,
    features: [
      "Unlimited students", "Unlimited branches", "Everything in Pro",
      "Custom branding (logo, colors)", "Multi-admin access",
      "Dedicated onboarding", "Phone + WhatsApp support",
    ],
    cta: "Contact Us",
  },
];

function Pricing({ onLogin }) {
  const [annual, setAnnual] = useState(false);
  const disc = annual ? 0.8 : 1; // 20% off annually

  return (
    <section id="pricing" style={{ padding: "100px 5%" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionLabel>Pricing</SectionLabel>
        <SectionHeading sub="Simple, transparent pricing. No hidden charges. Cancel anytime.">
          Plans that grow with your academy.
        </SectionHeading>

        {/* Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 48 }}>
          <span style={{ fontSize: 14, color: !annual ? COLORS.text1 : COLORS.text3, fontWeight: 600 }}>Monthly</span>
          <div onClick={() => setAnnual(!annual)} style={{
            width: 48, height: 26, borderRadius: 13, background: annual ? COLORS.accent : COLORS.border2,
            cursor: "pointer", position: "relative", transition: "background 0.2s",
          }}>
            <div style={{
              position: "absolute", top: 3, left: annual ? 25 : 3,
              width: 20, height: 20, borderRadius: "50%", background: "#fff",
              transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }} />
          </div>
          <span style={{ fontSize: 14, color: annual ? COLORS.text1 : COLORS.text3, fontWeight: 600 }}>
            Annual
            <span style={{ marginLeft: 6, fontSize: 11, color: COLORS.green, background: `${COLORS.green}18`, padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>Save 20%</span>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, alignItems: "start" }}>
          {PLANS.map(p => (
            <div key={p.id} style={{
              background: p.popular ? `linear-gradient(135deg, ${COLORS.accent}14, ${COLORS.purple}0a)` : COLORS.bg2,
              border: `2px solid ${p.popular ? COLORS.accent : COLORS.border}`,
              borderRadius: 20, padding: 32,
              position: "relative",
              transform: p.popular ? "scale(1.03)" : "none",
              boxShadow: p.popular ? `0 24px 80px ${COLORS.accent}22` : "none",
            }}>
              {p.popular && (
                <div style={{
                  position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
                  color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px",
                  borderRadius: 20, letterSpacing: "0.05em", whiteSpace: "nowrap",
                }}>⭐ MOST POPULAR</div>
              )}
              <div style={{ fontSize: 14, fontWeight: 700, color: p.color, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.name}</div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 40, fontWeight: 900, color: COLORS.text1 }}>₹{Math.round(p.price * disc)}</span>
                <span style={{ fontSize: 14, color: COLORS.text3 }}>/{annual ? "mo (billed yearly)" : "month"}</span>
              </div>
              <p style={{ fontSize: 14, color: COLORS.text2, marginBottom: 24, lineHeight: 1.6 }}>{p.desc}</p>
              <button onClick={onLogin} style={{
                width: "100%", padding: "12px", borderRadius: 10, fontWeight: 700,
                fontSize: 14, cursor: "pointer", border: "none", marginBottom: 24,
                background: p.popular ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})` : COLORS.bg3,
                color: p.popular ? "#fff" : COLORS.text1,
                boxShadow: p.popular ? `0 8px 32px ${COLORS.accent}44` : "none",
                transition: "opacity 0.2s",
              }}>{p.cta} →</button>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {p.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: COLORS.text2, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: p.color || COLORS.green, fontSize: 14, flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: COLORS.text3, marginTop: 28 }}>
          All plans include a <strong style={{ color: COLORS.text2 }}>14-day free trial</strong>. No credit card required.
        </p>
      </div>
    </section>
  );
}

// ── TESTIMONIALS ────────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Rajesh Kulkarni", role: "Director, TargetIIT Classes, Nagpur",
    avatar: "R", color: COLORS.accent,
    text: "Before Exponent, I was chasing students for fees on WhatsApp. Now the system sends reminders automatically and I can see every pending due from my phone. Best investment I made for my academy.",
    rating: 5,
  },
  {
    name: "Sunita Deshpande", role: "Owner, BrightFuture Coaching, Pune",
    avatar: "S", color: COLORS.green,
    text: "Setting up 3 branches used to be a nightmare. With Exponent, I manage all of them from one dashboard. The attendance QR scanner alone saves my staff 30 minutes every day.",
    rating: 5,
  },
  {
    name: "Amit Sharma", role: "Founder, Rise Academy, Mumbai",
    avatar: "A", color: COLORS.purple,
    text: "The parent notification feature is a game-changer. Parents love getting real-time updates about their child's attendance and fees. My renewal rate jumped to 94% this year.",
    rating: 5,
  },
  {
    name: "Priya Naik", role: "Administrator, Gurukul Institute, Nashik",
    avatar: "P", color: COLORS.yellow,
    text: "We switched from Excel to Exponent and never looked back. The reports are beautiful and the fee receipts print professionally. Parents are impressed and so am I.",
    rating: 5,
  },
];

function Testimonials() {
  return (
    <section style={{ padding: "100px 5%", background: `linear-gradient(180deg, ${COLORS.bg2} 0%, ${COLORS.bg} 100%)` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionLabel>Testimonials</SectionLabel>
        <SectionHeading sub="Don't take our word for it. Here's what academy owners say.">
          Loved by academy owners across India.
        </SectionHeading>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{
              background: COLORS.bg2, border: `1px solid ${COLORS.border}`,
              borderRadius: 16, padding: 28,
            }}>
              {/* Stars */}
              <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                {Array(t.rating).fill(null).map((_, i) => <span key={i} style={{ color: COLORS.yellow }}>★</span>)}
              </div>
              <p style={{ fontSize: 14, color: COLORS.text2, lineHeight: 1.8, marginBottom: 20, fontStyle: "italic" }}>“{t.text}”</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${t.color}22`, border: `2px solid ${t.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, color: t.color }}>{t.avatar}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text1 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.text3 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FOUNDER STORY ────────────────────────────────────────────────────────────────────────
function FounderStory() {
  return (
    <section style={{ padding: "80px 5%" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff" }}>K</div>
        <div style={{ fontSize: 13, color: COLORS.text3, marginBottom: 4 }}>FROM THE FOUNDER</div>
        <h3 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text1, marginBottom: 20 }}>Why I built Exponent</h3>
        <p style={{ fontSize: 16, color: COLORS.text2, lineHeight: 1.9, marginBottom: 24 }}>
          “I saw my family's coaching academy drowning in paperwork — fee registers, attendance notebooks, parent calls, WhatsApp reminders. It was chaos.
          I built Exponent to fix exactly that. After 2 years and 40+ academies using it, I know we're on the right track.
          We're not a big Silicon Valley startup. We're a small team that genuinely understands what coaching academy owners go through every day.”
        </p>
        <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text1 }}>Kartik Ninawe</div>
        <div style={{ fontSize: 12, color: COLORS.text3 }}>Founder, Exponent Platform</div>
      </div>
    </section>
  );
}

// ── SECURITY / TRUST ──────────────────────────────────────────────────────────────────────
function Security() {
  const trust = [
    { icon: "🔒", title: "Bank-grade Security",    desc: "All data encrypted with AES-256 at rest and TLS in transit. Your data is always safe." },
    { icon: "🇨🇳", title: "Made in India",         desc: "Built specifically for Indian coaching institutes. GST-ready, INR pricing, Hindi support coming." },
    { icon: "☁️",  title: "99.9% Uptime",          desc: "Hosted on enterprise infrastructure. Automatic backups every 6 hours. Your data never disappears." },
    { icon: "🔵", title: "Your Data, Your Control", desc: "You own your data 100%. Export everything anytime. We never share your student data with anyone." },
  ];
  return (
    <section style={{ padding: "80px 5%", background: COLORS.bg2 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <SectionLabel>Security & Privacy</SectionLabel>
        <SectionHeading sub="We take the security of your academy's data as seriously as you do.">
          Your data is safe with us.
        </SectionHeading>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
          {trust.map(t => (
            <div key={t.title} style={{ background: COLORS.bg3, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{t.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text1, marginBottom: 8 }}>{t.title}</div>
              <div style={{ fontSize: 13, color: COLORS.text2, lineHeight: 1.7 }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Is there a free trial?",                  a: "Yes! Every plan starts with a 14-day free trial. No credit card required." },
  { q: "Can I manage multiple branches?",          a: "Absolutely. The Pro and Enterprise plans support multiple branches, each with their own staff, students, and reports." },
  { q: "How do parent notifications work?",        a: "Parents install a free app or receive WhatsApp messages. You can send attendance alerts, fee reminders, and announcements with one click." },
  { q: "Can I export my data?",                    a: "Yes. You can export student lists, fee reports, and attendance records in PDF or Excel format at any time." },
  { q: "What payment methods do you accept?",      a: "We accept UPI, debit/credit cards, net banking, and bank transfers. All payments are processed securely." },
  { q: "Do I need any technical knowledge?",       a: "Not at all. Exponent is designed to be used by non-technical academy owners. Setup takes less than an hour." },
  { q: "Can I cancel anytime?",                    a: "Yes. No lock-ins, no cancellation fees. Cancel any time from your dashboard." },
  { q: "Is my student data private?",              a: "100% yes. Your data is encrypted, stored securely, and never shared with third parties. You own your data." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" style={{ padding: "100px 5%" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <SectionLabel>FAQ</SectionLabel>
        <SectionHeading sub="Everything you need to know before getting started.">Frequently Asked Questions.</SectionHeading>
        {FAQS.map((f, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)}
            style={{
              borderBottom: `1px solid ${COLORS.border}`,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0" }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.text1 }}>{f.q}</span>
              <span style={{ color: COLORS.accent, fontSize: 18, transform: open === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
            </div>
            {open === i && (
              <div style={{ fontSize: 14, color: COLORS.text2, lineHeight: 1.8, paddingBottom: 18 }}>{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── FINAL CTA ───────────────────────────────────────────────────────────────────────────────
function FinalCTA({ onLogin }) {
  return (
    <section style={{
      padding: "100px 5%",
      background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${COLORS.accent}14 0%, transparent 70%)`,
      textAlign: "center",
    }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h2 style={{ fontSize: 42, fontWeight: 900, color: COLORS.text1, lineHeight: 1.2, letterSpacing: "-1px", marginBottom: 16 }}>
          Ready to transform your academy?
        </h2>
        <p style={{ fontSize: 17, color: COLORS.text2, lineHeight: 1.7, marginBottom: 40 }}>
          Join 40+ coaching institutes already running smarter with Exponent.
          Start your free 14-day trial today — no credit card needed.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn primary large onClick={onLogin}>🚀 Start Free Trial — 14 Days</Btn>
          <Btn large href="mailto:support@exponent.academy">💬 Talk to Us</Btn>
        </div>
        <p style={{ marginTop: 24, fontSize: 13, color: COLORS.text3 }}>
          No credit card · Setup in under 1 hour · Cancel anytime
        </p>
      </div>
    </section>
  );
}

// ── FOOTER ───────────────────────────────────────────────────────────────────────────────────
function Footer({ onLogin }) {
  return (
    <footer style={{ padding: "40px 5% 32px", borderTop: `1px solid ${COLORS.border}`, background: COLORS.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32, marginBottom: 40 }}>
          {/* Brand */}
          <div style={{ maxWidth: 260 }}>
            <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "0.06em",
              background: `linear-gradient(135deg, ${COLORS.accent2}, ${COLORS.purple})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 8 }}>EXPONENT</div>
            <p style={{ fontSize: 13, color: COLORS.text3, lineHeight: 1.7 }}>The all-in-one academy management platform for coaching institutes across India.</p>
          </div>
          {/* Links */}
          {[
            { title: "Product", links: ["Features", "Pricing", "How It Works", "FAQ"] },
            { title: "Company", links: ["About", "Founder Story", "Privacy Policy", "Terms of Service"] },
            { title: "Support", links: ["Help Center", "Contact Us", "WhatsApp Support", "Request Demo"] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.text3, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l} style={{ marginBottom: 10 }}>
                  <a href="#" style={{ fontSize: 13, color: COLORS.text3, textDecoration: "none" }}
                    onMouseEnter={e => e.target.style.color = COLORS.text2}
                    onMouseLeave={e => e.target.style.color = COLORS.text3}>{l}</a>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 12, color: COLORS.text3 }}>© 2025 Exponent Platform. All rights reserved. Made with ❤️ in India.</div>
          <div style={{ fontSize: 12, color: COLORS.text3, display: "flex", gap: 20 }}>
            <span>Privacy Policy</span><span>Terms of Service</span><span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── MAIN LANDING PAGE ───────────────────────────────────────────────────────────────
export default function Landing({ onLogin }) {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif", background: COLORS.bg, color: COLORS.text1, minHeight: "100vh", WebkitFontSmoothing: "antialiased" }}>
      <Navbar onLogin={onLogin} />
      <Hero onLogin={onLogin} />
      <DashPreview />
      <TrustedBy />
      <Features />
      <HowItWorks />
      <Pricing onLogin={onLogin} />
      <Testimonials />
      <FounderStory />
      <Security />
      <FAQ />
      <FinalCTA onLogin={onLogin} />
      <Footer onLogin={onLogin} />
    </div>
  );
}
