import Hero from "@/components/Hero";
import Button from "@/components/Button";

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.12em",
  color: "#7a7a7a",
};

const h2: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: 40,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: "#1d1d1f",
};

export default function Home() {
  return (
    <div style={{ fontFamily: "var(--font-text)", color: "#1d1d1f", background: "#ffffff" }}>
      <Hero />

      {/* ============ ABOUT ============ */}
      <section id="about" style={{ background: "#ffffff", padding: "100px 32px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <div style={eyebrow}>ABOUT</div>
          <h2 style={h2}>A place to belong.</h2>
          <p style={{ margin: 0, fontSize: 21, fontWeight: 300, lineHeight: 1.6, color: "#333333", textWrap: "pretty" }}>
            We are a parish of The Gospel Faith Mission International in the heart of Toronto — one family gathered around the Word, worship, and one another. Come as you are.
          </p>
        </div>
      </section>

      {/* ============ VISIT ============ */}
      <section id="visit" style={{ background: "#f5f5f7", padding: "100px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 64, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={eyebrow}>VISIT</div>
            <h2 style={h2}>Sundays, together.</h2>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "#333333", textWrap: "pretty" }}>
              Join us for worship every Sunday. There&apos;s a seat for you — and coffee after the service.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: "#1d1d1f" }}>Sunday service · 10:00am</div>
              <div style={{ fontSize: 17, color: "#7a7a7a" }}>Bible study · Wednesdays, 7:00pm</div>
              <div style={{ fontSize: 17, color: "#7a7a7a" }}>250 Consumers Rd, North York, ON</div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <Button variant="primary">Plan your visit</Button>
              <Button variant="secondary" href="https://maps.google.com/?q=250+Consumers+Rd,+North+York,+ON">Get directions</Button>
            </div>
          </div>
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/cn-tower.jpg"
              alt="The CN Tower against a blue Toronto sky"
              style={{ display: "block", width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: 18, boxShadow: "var(--shadow-product)" }}
            />
          </div>
        </div>
      </section>

      {/* ============ SERMONS ============ */}
      <section
        id="sermons"
        style={{ position: "relative", minHeight: "72vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", backgroundImage: "url('/sermons-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.35))" }} />
        <div style={{ position: "relative", maxWidth: 760, padding: "100px 32px", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", color: "#cccccc" }}>SERMONS</div>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, letterSpacing: "-0.01em", color: "#ffffff", textWrap: "balance" }}>
            Worship with us, wherever you are.
          </h2>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "#cccccc" }}>
            Missed a Sunday? Every message is online — watch live or catch up during the week.
          </p>
          <div style={{ marginTop: 8 }}>
            <Button variant="primary">Watch online</Button>
          </div>
        </div>
      </section>

      {/* ============ EVENTS ============ */}
      <section id="events" style={{ background: "#ffffff", padding: "100px 32px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={eyebrow}>EVENTS</div>
            <h2 style={h2}>This month at Gofamint.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[
              { date: "Jul 5", title: "Sunday worship", time: "10:00am", last: false },
              { date: "Jul 10", title: "Night of worship", time: "7:00pm", last: false },
              { date: "Jul 18", title: "Community outreach", time: "10:00am", last: true },
            ].map((e) => (
              <div
                key={e.title}
                style={{ display: "grid", gridTemplateColumns: "96px 1fr auto", gap: 16, alignItems: "baseline", padding: "20px 0", borderTop: "1px solid #e0e0e0", ...(e.last ? { borderBottom: "1px solid #e0e0e0" } : {}) }}
              >
                <div style={{ fontSize: 15, color: "#7a7a7a" }}>{e.date}</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#1d1d1f" }}>{e.title}</div>
                <div style={{ fontSize: 15, color: "#7a7a7a" }}>{e.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer style={{ background: "#000000", color: "#cccccc", padding: "48px 32px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" style={{ width: 36, height: 36, objectFit: "contain" }} />
            <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "#ffffff" }}>Gofamint Toronto</span>
          </div>
          <div style={{ height: 1, background: "rgba(255, 255, 255, 0.15)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ fontSize: 12, color: "#7a7a7a" }}>© 2026 Gofamint Toronto — The Gospel Faith Mission International</div>
            <div style={{ display: "flex", gap: 24 }}>
              <a href="#about" style={{ fontSize: 12, color: "#cccccc" }}>About</a>
              <a href="#visit" style={{ fontSize: 12, color: "#cccccc" }}>Visit</a>
              <a href="#sermons" style={{ fontSize: 12, color: "#cccccc" }}>Sermons</a>
              <a href="#events" style={{ fontSize: 12, color: "#cccccc" }}>Events</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
