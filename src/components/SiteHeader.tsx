"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/site";

/**
 * Sticky, frosted site header for the content pages (About / Visit / Events).
 * The current page's link is shown in the accent colour. The home
 * page uses its own transparent header baked into the hero instead.
 */
export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 32px",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "var(--blur-frosted)",
        WebkitBackdropFilter: "var(--blur-frosted)",
        borderBottom: "1px solid var(--input-border)",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Gofamint Toronto logo" style={{ width: 40, height: 40, objectFit: "contain" }} />
        <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: "#1d1d1f" }}>
          Gofamint Toronto
        </span>
      </Link>
      <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {NAV_LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 14,
                color: active ? "var(--accent)" : "#1d1d1f",
                fontWeight: active ? 600 : 400,
                opacity: active ? 1 : 0.85,
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
