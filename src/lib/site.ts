import type { CSSProperties } from "react";
import { SITE_CONTENT } from "./content";

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
  { href: "/media", label: "View our Media", variant: "default" },
] as const;

/**
 * Small uppercase section eyebrow (e.g. "ABOUT").
 *
 * The colours are the tokens rather than the hex they resolve to, so a
 * section that re-points its ink — `.section-dark` — carries these with it.
 * On every light section they are the same #7a7a7a and #1d1d1f as before.
 */
export const eyebrow: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.12em",
  color: "var(--ink-48)",
};

/** Section headline, on whichever surface the section sets. */
export const h2: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: 46,
  fontWeight: 600,
  letterSpacing: "0",
  color: "var(--ink)",
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
  // The file itself is editable from /admin (content/site-content.json);
  // the flip and the crop bias stay design decisions, made here.
  src: SITE_CONTENT.heroImage,
  flip: false,
  // Biased right of centre: on a narrow screen a 16:9 photo loses most of its
  // width to the crop, and this keeps the tower inside what survives.
  position: "62% 50%",
};

/**
 * The choir, singing — what the hero actually plays behind the welcome.
 *
 * The skyline above is still what the "photo", "mono" and "dark" treatments
 * are written against, and HERO_PHOTO stays for them; this is the moving
 * version of the same slot. The clip carries no audio track — it was stripped
 * rather than muted, so there is nothing to unmute and nothing to download —
 * and it is encoded with the index at the front so it starts on the first
 * chunk instead of the last.
 *
 * `poster` is a still from three seconds in. It stands in before the video can
 * play, and it is the whole backdrop for a visitor who has asked for reduced
 * motion.
 */
export const HERO_VIDEO = {
  src: "/home-video.mp4",
  poster: "/home-video-poster.jpg",
  // Faces sit a little above the middle of the frame, and a tall phone crops
  // a 16:9 clip hard, so the crop is biased up to keep them in what survives.
  position: "50% 42%",
};

/**
 * Per-treatment surface. `filter` works the footage itself; `veil` is the
 * wash laid over it; `ink` is the colour the headline and closing line take,
 * since a night sky and a dusk sky do not want the same type; `base` is the
 * colour the foot of the hero settles into on its way to the next section —
 * #1e123b for the colour treatments, neutral for the grayscale one. It was
 * the logo's indigo, #281068, which read too blue against the choir.
 */
export const HERO_TREATMENTS = {
  photo: {
    base: "30, 18, 59",
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
    base: "30, 18, 59",
    filter: "saturate(0.6) brightness(0.42)",
    veil: "linear-gradient(to bottom, rgba(40, 16, 104, 0.5) 0%, rgba(40, 16, 104, 0.35) 45%, rgba(40, 16, 104, 0.55) 100%)",
    ink: "#ffffff",
  },
  shafts: {
    base: "30, 18, 59",
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

export const ANNOUNCEMENTS = SITE_CONTENT.announcements;

/* ------------------------------------------------------------------
   Where and when to find us. One source, so nothing that quotes a time or
   an address can drift from anything else that does.
   ------------------------------------------------------------------ */

/** All times are Eastern. The note is stated once, beneath the list. */
export const SERVICE_TIMES = SITE_CONTENT.serviceTimes;

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

/** The channel the video gallery draws from, and the mark in the footer row. */
export const YOUTUBE_CHANNEL = "https://www.youtube.com/@gofamint-torontovp4833";

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
    href: YOUTUBE_CHANNEL,
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
export const UPCOMING_EVENTS = SITE_CONTENT.upcomingEvents;

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

export const GROUPS = SITE_CONTENT.groups;

/* ------------------------------------------------------------------
   The YouTube gallery on the Media page.

   Each entry is only an id and the words that go under the poster; the
   poster itself is YouTube's own thumbnail for that id, so nothing has to be
   exported, resized or committed here when a video is added. `kind` is the
   small label above the title, and `credit` names whoever the video belongs
   to — the preacher for a sermon, the singers for a ministration — and is
   left off where the video is the whole congregation.

   Newest at the top is not the order here; the row is arranged so the two
   sermons fall where a visitor scanning the grid will meet them.
   ------------------------------------------------------------------ */

export const VIDEOS = SITE_CONTENT.videos;

/* ------------------------------------------------------------------
   The photographs on the Media page, taken from the Facebook album.

   Two occasions: a service, under the blue light of the platform, and an
   afternoon out in the plaza with the families who came. They are square
   because the album's own copies are square, 414px a side, so the row is
   built of equal tiles rather than the wide-and-narrow mix the format allows
   — a wide tile would have to crop and enlarge a square to fill itself.

   The captions speak of the people in them as the church's own — our members,
   our women, our children — rather than counting them off as strangers in a
   frame. What they claim is still only what is visible: where a name or an
   occasion cannot be seen in the picture, it is not asserted here.
   ------------------------------------------------------------------ */

export const FACEBOOK_PHOTOS = "https://www.facebook.com/GOFAMINTTORONTO/photos";

export const PHOTOS = SITE_CONTENT.photos;
