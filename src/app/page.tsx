import ConnectSection from "@/components/ConnectSection";
import HomeIntro from "@/components/HomeIntro";
import MissionSection from "@/components/MissionSection";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

/**
 * Home page — the self-playing hero, then the mission statements and the
 * service times, closing on the same footer the content pages carry. Those
 * pages live on their own routes under the (site) route group, which supplies
 * their header and footer; the home page sits outside it and names both
 * itself, passing the header `overlay` so the hero can start at the very top
 * of the document.
 *
 * About and Visit are no longer pages. The header points at the two sections
 * here that carried what they promised, which is why both are named and hold
 * a scroll margin clear of the header.
 */
export default function Home() {
  return (
    <>
      <SiteHeader overlay />
      <HomeIntro />
      {/* the hairline that lets the hero end before the next thing begins */}
      <section style={{ background: "#ffffff", height: 6 }} />
      <MissionSection />
      <ConnectSection />
      <SiteFooter />
    </>
  );
}
