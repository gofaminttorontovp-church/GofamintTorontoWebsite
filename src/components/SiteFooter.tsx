import Link from "next/link";
import { NAV_LINKS } from "@/lib/site";

/** Shared black footer for the content pages. */
export default function SiteFooter() {
  return (
    <footer style={{ background: "#000000", color: "#cccccc", padding: "48px 32px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" style={{ width: 36, height: 36, objectFit: "contain" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "#ffffff" }}>Gofamint Toronto</span>
        </Link>
        <div style={{ height: 1, background: "rgba(255, 255, 255, 0.15)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontSize: 12, color: "#7a7a7a" }}>© 2026 Gofamint Toronto — The Gospel Faith Mission International</div>
          <div style={{ display: "flex", gap: 24 }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} style={{ fontSize: 12, color: "#cccccc" }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
