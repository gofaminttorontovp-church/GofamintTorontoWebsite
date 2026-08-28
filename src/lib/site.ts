import type { CSSProperties } from "react";

/**
 * Primary navigation — the full set, listed in the footer.
 *
 * About and Visit are no longer pages. What they promised now lives on the
 * home page, so they point at the sections that say it: the mission
 * statements and the service times. A hash from another route sends the
 * visitor home and scrolls them there.
 */
export const NAV_LINKS = [
  { href: "/#mission", label: "About" },
  { href: "/#connect", label: "Visit" },
  { href: "/events", label: "Events" },
  { href: "/media", label: "Media" },
  { href: "/groups", label: "Groups" },
] as const;

/** The header carries three of those as plain links... */
export const HEADER_LINKS = [
  { href: "/#connect", label: "Visit" },
  { href: "/events", label: "Events" },
  { href: "/groups", label: "Groups" },
] as const;

/** ...and promotes About and Media to buttons, spelled out as invitations. */
export const HEADER_CTAS = [
  { href: "/#mission", label: "Learn About us", variant: "outline" },
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

/* ------------------------------------------------------------------
   Where and when to find us. One source, so nothing that quotes a time or
   an address can drift from anything else that does.
   ------------------------------------------------------------------ */

/** All times are Eastern. The note is stated once, beneath the list. */
export const SERVICE_TIMES = [
  { name: "Sunday Service", when: "Sundays, 10:00am", lead: true },
  { name: "Morning Prayer", when: "Monday to Saturday, 6:15am" },
  { name: "Bible Study", when: "Tuesdays, 7:00pm" },
  { name: "Prayer Meeting", when: "Fridays, 7:00pm" },
] as const;

export const LOCATION = {
  lines: ["252 Eddystone Avenue", "Toronto, Ontario M3N 1H7"],
  /** One line, for prose and for page descriptions. */
  oneLine: "252 Eddystone Avenue, Toronto, Ontario M3N 1H7",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=252+Eddystone+Avenue+Toronto+Ontario+M3N+1H7",
} as const;

export const CONTACT = {
  phone: "(437) 967-1540",
  phoneHref: "tel:+14379671540",
  email: "gofaminttorontovp@gmail.com",
  emailHref: "mailto:gofaminttorontovp@gmail.com",
} as const;

/** The marks are drawn in the social-links component, keyed by `icon`. */
export const SOCIALS = [
  {
    icon: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/GOFAMINTTORONTO",
    color: "#1877F2",
  },
  {
    icon: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/gofamint_toronto/",
    color: "#E1306C",
  },
  {
    icon: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@gofamint-torontovp4833",
    color: "#FF0000",
  },
] as const;

/**
 * Dated gatherings, newest first, for the list on the Events page.
 *
 * Only what we have a flyer for. The weekly rhythm is in SERVICE_TIMES and is
 * not repeated here; this list is for the things that happen once. Add an
 * entry as each new date is set, and drop it once it has passed.
 */
export const UPCOMING_EVENTS = [
  { date: "Aug 29", title: "Shine: back to school", time: "10:00am" },
  { date: "Sep 12", title: "National Men's Conference", time: "1:00pm" },
  {
    date: "Nov 13",
    title: "Night of worship",
    time: "7:00pm",
    // Seven Fridays, the last of them Christmas Day. Said here rather than
    // as seven near identical rows, and it names what it displaces so that
    // nobody arrives on a Friday expecting the prayer meeting.
    note: "Every Friday to December 25, in place of the Friday prayer meeting",
  },
] as const;

/* ------------------------------------------------------------------
   The groups, in the order the Groups page lists them: the pastor first,
   then the choir, then the four ministries. Each carries the person who
   leads it, except the choir, which is listed as the body it is.

   The photographs are cropped square and, where the original had a
   congregation or a street behind the subject, the background is blurred so
   the person the row is about is the person you look at. `alt` describes the
   picture; the name and the group are already in the markup beside it, so it
   does not repeat them.

   `role` is only carried where it says something the group heading does not.
   Naming Pastor Israel "Men's Ministry" directly under a heading that already
   reads MEN'S MINISTRY prints the same words twice, so those entries leave it
   off and the heading does the work.
   ------------------------------------------------------------------ */

export const GROUPS = [
  {
    id: "pastor",
    group: "Pastor",
    name: "Pastor Sam Adusi",
    role: "Head Pastor",
    image: "/groups/pastor-sam-adusi.jpg",
    alt: "Pastor Sam Adusi outdoors in a dark suit and red tie",
    description:
      "Pastor Samuel Adusi leads Gofamint Toronto and preaches on Sunday mornings. If you are visiting for the first time, or you would like someone to pray with you, ask for him.",
  },
  {
    id: "choir",
    group: "Choir",
    image: "/groups/choir.jpg",
    alt: "The choir gathered outside the church in blue",
    description:
      "The choir leads the singing on a Sunday morning, and at the conventions and conferences the church takes part in through the year. If you sing or play, say so after a service, and there is room.",
  },
  {
    id: "men",
    group: "Men's Ministry",
    name: "Pastor Israel Sofolahan",
    image: "/groups/pastor-israel-sofolahan.jpg",
    alt: "Pastor Israel Sofolahan in a navy suit and gold tie",
    description:
      "The men meet to pray for one another and to talk plainly about work, marriage and fatherhood. Their largest gathering of the year is the National Men's Conference.",
  },
  {
    id: "women",
    group: "Women's Ministry",
    name: "Deaconess Grace Adusi",
    image: "/groups/deaconess-grace-adusi.jpg",
    alt: "Deaconess Grace Adusi worshipping during a service",
    description:
      "The women pray for the church and look after the people in it, from the mother with a newborn to the sister who arrived in Toronto last month. Whatever season you are in, you are welcome.",
  },
  {
    id: "youth",
    group: "Youth",
    name: "Sister Ebunoluwa",
    image: "/groups/sister-ebunoluwa-sofolahan.jpg",
    alt: "Sister Ebunoluwa outside the church on a bright afternoon",
    description:
      "Students and young adults, meeting to study together and to work out what following Christ looks like in a classroom and a first job. Some of it happens on Zoom, so distance is no reason to stay away.",
  },
  {
    id: "children",
    group: "Children's Ministry",
    name: "Ms. Obadaki",
    image: "/groups/ms-obadaki.jpg",
    alt: "Ms. Obadaki in a grey blazer at the Gofamint Canada convention",
    description:
      "The children are taught on a Sunday in a way that is theirs, rather than a shortened version of what the adults are given. Bring them. They are expected, not merely tolerated.",
  },
] as const;
