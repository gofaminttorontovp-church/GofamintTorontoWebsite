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
      <main style={{ flex: 1 }}>{children}</main>
      <SiteFooter />
    </div>
  );
}
