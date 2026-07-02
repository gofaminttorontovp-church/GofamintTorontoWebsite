import type { Metadata } from "next";
import { eyebrow, h2 } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Gofamint Toronto is a parish of The Gospel Faith Mission International in the heart of Toronto — one family gathered around the Word, worship, and one another.",
};

export default function AboutPage() {
  return (
    <section style={{ background: "#ffffff", padding: "100px 32px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
        <div style={eyebrow}>ABOUT</div>
        <h2 style={h2}>A place to belong.</h2>
        <p style={{ margin: 0, fontSize: 21, fontWeight: 300, lineHeight: 1.6, color: "#333333", textWrap: "pretty" }}>
          We are a parish of The Gospel Faith Mission International in the heart of Toronto — one family gathered around the Word, worship, and one another. Come as you are.
        </p>
      </div>
    </section>
  );
}
