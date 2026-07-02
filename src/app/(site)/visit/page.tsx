import type { Metadata } from "next";
import Button from "@/components/Button";
import { eyebrow, h2 } from "@/lib/site";

export const metadata: Metadata = {
  title: "Visit",
  description:
    "Join Gofamint Toronto for worship every Sunday at 10:00am, 250 Consumers Rd, North York. Bible study Wednesdays at 7:00pm. There's a seat for you.",
};

export default function VisitPage() {
  return (
    <section style={{ background: "#f5f5f7", padding: "100px 32px" }}>
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
  );
}
