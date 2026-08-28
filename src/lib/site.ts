import type { CSSProperties } from "react";

/** Primary navigation — the full set, listed in the footer. */
export const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/visit", label: "Visit" },
  { href: "/events", label: "Events" },
  { href: "/media", label: "Media" },
  { href: "/groups", label: "Groups" },
] as const;

/** The header carries three of those as plain links... */
export const HEADER_LINKS = [
  { href: "/visit", label: "Visit" },
  { href: "/events", label: "Events" },
  { href: "/groups", label: "Groups" },
] as const;

/** ...and promotes About and Media to buttons, spelled out as invitations. */
export const HEADER_CTAS = [
  { href: "/about", label: "Learn About us", variant: "outline" },
  { href: "/media", label: "View our Photos", variant: "default" },
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
