import { useState, useEffect } from "react";

const C = {
  bg:"#07090f",bg2:"#0d1117",bg3:"#131720",
  border:"#1e2535",border2:"#28304a",
  t1:"#eef1fb",t2:"#8892b5",t3:"#454f72",
  acc:"#6366f1",acc2:"#818cf8",
  grn:"#10b981",yel:"#f59e0b",red:"#ef4444",pur:"#a855f7",cyn:"#06b6d4",
};

const Pill = ({ children, color=C.acc }) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:20,fontSize:12,fontWeight:700,background:`${color}18`,color,border:`1px solid ${color}33`,letterSpacing:"0.04em"}}>
    <span style={{width:6,height:6,borderRadius:"50%",background:color,display:"inline-block"}} />
    {children}
  </span>
);

const PrimaryBtn = ({ children, onClick, large }) => (
  <button onClick={onClick} style={{display:"inline-flex",alignItems:"center",gap:8,padding:large?"14px 32px":"10px 22px",borderRadius:10,fontWeight:700,fontSize:large?15:14,cursor:"pointer",border:"none",background:`linear-gradient(135deg,${C.acc},${C.pur})`,color:"#fff",boxShadow:`0 8px 32px ${C.acc}44`,transition:"all 0.2s"}}>{children}</button>
);

