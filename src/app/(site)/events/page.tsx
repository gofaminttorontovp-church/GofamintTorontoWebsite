import type { Metadata } from "next";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import { eyebrow, h2, UPCOMING_EVENTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description:
    "What is coming up at Gofamint Toronto: the dates for the youth service, the men's conference, and the announcements the church is carrying.",
};

export default function EventsPage() {
  return (
    <>
      <section style={{ background: "#ffffff", padding: "100px 32px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={eyebrow}>EVENTS</div>
            <h2 style={h2}>What is coming up.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {UPCOMING_EVENTS.map((event, index) => (
              <div
                key={event.title}
                style={{
                  display: "grid",
                  gridTemplateColumns: "96px 1fr auto",
                  gap: 16,
                  alignItems: "baseline",
                  padding: "20px 0",
                  borderTop: "1px solid #e0e0e0",
                  ...(index === UPCOMING_EVENTS.length - 1 ? { borderBottom: "1px solid #e0e0e0" } : {}),
                }}
              >
                <div style={{ fontSize: 15, color: "#7a7a7a" }}>{event.date}</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#1d1d1f" }}>{event.title}</div>
                <div style={{ fontSize: 15, color: "#7a7a7a" }}>{event.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* the flyers, which belong with what is coming up rather than on the
          home page where they used to sit */}
      <AnnouncementsSection />
    </>
  );
}
