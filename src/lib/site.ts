import type { CSSProperties } from "react";

/** Primary navigation — shared by the hero header, the site header, and the footer. */
export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/visit", label: "Visit" },
  { href: "/sermons", label: "Sermons" },
  { href: "/events", label: "Events" },
  { href: "/media", label: "Media" },
  { href: "/groups", label: "Groups" },
] as const;

/** Small uppercase section eyebrow (e.g. "ABOUT"). */
export const eyebrow: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.12em",
  color: "#7a7a7a",
};

/** Section headline on a light surface. */
export const h2: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: 40,
  fontWeight: 600,
  letterSpacing: "-0.01em",
  color: "#1d1d1f",
};
