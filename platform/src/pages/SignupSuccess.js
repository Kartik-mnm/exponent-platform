const C = {
  bg:"#07090f",bg2:"#0d1117",t1:"#eef1fb",t2:"#8892b5",t3:"#454f72",
  acc:"#6366f1",grn:"#10b981",pur:"#a855f7",border:"#1e2535",border2:"#28304a",
};

// The academy portal URL — where customers actually log in to manage their academy
const ACADEMY_PORTAL = "https://acadfee-app.onrender.com";

export default function SignupSuccess({ data, onLogin }) {
  const trialDate = data?.trial_ends_at
    ? new Date(data.trial_ends_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })
    : "7 days from now";

  const goToDashboard = () => {
    // Set the academy slug so the portal loads the right academy
    localStorage.setItem("academy_slug", data?.academy?.slug || "");
    // Redirect to the academy portal (not the platform panel)
    window.location.href = ACADEMY_PORTAL;
  };

  return (
    <div style={{
      minHeight:"100vh",background:C.bg,
      display:"flex",alignItems:"center",justifyContent:"center",
      padding:"24px 16px",
      fontFamily:"-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif",
    }}>
      <div style={{
        background:C.bg2,border:`1px solid ${C.border2}`,
        borderRadius:20,padding:"40px 32px",
        maxWidth:460,width:"100%",textAlign:"center",
        boxShadow:"0 24px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Success icon */}
        <div style={{
          width:64,height:64,borderRadius:"50%",
          background:`${C.grn}18`,border:`2px solid ${C.grn}44`,
          display:"flex",alignItems:"center",justifyContent:"center",
          margin:"0 auto 20px",fontSize:32,
        }}>✅</div>

        <h2 style={{fontSize:24,fontWeight:900,color:C.t1,letterSpacing:"-0.4px",marginBottom:10}}>
          Your academy is ready!
        </h2>
        <p style={{fontSize:15,color:C.t2,lineHeight:1.7,marginBottom:24}}>
          <strong style={{color:C.t1}}>{data?.academy?.name}</strong> has been created successfully.
          You're on a <strong style={{color:C.acc}}>7-day free trial</strong>.
        </p>

        {/* Details card */}
        <div style={{
          background:"#0a0d14",border:`1px solid ${C.border}`,
          borderRadius:12,padding:"16px 20px",marginBottom:24,textAlign:"left",
        }}>
          <div style={{fontSize:11,color:C.t3,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:12}}>Your login details</div>
          <Row label="Academy" value={data?.academy?.name} />
          <Row label="Login Email" value={data?.user?.email} />
          <Row label="Role" value="Super Admin" />
          <Row label="Portal URL" value={ACADEMY_PORTAL} accent />
          <Row label="Trial Ends" value={trialDate} accent />
        </div>

        {/* Primary CTA — go to academy portal */}
        <button onClick={goToDashboard} style={{
          width:"100%",padding:"13px",borderRadius:11,border:"none",
          background:`linear-gradient(135deg,${C.acc},${C.pur})`,
          color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",
          boxShadow:`0 8px 28px ${C.acc}44`,marginBottom:12,
        }}>
          🚀 Go to My Academy Dashboard
        </button>

        {/* Secondary CTA — platform admin */}
        <button onClick={onLogin} style={{
          width:"100%",padding:"10px",borderRadius:10,
          border:`1px solid ${C.border2}`,background:"transparent",
          color:C.t3,fontSize:13,cursor:"pointer",fontWeight:600,
        }}>
          Platform Admin Login
        </button>

        <p style={{fontSize:12,color:C.t3,marginTop:16,lineHeight:1.6}}>
          Check your email for a welcome message with next steps.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${"#1e2535"}`}}>
      <span style={{fontSize:12,color:"#454f72",fontWeight:600}}>{label}</span>
      <span style={{fontSize:12,color:accent?"#6366f1":"#eef1fb",fontWeight:700,maxWidth:220,textAlign:"right",wordBreak:"break-all"}}>{value}</span>
    </div>
  );
}
