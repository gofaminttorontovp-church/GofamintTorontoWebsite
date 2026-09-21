import AnnouncementsSection from "@/components/AnnouncementsSection";
import ConnectSection from "@/components/ConnectSection";
import HomeIntro from "@/components/HomeIntro";
import MissionSection from "@/components/MissionSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import UpcomingEventsSection from "@/components/UpcomingEventsSection";

/**
 * Home page — the self-playing hero, then the mission statements, the
 * announcements, what is coming up and the service times, closing on the same footer the content pages carry. Those
 * pages live on their own routes under the (site) route group, which supplies
 * their header and footer; the home page sits outside it and names both
 * itself, passing the header `overlay` so the hero can start at the very top
 * of the document.
 *
 * About, Visit and Events are no longer pages. The header points at the
 * sections here that carry what they promised, which is why each is named and
 * holds a scroll margin clear of the header. Events is two sections, the
 * flyers and the dated list, so the name sits on the wrapper around both.
 */
export default function Home() {
  return (
    <>
      <SiteHeader overlay />
      <HomeIntro />
      {/* the hairline that lets the hero end before the next thing begins */}
      <section style={{ background: "#ffffff", height: 6 }} />
      <MissionSection />
      <div id="events" className="scroll-mt-20 md:scroll-mt-24">
        <AnnouncementsSection />
        <UpcomingEventsSection />
      </div>
      <ConnectSection />
      <SiteFooter />
    </>
  );
}
