import Hero from "@/components/Hero";
import SiteHeader from "@/components/SiteHeader";

/**
 * Home page — the scroll-driven hero (the "first section") followed by a
 * small "More to come" placeholder. The About / Visit / Events
 * content lives on its own routes under the (site) route group. The header
 * is the same one those pages use: transparent over the hero sky, settling
 * into its floating pill once the page moves.
 */
export default function Home() {
  return (
    <>
      <SiteHeader overlay />
      <Hero />
      <section style={{ background: "#ffffff", height: 6 }} />
      <section style={{ background: "#281068", padding: "100px 32px", textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 46, fontWeight: 600, letterSpacing: "0", color: "#ffffff" }}>
          More to come
        </p>
      </section>
    </>
  );
}
