import type { Metadata } from "next";
import { eyebrow, h2 } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description: "What's on this month at Gofamint Toronto — Sunday worship, nights of worship, and community outreach.",
};

const EVENTS = [
  { date: "Jul 5", title: "Sunday worship", time: "10:00am", last: false },
  { date: "Jul 10", title: "Night of worship", time: "7:00pm", last: false },
  { date: "Jul 18", title: "Community outreach", time: "10:00am", last: true },
];

export default function EventsPage() {
  return (
    <section style={{ background: "#ffffff", padding: "100px 32px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={eyebrow}>EVENTS</div>
          <h2 style={h2}>This month at Gofamint.</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {EVENTS.map((e) => (
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
  );
}
