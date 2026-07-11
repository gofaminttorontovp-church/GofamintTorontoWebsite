import type { Metadata } from "next";
import { eyebrow, h2 } from "@/lib/site";

export const metadata: Metadata = {
  title: "Media",
};

export default function MediaPage() {
  return (
    <section style={{ background: "#ffffff", padding: "100px 32px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
        <div style={eyebrow}>MEDIA</div>
        <h2 style={h2}>Media</h2>
      </div>
    </section>
  );
}