const GhostBtn = ({ children, onClick, href }) => {
  const s = {display:"inline-flex",alignItems:"center",gap:8,padding:"10px 22px",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",background:"transparent",color:C.t2,border:`1px solid ${C.border2}`,textDecoration:"none",transition:"all 0.2s"};
  if (href) return <a href={href} style={s}>{children}</a>;
  return <button onClick={onClick} style={s}>{children}</button>;
};

const SecHeading = ({ label, title, sub }) => (
  <div style={{textAlign:"center",marginBottom:48}}>
    {label && <div style={{marginBottom:14}}><Pill>{label}</Pill></div>}
    <h2 style={{fontSize:36,fontWeight:800,color:C.t1,letterSpacing:"-0.5px",lineHeight:1.2,marginBottom:14}}>{title}</h2>
    {sub && <p style={{fontSize:17,color:C.t2,maxWidth:560,margin:"0 auto",lineHeight:1.7}}>{sub}</p>}
  </div>
);

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// ── Mobile-responsive Navbar ─────────────────────────────────────────────────
function Navbar({ onGetStarted, onLogin }) {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = [
    { label: "Features",     id: "features"     },
    { label: "Pricing",      id: "pricing"      },
    { label: "How It Works", id: "how-it-works" },
    { label: "FAQ",          id: "faq"          },
  ];

  const handleLink = (id) => {
    setMobileOpen(false);
    scrollTo(id);
  };

  return (
    <>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"0 5%",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",background:scrolled||mobileOpen?`${C.bg}ee`:"transparent",backdropFilter:scrolled||mobileOpen?"blur(20px)":"none",borderBottom:scrolled||mobileOpen?`1px solid ${C.border}`:"1px solid transparent",transition:"all 0.3s"}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:`linear-gradient(135deg,${C.acc},${C.pur})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:15,boxShadow:`0 4px 14px ${C.acc}55`}}>E</div>
          <div>
            <div style={{fontSize:15,fontWeight:800,letterSpacing:"0.06em",background:`linear-gradient(135deg,${C.acc2},${C.pur})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>EXPONENT</div>
            <div style={{fontSize:9,color:C.t3,letterSpacing:"0.1em",textTransform:"uppercase"}}>Academy OS</div>
          </div>
        </div>

        {/* Desktop nav links */}
        <div style={{display:"flex",gap:28,alignItems:"center","@media(max-width:768px)":{display:"none"}}}>
          {navLinks.map(l => (
            <button key={l.id} onClick={() => scrollTo(l.id)} style={{fontSize:13,color:C.t2,background:"none",border:"none",cursor:"pointer",fontWeight:500,padding:0,
              // hide on small screens via inline — we use the hamburger instead
              display: "var(--nav-link-display, inline-block)"
            }}>{l.label}</button>
          ))}
        </div>

        {/* Desktop CTA */}
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {/* Hide sign-in text on very small screens */}
          <button onClick={onLogin} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:C.t2,fontWeight:500,
            display: typeof window !== "undefined" && window.innerWidth < 480 ? "none" : "block"
          }}>Sign In</button>
          <PrimaryBtn onClick={onGetStarted}>Get Started →</PrimaryBtn>
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
            style={{display:"none",background:"none",border:`1px solid ${C.border2}`,borderRadius:8,cursor:"pointer",padding:"6px 8px",color:C.t2,fontSize:18,lineHeight:1,
              // show only on mobile — we toggle via style tag below
            }}
            className="hamburger-btn"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{position:"fixed",top:64,left:0,right:0,zIndex:99,background:`${C.bg}f5`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,padding:"20px 5% 24px",display:"flex",flexDirection:"column",gap:4}}>
          {navLinks.map(l => (
            <button key={l.id} onClick={() => handleLink(l.id)} style={{fontSize:15,color:C.t1,background:"none",border:"none",cursor:"pointer",fontWeight:600,padding:"12px 0",textAlign:"left",borderBottom:`1px solid ${C.border}`}}>
              {l.label}
            </button>
          ))}
          <div style={{display:"flex",gap:10,marginTop:16,flexDirection:"column"}}>
            <button onClick={() => { setMobileOpen(false); onLogin(); }} style={{padding:"11px",borderRadius:10,background:C.bg3,border:`1px solid ${C.border2}`,color:C.t1,fontWeight:700,fontSize:14,cursor:"pointer"}}>
              Sign In
            </button>
            <button onClick={() => { setMobileOpen(false); onGetStarted(); }} style={{padding:"11px",borderRadius:10,background:`linear-gradient(135deg,${C.acc},${C.pur})`,border:"none",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",boxShadow:`0 4px 16px ${C.acc}44`}}>
              🚀 Get Started Free →
            </button>
          </div>
        </div>
      )}

      {/* CSS to show hamburger + hide desktop links on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .hamburger-btn { display: block !important; }
          :root { --nav-link-display: none; }
        }
        @media (min-width: 769px) {
          .hamburger-btn { display: none !important; }
          :root { --nav-link-display: inline-block; }
        }
      `}</style>
    </>
  );
}

function Hero({ onGetStarted }) {
  return (
    <section style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"120px 5% 80px",background:`radial-gradient(ellipse 80% 60% at 50% -20%,${C.acc}18 0%,transparent 70%)`,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,zIndex:0,backgroundImage:`linear-gradient(${C.border}44 1px,transparent 1px),linear-gradient(90deg,${C.border}44 1px,transparent 1px)`,backgroundSize:"60px 60px",maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)",WebkitMaskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)"}} />
      <div style={{position:"relative",zIndex:1,maxWidth:800,margin:"0 auto"}}>
        <div style={{marginBottom:28}}>
          <span style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,background:`${C.grn}14`,border:`1px solid ${C.grn}33`,fontSize:12,color:C.grn,fontWeight:600}}>✨ Trusted by coaching academies across India</span>
        </div>
        <h1 style={{fontSize:"clamp(36px,6vw,64px)",fontWeight:900,lineHeight:1.1,letterSpacing:"-1.5px",color:C.t1,marginBottom:20}}>
          Run Your Academy<br />
          <span style={{background:`linear-gradient(135deg,${C.acc2},${C.pur})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Like a Pro — Not a Spreadsheet.</span>
        </h1>
        <p style={{fontSize:19,color:C.t2,maxWidth:580,margin:"0 auto 40px",lineHeight:1.7}}>Exponent is the all-in-one academy management software for coaching institutes. Manage students, fees, attendance, and parent notifications — all in one place.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginBottom:56}}>
          <PrimaryBtn large onClick={onGetStarted}>🚀 Start Free Trial — 7 Days</PrimaryBtn>
          <GhostBtn onClick={() => scrollTo("how-it-works")}>▶ See How It Works</GhostBtn>
        </div>
        <div style={{display:"flex",gap:48,justifyContent:"center",flexWrap:"wrap",paddingTop:40,borderTop:`1px solid ${C.border}`}}>
          {[{v:"40+",l:"Academies",i:"🏫"},{v:"2,000+",l:"Students Managed",i:"🎓"},{v:"98%",l:"Fee Collection Rate",i:"💰"},{v:"4.9★",l:"Average Rating",i:"⭐"}].map(s => (
            <div key={s.l} style={{textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:800,color:C.t1}}>{s.i} {s.v}</div>
              <div style={{fontSize:12,color:C.t3,marginTop:3}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashPreview() {
  const stats = [{l:"Active Students",v:"247",c:C.acc,i:"🎓"},{l:"Fees Collected",v:"₹1.8L",c:C.grn,i:"💰"},{l:"Pending Dues",v:"₹24K",c:C.yel,i:"⚠️"},{l:"Attendance",v:"94%",c:C.cyn,i:"✅"}];
  const rows = [{n:"Priya Sharma",b:"JEE Adv.",s:"paid",d:"₹0"},{n:"Rahul Deshmukh",b:"NEET",s:"pending",d:"₹2,500"},{n:"Sneha Patil",b:"Class 10",s:"paid",d:"₹0"},{n:"Arjun Verma",b:"JEE Main",s:"partial",d:"₹1,200"},{n:"Kavya Singh",b:"Foundation",s:"paid",d:"₹0"}];
  const sc = {paid:C.grn,pending:C.red,partial:C.yel};
  return (
    <section style={{padding:"0 5% 80px"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:20,overflow:"hidden",boxShadow:"0 40px 120px rgba(0,0,0,0.6)"}}>
          <div style={{background:C.bg3,padding:"12px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:`1px solid ${C.border}`}}>
            {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{width:12,height:12,borderRadius:"50%",background:c}} />)}
            <div style={{flex:1,background:C.bg,borderRadius:6,padding:"5px 12px",fontSize:11,color:C.t3,marginLeft:8}}>acadfee-app.onrender.com/dashboard</div>
          </div>
          <div style={{display:"flex",minHeight:360}}>
            <div style={{width:180,background:C.bg,borderRight:`1px solid ${C.border}`,padding:"16px 10px",flexShrink:0}}>
              <div style={{fontSize:11,fontWeight:800,color:C.acc,letterSpacing:"0.1em",padding:"4px 8px",marginBottom:8}}>EXPONENT</div>
              {["🔵 Dashboard","👤 Students","💳 Payments","✅ Attendance","📊 Reports"].map((item,i) => (
                <div key={item} style={{padding:"7px 10px",borderRadius:7,fontSize:12,color:i===0?C.acc:C.t3,background:i===0?`${C.acc}14`:"transparent",marginBottom:2,fontWeight:i===0?600:400}}>{item}</div>
              ))}
            </div>
            <div style={{flex:1,padding:20,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
                {stats.map(s => (
                  <div key={s.l} style={{background:C.bg3,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`,borderTop:`2px solid ${s.c}`}}>
                    <div style={{fontSize:9,color:C.t3,fontWeight:600,marginBottom:6,textTransform:"uppercase"}}>{s.l}</div>
                    <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.i} {s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:C.bg3,borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,fontSize:11,fontWeight:700,color:C.t2}}>Recent Students</div>
                {rows.map(r => (
                  <div key={r.n} style={{display:"flex",alignItems:"center",padding:"8px 14px",borderBottom:`1px solid ${C.border}88`,gap:12}}>
                    <div style={{width:26,height:26,borderRadius:"50%",background:C.acc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#fff",fontWeight:700,flexShrink:0}}>{r.n[0]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.t1}}>{r.n}</div>
                      <div style={{fontSize:10,color:C.t3}}>{r.b}</div>
                    </div>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:`${sc[r.s]}18`,color:sc[r.s],fontWeight:600}}>{r.s}</span>
                    <div style={{fontSize:11,color:r.d==="₹0"?C.grn:C.red,fontWeight:700}}>{r.d}</div>
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

function TrustedBy() {
  return (
    <section style={{padding:"40px 5%",borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
      <div style={{textAlign:"center",fontSize:13,color:C.t3,marginBottom:24,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.1em"}}>Trusted by coaching academies across India</div>
      <div style={{display:"flex",gap:40,justifyContent:"center",flexWrap:"wrap",alignItems:"center"}}>
        {["Nishchay Academy","BrightFuture Coaching","TargetIIT Classes","Gurukul Institute","Rise Academy","NextGen Tutorials"].map((a,i) => (
          <div key={a} style={{fontSize:14,fontWeight:700,color:C.t3,opacity:0.7+i*0.05}}>{a}</div>
        ))}
      </div>
    </section>
  );
}

const FEATS = [
  {icon:"👤",color:C.acc,title:"Smart Student Management",desc:"Add, edit, and track every student. Batch assignments, roll numbers, photo ID cards, and QR attendance — all from one place.",pts:["Student profiles with photos","Batch & branch assignment","QR code ID cards","Parent contact info"]},
  {icon:"💳",color:C.grn,title:"Automated Fee Collection",desc:"Generate fee records, track dues, and print professional receipts instantly.",pts:["Monthly fee records","Partial payment tracking","Printable receipts","Outstanding dues dashboard"]},
  {icon:"✅",color:C.cyn,title:"One-tap Attendance",desc:"Mark attendance in seconds with QR scanner, bulk marking, and auto parent alerts.",pts:["QR-based scanning","Bulk attendance marking","Absent alerts to parents","Monthly attendance reports"]},
  {icon:"🔔",color:C.pur,title:"Parent Notifications",desc:"Instantly notify parents about fees, attendance, and test results via push notifications.",pts:["Fee due reminders","Absent day alerts","Exam result sharing","Custom announcements"]},
  {icon:"📊",color:C.yel,title:"Reports & Analytics",desc:"Get a full view of your academy's financial health, attendance trends, and performance.",pts:["Revenue reports","Attendance analytics","Branch performance","Monthly summaries"]},
  {icon:"🏫",color:C.red,title:"Multi-branch Ready",desc:"Manage multiple branches, assign staff, and track all performance from one login.",pts:["Unlimited branches","Branch-wise reports","Staff role management","Centralized billing"]},
];

function Features() {
  const [hov, setHov] = useState(null);
  return (
    <section id="features" style={{padding:"100px 5%"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <SecHeading label="Features" title="Built for academies that want to grow, not just survive." sub="Everything your coaching institute needs to run professionally, without the chaos." />
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20}}>
          {FEATS.map((f,i) => (
            <div key={f.title} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} style={{background:C.bg2,border:`1px solid ${hov===i?f.color+"55":C.border}`,borderRadius:16,padding:28,transition:"all 0.25s",transform:hov===i?"translateY(-4px)":"none",boxShadow:hov===i?`0 16px 48px ${f.color}18`:"none"}}>
              <div style={{width:48,height:48,borderRadius:12,fontSize:22,background:`${f.color}16`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,border:`1px solid ${f.color}22`}}>{f.icon}</div>
              <h3 style={{fontSize:17,fontWeight:700,color:C.t1,marginBottom:10}}>{f.title}</h3>
              <p style={{fontSize:14,color:C.t2,lineHeight:1.7,marginBottom:16}}>{f.desc}</p>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:6}}>
                {f.pts.map(b => <li key={b} style={{fontSize:13,color:C.t2,display:"flex",alignItems:"center",gap:8}}><span style={{color:f.color,fontSize:11,fontWeight:700}}>✓</span> {b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {num:"01",icon:"🔐",color:C.acc,title:"Create Your Academy Account",desc:"Sign up in under 2 minutes. Add your academy name, logo, branches, and staff. No technical setup needed."},
  {num:"02",icon:"👤",color:C.grn,title:"Add Students & Batches",desc:"Import your student list or add them one by one. Assign to batches, generate roll numbers, and print ID cards."},
  {num:"03",icon:"💳",color:C.pur,title:"Set Up Fee Structures",desc:"Define monthly fees per batch. The system auto-generates fee records every month and tracks who has paid."},
  {num:"04",icon:"🚀",color:C.yel,title:"Operate & Grow",desc:"Mark attendance, send notifications, collect payments, and view reports. Your academy runs on autopilot."},
];

function HowItWorks() {
  return (
    <section id="how-it-works" style={{padding:"100px 5%",background:`linear-gradient(180deg,${C.bg} 0%,${C.bg2} 100%)`}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <SecHeading label="How It Works" title="Set up in 4 simple steps." sub="From zero to a fully-managed academy in one afternoon." />
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {STEPS.map((s,i) => (
            <div key={s.num} style={{display:"flex",gap:24,alignItems:"flex-start",position:"relative"}}>
              {i < STEPS.length-1 && <div style={{position:"absolute",left:27,top:56,width:2,height:60,background:`linear-gradient(${s.color}44,transparent)`}} />}
              <div style={{width:56,height:56,borderRadius:"50%",flexShrink:0,background:`${s.color}18`,border:`2px solid ${s.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{s.icon}</div>
              <div style={{paddingBottom:52}}>
                <div style={{fontSize:11,color:s.color,fontWeight:700,marginBottom:4,letterSpacing:"0.1em"}}>STEP {s.num}</div>
                <h3 style={{fontSize:18,fontWeight:700,color:C.t1,marginBottom:8}}>{s.title}</h3>
                <p style={{fontSize:15,color:C.t2,lineHeight:1.7}}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  {id:"basic",name:"Starter",price:499,color:C.t2,popular:false,desc:"Perfect for small academies just getting started.",cta:"Start Free Trial",pts:["Up to 100 students","1 branch","Fee management","Basic attendance","Email support","Student ID cards"]},
  {id:"pro",name:"Pro",price:999,color:C.acc,popular:true,desc:"For growing academies that need more power.",cta:"Start Free Trial",pts:["Up to 500 students","Up to 5 branches","Fee + Payment tracking","QR attendance scanner","Parent notifications","Reports & Analytics","Priority support"]},
  {id:"enterprise",name:"Enterprise",price:1999,color:C.yel,popular:false,desc:"For large institutes with multiple centres.",cta:"Contact Us",pts:["Unlimited students","Unlimited branches","Everything in Pro","Custom branding","Multi-admin access","Dedicated onboarding","Phone + WhatsApp support"]},
];

function Pricing({ onGetStarted }) {
  const [annual, setAnnual] = useState(false);
  return (
    <section id="pricing" style={{padding:"100px 5%"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <SecHeading label="Pricing" title="Plans that grow with your academy." sub="Simple, transparent pricing. No hidden charges. Cancel anytime." />
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:48}}>
          <span style={{fontSize:14,color:!annual?C.t1:C.t3,fontWeight:600}}>Monthly</span>
          <div onClick={()=>setAnnual(!annual)} style={{width:48,height:26,borderRadius:13,background:annual?C.acc:C.border2,cursor:"pointer",position:"relative",transition:"background 0.2s"}}>
            <div style={{position:"absolute",top:3,left:annual?25:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}} />
          </div>
          <span style={{fontSize:14,color:annual?C.t1:C.t3,fontWeight:600}}>Annual <span style={{marginLeft:6,fontSize:11,color:C.grn,background:`${C.grn}18`,padding:"2px 8px",borderRadius:10,fontWeight:700}}>Save 20%</span></span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,alignItems:"start"}}>
          {PLANS.map(p => (
            <div key={p.id} style={{background:p.popular?`linear-gradient(135deg,${C.acc}14,${C.pur}0a)`:C.bg2,border:`2px solid ${p.popular?C.acc:C.border}`,borderRadius:20,padding:32,position:"relative",transform:p.popular?"scale(1.03)":"none",boxShadow:p.popular?`0 24px 80px ${C.acc}22`:"none"}}>
              {p.popular && <div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",background:`linear-gradient(135deg,${C.acc},${C.pur})`,color:"#fff",fontSize:11,fontWeight:700,padding:"4px 16px",borderRadius:20,whiteSpace:"nowrap"}}>⭐ MOST POPULAR</div>}
              <div style={{fontSize:14,fontWeight:700,color:p.color,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>{p.name}</div>
              <div style={{marginBottom:12}}>
                <span style={{fontSize:40,fontWeight:900,color:C.t1}}>₹{Math.round(p.price*(annual?0.8:1))}</span>
                <span style={{fontSize:14,color:C.t3}}>/{annual?"mo (billed yearly)":"month"}</span>
              </div>
              <p style={{fontSize:14,color:C.t2,marginBottom:24,lineHeight:1.6}}>{p.desc}</p>
              {p.id === "enterprise" ? (
                <a href="mailto:kartik@exponent.app?subject=Enterprise Plan Inquiry" style={{display:"block",width:"100%",padding:"12px",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",border:"none",marginBottom:24,background:C.bg3,color:C.t1,textAlign:"center",textDecoration:"none",boxSizing:"border-box"}}>Contact Us →</a>
              ) : (
                <button onClick={onGetStarted} style={{width:"100%",padding:"12px",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",border:"none",marginBottom:24,background:p.popular?`linear-gradient(135deg,${C.acc},${C.pur})`:C.bg3,color:p.popular?"#fff":C.t1,boxShadow:p.popular?`0 8px 32px ${C.acc}44`:"none"}}>{p.cta} →</button>
              )}
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>
                {p.pts.map(f => <li key={f} style={{fontSize:13,color:C.t2,display:"flex",alignItems:"center",gap:8}}><span style={{color:p.color,fontSize:14,flexShrink:0}}>✓</span> {f}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p style={{textAlign:"center",fontSize:13,color:C.t3,marginTop:28}}>All plans include a <strong style={{color:C.t2}}>7-day free trial</strong>. No credit card required.</p>
      </div>
    </section>
  );
}

const TESTI = [
  {n:"Rajesh Kulkarni",r:"Director, TargetIIT Classes, Nagpur",a:"R",c:C.acc,t:"Before Exponent, I was chasing students for fees on WhatsApp. Now the system sends reminders automatically and I can see every pending due from my phone. Best investment I made for my academy."},
  {n:"Sunita Deshpande",r:"Owner, BrightFuture Coaching, Pune",a:"S",c:C.grn,t:"Setting up 3 branches used to be a nightmare. With Exponent, I manage all of them from one dashboard. The QR scanner alone saves my staff 30 minutes every single day."},
  {n:"Amit Sharma",r:"Founder, Rise Academy, Mumbai",a:"A",c:C.pur,t:"The parent notification feature is a game-changer. Parents love getting real-time updates. My renewal rate jumped to 94% this year."},
  {n:"Priya Naik",r:"Administrator, Gurukul Institute, Nashik",a:"P",c:C.yel,t:"We switched from Excel to Exponent and never looked back. The reports are beautiful and the fee receipts print professionally. Parents are impressed."},
];

function Testimonials() {
  return (
    <section style={{padding:"100px 5%",background:`linear-gradient(180deg,${C.bg2} 0%,${C.bg} 100%)`}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <SecHeading label="Testimonials" title="Loved by academy owners across India." sub="Don't take our word for it. Here's what academy owners say." />
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20}}>
          {TESTI.map(t => (
            <div key={t.n} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:16,padding:28}}>
              <div style={{display:"flex",gap:3,marginBottom:16}}>{[1,2,3,4,5].map(i => <span key={i} style={{color:C.yel}}>★</span>)}</div>
              <p style={{fontSize:14,color:C.t2,lineHeight:1.8,marginBottom:20,fontStyle:"italic"}}>"{t.t}"</p>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:`${t.c}22`,border:`2px solid ${t.c}44`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:15,color:t.c}}>{t.a}</div>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:C.t1}}>{t.n}</div>
                  <div style={{fontSize:11,color:C.t3}}>{t.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FounderStory() {
  return (
    <section id="about" style={{padding:"80px 5%"}}>
      <div style={{maxWidth:800,margin:"0 auto",textAlign:"center"}}>
        <div style={{width:72,height:72,borderRadius:"50%",background:`linear-gradient(135deg,${C.acc},${C.pur})`,margin:"0 auto 20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:"#fff"}}>K</div>
        <div style={{fontSize:13,color:C.t3,marginBottom:4}}>FROM THE FOUNDER</div>
        <h3 style={{fontSize:24,fontWeight:800,color:C.t1,marginBottom:20}}>Why I built Exponent</h3>
        <p style={{fontSize:16,color:C.t2,lineHeight:1.9,marginBottom:24}}>"I saw my family's coaching academy drowning in paperwork — fee registers, attendance notebooks, parent calls, WhatsApp reminders. It was chaos. I built Exponent to fix exactly that. After 2 years and 40+ academies using it, I know we're on the right track. We're not a big Silicon Valley startup. We're a small team that genuinely understands what coaching academy owners go through every day."</p>
        <div style={{fontSize:15,fontWeight:700,color:C.t1}}>Kartik Ninawe</div>
        <div style={{fontSize:12,color:C.t3}}>Founder, Exponent Platform</div>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    {i:"🔒",t:"Bank-grade Security",d:"AES-256 encryption at rest, TLS in transit. Your data is always protected."},
    {i:"🇮🇳",t:"Made in India",d:"Built for Indian coaching institutes. GST-ready, INR pricing, Hindi support coming."},
    {i:"☁️",t:"99.9% Uptime",d:"Enterprise-grade hosting. Automatic backups every 6 hours. Your data never disappears."},
    {i:"🔵",t:"Your Data, Your Control",d:"You own 100% of your data. Export anytime. We never share student data."},
  ];
  return (
    <section id="security" style={{padding:"80px 5%",background:C.bg2}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <SecHeading label="Security & Privacy" title="Your data is safe with us." sub="We take the security of your academy's data as seriously as you do." />
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:20}}>
          {items.map(x => (
            <div key={x.t} style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:14,padding:24}}>
              <div style={{fontSize:28,marginBottom:12}}>{x.i}</div>
              <div style={{fontSize:15,fontWeight:700,color:C.t1,marginBottom:8}}>{x.t}</div>
              <div style={{fontSize:13,color:C.t2,lineHeight:1.7}}>{x.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {q:"Is there a free trial?",a:"Yes! Every plan starts with a 7-day free trial. No credit card required."},
  {q:"Can I manage multiple branches?",a:"Absolutely. The Pro and Enterprise plans support multiple branches with their own staff, students, and reports."},
  {q:"How do parent notifications work?",a:"Parents receive push notifications. You send attendance alerts, fee reminders, and announcements with one click."},
  {q:"Can I export my data?",a:"Yes. Export student lists, fee reports, and attendance records in PDF or Excel at any time."},
  {q:"What payment methods do you accept?",a:"UPI, debit/credit cards, net banking, and bank transfers. All payments processed securely."},
  {q:"Do I need technical knowledge?",a:"Not at all. Designed for non-technical academy owners. Setup takes less than an hour."},
  {q:"Can I cancel anytime?",a:"Yes. No lock-ins, no cancellation fees. Cancel from your dashboard anytime."},
  {q:"Is my student data private?",a:"100% yes. Encrypted, stored securely, never shared with third parties. You own your data."},
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" style={{padding:"100px 5%"}}>
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <SecHeading label="FAQ" title="Frequently Asked Questions." sub="Everything you need to know before getting started." />
        {FAQS.map((f,i) => (
          <div key={i} onClick={()=>setOpen(open===i?null:i)} style={{borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 0"}}>
              <span style={{fontSize:15,fontWeight:600,color:C.t1}}>{f.q}</span>
              <span style={{color:C.acc,fontSize:20,fontWeight:300,transform:open===i?"rotate(45deg)":"none",transition:"transform 0.2s",lineHeight:1}}>+</span>
            </div>
            {open===i && <div style={{fontSize:14,color:C.t2,lineHeight:1.8,paddingBottom:18}}>{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA({ onGetStarted }) {
  return (
    <section style={{padding:"100px 5%",background:`radial-gradient(ellipse 70% 60% at 50% 50%,${C.acc}14 0%,transparent 70%)`,textAlign:"center"}}>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <h2 style={{fontSize:42,fontWeight:900,color:C.t1,lineHeight:1.2,letterSpacing:"-1px",marginBottom:16}}>Ready to transform your academy?</h2>
        <p style={{fontSize:17,color:C.t2,lineHeight:1.7,marginBottom:40}}>Join coaching institutes already running smarter with Exponent. Start your free 7-day trial — no credit card needed.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
          <PrimaryBtn large onClick={onGetStarted}>🚀 Start Free Trial — 7 Days</PrimaryBtn>
          <GhostBtn href="mailto:kartik@exponent.app">💬 Talk to Us</GhostBtn>
        </div>
        <p style={{marginTop:24,fontSize:13,color:C.t3}}>No credit card · Setup in under 1 hour · Cancel anytime</p>
      </div>
    </section>
  );
}

const FOOTER_LINKS = {
  Product: [
    { label: "Features",     action: "scroll", id: "features"    },
    { label: "Pricing",      action: "scroll", id: "pricing"     },
    { label: "How It Works", action: "scroll", id: "how-it-works"},
    { label: "FAQ",          action: "scroll", id: "faq"         },
  ],
  Company: [
    { label: "About",           action: "scroll", id: "about" },
    { label: "Founder Story",   action: "scroll", id: "about" },
    { label: "Privacy Policy",  action: "href",   href: "mailto:kartik@exponent.app?subject=Privacy Policy" },
    { label: "Terms of Service",action: "href",   href: "mailto:kartik@exponent.app?subject=Terms of Service" },
  ],
  Support: [
    { label: "Help Center",      action: "href", href: "mailto:kartik@exponent.app?subject=Help" },
    { label: "Contact Us",       action: "href", href: "mailto:kartik@exponent.app" },
    { label: "WhatsApp Support", action: "href", href: "https://wa.me/918956419453?text=Hi%2C+I+need+help+with+Exponent" },
    { label: "Request Demo",     action: "href", href: "mailto:kartik@exponent.app?subject=Demo Request" },
  ],
};

function Footer({ onGetStarted }) {
  const year = new Date().getFullYear();
  const renderLink = (l) => {
    const style = { fontSize:13, color:C.t3, textDecoration:"none", cursor:"pointer", background:"none", border:"none", padding:0, fontFamily:"inherit" };
    if (l.action === "scroll") return <button key={l.label} onClick={() => scrollTo(l.id)} style={style}>{l.label}</button>;
    const isMailto = l.href?.startsWith("mailto:");
    return <a key={l.label} href={l.href} target={isMailto?"_self":"_blank"} rel={isMailto?undefined:"noopener noreferrer"} style={style}>{l.label}</a>;
  };
  return (
    <footer style={{padding:"40px 5% 32px",borderTop:`1px solid ${C.border}`,background:C.bg}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:32,marginBottom:40}}>
          <div style={{maxWidth:260}}>
            <div style={{fontSize:18,fontWeight:900,letterSpacing:"0.06em",background:`linear-gradient(135deg,${C.acc2},${C.pur})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:8}}>EXPONENT</div>
            <p style={{fontSize:13,color:C.t3,lineHeight:1.7}}>The all-in-one academy management platform for coaching institutes across India.</p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <div style={{fontSize:11,fontWeight:700,color:C.t3,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>{title}</div>
              {links.map(l => <div key={l.label} style={{marginBottom:10}}>{renderLink(l)}</div>)}
            </div>
          ))}
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:24,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <div style={{fontSize:12,color:C.t3}}>© {year} Exponent Platform. All rights reserved. Made with ❤️ in India.</div>
          <div style={{display:"flex",gap:20}}>
            <a href="mailto:kartik@exponent.app?subject=Privacy Policy" style={{fontSize:12,color:C.t3,textDecoration:"none"}}>Privacy Policy</a>
            <a href="mailto:kartik@exponent.app?subject=Terms of Service" style={{fontSize:12,color:C.t3,textDecoration:"none"}}>Terms of Service</a>
            <button onClick={() => scrollTo("security")} style={{fontSize:12,color:C.t3,background:"none",border:"none",cursor:"pointer",padding:0,fontFamily:"inherit"}}>Security</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Landing({ onLogin, onGetStarted }) {
  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif",background:C.bg,color:C.t1,minHeight:"100vh",WebkitFontSmoothing:"antialiased"}}>
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
      <Footer onGetStarted={onGetStarted} />
    </div>
  );
}
