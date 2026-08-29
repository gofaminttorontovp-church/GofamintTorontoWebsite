import type { Metadata } from "next";
import AnnouncementsSection from "@/components/AnnouncementsSection";
import { eyebrow, h2, UPCOMING_EVENTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Events",
  description:
    "What is coming up at Gofamint Toronto: the youth service, the men's conference, the night of worship every Friday from November 13, and the announcements the church is carrying.",
};

export default function EventsPage() {
  return (
    <>
      {/* The flyers open the page. They are the things with a date on them
          that a visitor is most likely to have come for, and they carry the
          word the church is standing on this month besides. The list of what
          is coming up follows, as the plain reference version of the same. */}
      <AnnouncementsSection />
      <section style={{ background: "#ffffff", padding: "100px 32px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={eyebrow}>EVENTS</div>
            <h2 style={h2}>What is coming up.</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {UPCOMING_EVENTS.map((event, index) => (
              /* A phone gives the title the full width and sets the date and
                 the time above it, rather than squeezing three columns into
                 375px and wrapping a recurrence over five lines. */
              <div
                key={event.title}
                className="grid grid-cols-2 gap-x-4 gap-y-1 py-5 md:grid-cols-[96px_1fr_auto] md:items-baseline md:gap-4"
                style={{
                  borderTop: "1px solid #e0e0e0",
                  ...(index === UPCOMING_EVENTS.length - 1 ? { borderBottom: "1px solid #e0e0e0" } : {}),
                }}
              >
                <div className="col-start-1 row-start-1" style={{ fontSize: 15, color: "#7a7a7a" }}>
                  {event.date}
                </div>
                <div className="col-span-2 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1">
                  <div style={{ fontSize: 17, fontWeight: 600, color: "#1d1d1f" }}>{event.title}</div>
                  {"note" in event && event.note ? (
                    <div style={{ fontSize: 15, color: "#7a7a7a", marginTop: 4 }}>{event.note}</div>
                  ) : null}
                </div>
                <div
                  className="col-start-2 row-start-1 text-right md:col-start-3 md:text-left"
                  style={{ fontSize: 15, color: "#7a7a7a" }}
                >
                  {event.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
