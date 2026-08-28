import AnnouncementsSection from "@/components/AnnouncementsSection";
import Hero from "@/components/Hero";
import MissionSection from "@/components/MissionSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

/**
 * Home page — the scroll-driven hero, then the mission statements and the
 * announcements, closing on the same footer the content pages carry. Those
 * pages live on their own routes under the (site) route group, which supplies
 * their header and footer; the home page sits outside it and names both
 * itself, passing the header `overlay` so the hero can start at the very top
 * of the document.
 */
export default function Home() {
  return (
    <>
      <SiteHeader overlay />
      <Hero />
      {/* the hairline that lets the hero end before the next thing begins */}
      <section style={{ background: "#ffffff", height: 6 }} />
      <MissionSection />
      <AnnouncementsSection />
      <SiteFooter />
    </>
  );
}
