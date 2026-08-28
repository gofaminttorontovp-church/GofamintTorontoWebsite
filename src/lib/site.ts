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
  fontSize: 46,
  fontWeight: 600,
  letterSpacing: "0",
  color: "#1d1d1f",
};

/* ------------------------------------------------------------------
   Hero backdrop — the surface behind the headline and the drawn line.
   ------------------------------------------------------------------ */

export type HeroTreatment = "shafts" | "photo" | "mono" | "dark";

/** Which one the home page wears. Change this line to compare them. */
export const HERO_BACKDROP: HeroTreatment = "dark";

/**
 * The skyline photograph. `flip` mirrors it horizontally — the aerial shot
 * has the CN tower on the left, and the headline wants that side clear.
 * `position` is the object-position, biased so the tower survives the crop
 * on a narrow screen.
 */
export const HERO_PHOTO = {
  src: "/cn_tower.webp",
  flip: false,
  // Biased right of centre: on a narrow screen a 16:9 photo loses most of its
  // width to the crop, and this keeps the tower inside what survives.
  position: "62% 50%",
};

/**
 * Per-treatment surface. `filter` works the photograph itself; `veil` is the
 * wash laid over it; `ink` is the colour the headline and closing line take,
 * since a night sky and a dusk sky do not want the same type; `base` is the
 * colour the foot of the hero settles into on its way to the next section —
 * the logo's indigo for the colour treatments, neutral for the grayscale one.
 */
export const HERO_TREATMENTS = {
  photo: {
    base: "40, 16, 104",
    filter: "saturate(1.05)",
    veil: "linear-gradient(to bottom, rgba(255, 255, 255, 0.52) 0%, rgba(255, 255, 255, 0.34) 45%, rgba(255, 255, 255, 0.12) 100%)",
    ink: "#1d1d1f",
  },
  mono: {
    base: "24, 24, 27",
    filter: "grayscale(1) contrast(1.08) brightness(1.04)",
    veil: "linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 50%, rgba(255, 255, 255, 0.1) 100%)",
    ink: "#1d1d1f",
  },
  dark: {
    base: "40, 16, 104",
    filter: "saturate(0.6) brightness(0.42)",
    veil: "linear-gradient(to bottom, rgba(40, 16, 104, 0.5) 0%, rgba(40, 16, 104, 0.35) 45%, rgba(40, 16, 104, 0.55) 100%)",
    ink: "#ffffff",
  },
  shafts: {
    base: "40, 16, 104",
    filter: undefined,
    veil: "transparent",
    ink: "#1d1d1f",
  },
} as const satisfies Record<HeroTreatment, { base: string; filter?: string; veil: string; ink: string }>;

/* ------------------------------------------------------------------
   Announcements — the flyers the carousel on the home page turns through.
   Add an entry here and it appears; the section reads the length. The pixel
   dimensions are carried alongside each poster because the card is cut to the
   shape of its own flyer, with no margin around it.
   Poster files are referenced with their exact case, which matters on the
   Linux filesystem that builds the deploy even though macOS forgives it.
   ------------------------------------------------------------------ */

export const ANNOUNCEMENTS = [
  {
    id: "august",
    label: "August Declaration",
    image: "/august_declaration.jpeg",
    width: 1646,
    height: 2048,
    title: "August, Our Month of Glorious Jubilation",
    detail:
      "The declaration over the month, given by Pastor (Dr.) Elijah O. Abina, General Overseer of The Gospel Faith Mission International.",
  },
  {
    id: "youth",
    label: "Youth: Back to School",
    image: "/youth.JPG",
    width: 1364,
    height: 2047,
    title: "Shine: Lights in the Classroom and Workplace",
    detail:
      "Back to school prayers and blessings with Gofamint Toronto Youth, on Matthew 5:14 to 16. August 29, 2026 at 10:00am EST, on Zoom. Meeting ID 807 789 4699.",
  },
  {
    id: "mens",
    label: "Men's Conference",
    image: "/mens.jpg",
    width: 1079,
    height: 960,
    title: "The Mandate of a Kingdom Man",
    detail:
      "The 2nd Annual National Men's Conference, on Romans 12:11, with Pastor Sam Adusi and Pastor Adeyemi Sofolahan. Saturday, September 12, 2026 from 1:00pm to 4:00pm EST, on Zoom. Meeting ID 697 148 1978.",
  },
  {
    id: "year",
    label: "Our Year of Good Success",
    image: "/Year_2026.jpg",
    width: 2048,
    height: 1241,
    title: "Our Year of Good Success",
    detail:
      "The anchor for the year: the Lord will perfect that which concerns me; your mercy, O Lord, endures forever; do not forsake the works of your hands.",
  },
] as const;
