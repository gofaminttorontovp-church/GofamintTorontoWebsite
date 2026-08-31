import raw from "../../content/site-content.json";

/**
 * The editable half of the site, and its shape.
 *
 * Everything in content/site-content.json is content someone on the media
 * team can change from /admin without touching code: the flyers, the times,
 * the events, the groups, the videos and the photographs. Everything that is
 * design — colours, layout, the hero treatments — stays in site.ts, where
 * only a developer reaches it.
 *
 * The admin tool edits the JSON on a branch and opens a pull request; nothing
 * lands here until it is approved and merged, at which point Vercel rebuilds
 * the site from main with the new file baked in.
 */

export type Announcement = {
  id: string;
  label: string;
  image: string;
  width: number;
  height: number;
  title: string;
  detail: string;
};

export type ServiceTime = {
  name: string;
  when: string;
  lead?: boolean;
};

export type UpcomingEvent = {
  date: string;
  title: string;
  time: string;
  note?: string;
};

export type Group = {
  id: string;
  group: string;
  name?: string;
  role?: string;
  image: string;
  alt: string;
  description: string;
};

export type Video = {
  id: string;
  kind: string;
  title: string;
  credit?: string;
};

export type Photo = {
  id: string;
  src: string;
  alt: string;
  title: string;
  caption: string;
};

export type SiteContent = {
  announcements: Announcement[];
  serviceTimes: ServiceTime[];
  upcomingEvents: UpcomingEvent[];
  groups: Group[];
  videos: Video[];
  photos: Photo[];
};

export const SITE_CONTENT: SiteContent = raw;
