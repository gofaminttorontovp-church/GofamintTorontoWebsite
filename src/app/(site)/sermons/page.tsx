import type { Metadata } from "next";
import Button from "@/components/Button";

export const metadata: Metadata = {
  title: "Sermons",
  description:
    "Missed a Sunday? Every Gofamint Toronto message is online — watch live or catch up during the week.",
};

export default function SermonsPage() {
  return (
    <section
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
  );
}
