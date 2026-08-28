import Hero from "@/components/Hero";
import MissionSection from "@/components/MissionSection";
import SiteHeader from "@/components/SiteHeader";

/**
 * Home page — the scroll-driven hero, then the mission statements. The
 * About / Visit / Events content lives on its own routes under the (site)
 * route group. The header is the same one those pages use, passed `overlay`
 * so the hero can start at the very top of the document.
 */
export default function Home() {
  return (
    <>
      <SiteHeader overlay />
      <Hero />
      {/* the hairline that lets the hero end before the next thing begins */}
      <section style={{ background: "#ffffff", height: 6 }} />
      <MissionSection />
    </>
  );
}
