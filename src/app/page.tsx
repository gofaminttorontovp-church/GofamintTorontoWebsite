import Hero from "@/components/Hero";

/**
 * Home page — the scroll-driven hero (the "first section") followed by a
 * small "More to come" placeholder. The About / Visit / Sermons / Events
 * content lives on its own routes under the (site) route group.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <section style={{ background: "#ffffff", height: 6 }} />
      <section style={{ background: "#281068", padding: "100px 32px", textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, letterSpacing: "-0.01em", color: "#ffffff" }}>
          More to come
        </p>
      </section>
    </>
  );
}
