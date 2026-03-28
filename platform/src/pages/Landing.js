  const renderLink = (l) => {
    const style = { fontSize:13, color:C.t3, textDecoration:"none", cursor:"pointer", background:"none", border:"none", padding:0, fontFamily:"inherit" };
    if (l.action === "scroll") {
      return <button key={l.label} onClick={() => scrollTo(l.id)} style={style}>{l.label}</button>;
    }
    // mailto links must NOT use target="_blank" — it causes a blank black page
    const isMailto = l.href?.startsWith("mailto:");
    const isWhatsApp = l.href?.startsWith("https://wa.me");
    return (
      <a
        key={l.label}
        href={l.href}
        target={isMailto ? "_self" : "_blank"}
        rel={isMailto ? undefined : "noopener noreferrer"}
        style={style}
      >
        {l.label}
      </a>
    );
  };