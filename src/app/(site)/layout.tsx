import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

/**
 * Shared chrome for the content pages (About / Visit / Events):
 * a sticky frosted header on top and the black footer at the bottom. The
 * home page sits outside this group and keeps its own hero header.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-text)", color: "#1d1d1f", background: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <SiteHeader />
      {/* A column, so a page shorter than the window can tell its section to
          grow into the space left over. Without that the wrapper's white
          shows through under a dark section, as a band above the footer. */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</main>
      <SiteFooter />
    </div>
  );
}
