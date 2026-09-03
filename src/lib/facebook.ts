import type { Photo } from "@/components/ui/bento-gallery";

/**
 * The photographs on the Media page, read from the church's Facebook album.
 *
 * Facebook hands us the pictures and nothing else: of a hundred recent
 * photographs, two carried a caption and none carried a description. So the
 * captions here are the only thing we can say truthfully about a picture we
 * have not seen — the day it was posted. Nothing about the occasion is
 * asserted, because nothing about the occasion is known.
 *
 * The image links Facebook returns are signed and die after about five days,
 * which is why they are never written to disk. They are fetched afresh every
 * hour and handed straight to the page.
 */

const GRAPH = "https://graph.facebook.com/v21.0";

/** Facebook's links outlive this many times over; an hour is only tidiness. */
const REVALIDATE_SECONDS = 60 * 60;

/** The most Facebook will hand over at once. */
const PAGE_SIZE = 100;

/**
 * How far back to keep asking. Two weeks of a busy fortnight fits in one or
 * two pages; the cap is only here so that a quiet album — where the fortnight
 * we want is never reached — cannot walk the whole history.
 */
const MAX_PAGES = 4;

/**
 * One row's worth. A week can run to seventy photographs, which is more than
 * a row wants to carry and more than the page wants to load; the rest are a
 * click away on Facebook.
 */
const MAX_PER_ROW = 24;

/** Beyond this width a picture is only heavier, never sharper on this page. */
const MAX_USEFUL_WIDTH = 2048;

/**
 * Which tiles in a row are given double width.
 *
 * The reference design mixed wide tiles among square ones, and the first
 * version of this file tried to earn that mix from the photographs: landscape
 * gets the wider tile. It turned out every photograph the church posts is
 * exactly four by three — one camera, held one way — so every tile qualified
 * and the row became two dozen identical slabs.
 *
 * So the rhythm is set here instead, as the reference set it: by hand. The
 * pattern is seven long rather than four so that it does not fall into step
 * with the eye, and it is fixed rather than random so that the server and the
 * browser lay the row out the same way.
 */
const WIDE_RHYTHM = [true, false, false, false, true, false, false];

/** The church keeps Toronto time, and its week turns on a Sunday. */
const TIME_ZONE = "America/Toronto";

type GraphImage = { source: string; width: number; height: number };

type GraphPhoto = {
  id: string;
  name?: string;
  created_time: string;
  images?: GraphImage[];
};

type GraphAlbum = { id: string; type: string };

type Paged<T> = { data: T[]; paging?: { cursors?: { after?: string } } };

/** A labelled row of photographs on the Media page. */
export type PhotoRow = { key: string; label: string; photos: Photo[] };

/**
 * Ask Facebook for something, and treat every failure the same way: as
 * nothing. A page that has lost its photographs should still be a page.
 *
 * The token is the system user's unless one is handed in — the reels
 * endpoint wants a Page's own, see `pageToken`.
 */
async function graph<T>(
  path: string,
  query: Record<string, string>,
  token: string | undefined = process.env.FACEBOOK_PAGE_ACCESS_TOKEN,
): Promise<T | null> {
  if (!token) return null;

  const url = new URL(`${GRAPH}/${path}`);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);

  try {
    const response = await fetch(url, {
      // The token travels in the header, never in the query string, so it
      // stays out of logs and out of anything that records a URL.
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;

    const body = await response.json();
    return "error" in body ? null : (body as T);
  } catch {
    return null;
  }
}

/**
 * The album a Page's own posts put their pictures in. Facebook calls it the
 * "wall" album; it is the one with everything in it. Asking the Page for
 * `/photos` directly returns the photographs the Page was *tagged* in, which
 * is a different and much smaller set, so we go to the album by name.
 */
async function wallAlbumId(pageId: string): Promise<string | null> {
  const albums = await graph<{ data: GraphAlbum[] }>(`${pageId}/albums`, {
    fields: "id,type",
    limit: "50",
  });
  return albums?.data.find((album) => album.type === "wall")?.id ?? null;
}

/* ------------------------------------------------------------------
   Days and weeks, in Toronto

   Everything here compares calendar days as "YYYY-MM-DD" strings rather than
   as instants. Toronto changes its clocks twice a year, and a string of the
   day it was in Toronto is not something an hour's shift can move.
   ------------------------------------------------------------------ */

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** The day it was in Toronto when this happened, as "YYYY-MM-DD". */
function torontoDay(when: Date): string {
  return dayFormatter.format(when);
}

/** The same day as a UTC noon instant — far enough from either edge that no
 *  clock change can push the arithmetic onto the day before or after. */
function noonUTC(day: string): number {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year, month - 1, date, 12);
}

function toDay(instant: number): string {
  const d = new Date(instant);
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const date = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${month}-${date}`;
}

/** The Sunday on or before the given day. */
function weekStart(day: string): string {
  const noon = noonUTC(day);
  const sinceSunday = new Date(noon).getUTCDay(); // 0 is Sunday
  return toDay(noon - sinceSunday * 86_400_000);
}

/** The day before the given day. */
function dayBefore(day: string): string {
  return toDay(noonUTC(day) - 86_400_000);
}

/* ------------------------------------------------------------------
   Turning Facebook's photographs into the row's
   ------------------------------------------------------------------ */

/** The largest copy that is still worth sending down the wire. */
function bestImage(images: GraphImage[]): GraphImage | null {
  if (images.length === 0) return null;
  const withinReason = images.filter((image) => image.width <= MAX_USEFUL_WIDTH);
  const candidates = withinReason.length > 0 ? withinReason : images;
  return candidates.reduce((widest, image) => (image.width > widest.width ? image : widest));
}

function formatDate(day: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(noonUTC(day)));
}

/** One photograph, or null where Facebook sent no usable image. */
function toPhoto(photo: GraphPhoto): Photo | null {
  const image = bestImage(photo.images ?? []);
  if (!image) return null;

  const date = formatDate(torontoDay(new Date(photo.created_time)));
  // Facebook's own caption, where there is one. Its first line is the part
  // written for a reader; the rest is usually hashtags.
  const caption = photo.name?.split("\n")[0]?.trim() || null;

  return {
    id: photo.id,
    src: image.source,
    // Where a caption exists it is the only description of the picture that
    // anyone has written, so it is what a screen reader is given.
    alt: caption ?? `Photograph from the life of the church, ${date}`,
    title: caption ?? date,
    caption: caption ? date : undefined,
  };
}

/**
 * Lay the rhythm over a row. The shape of each picture only gets a veto, so
 * that a portrait is never stretched across two tiles.
 */
function withRhythm(photos: Photo[], shapes: Map<string, GraphImage>): Photo[] {
  return photos.map((photo, index) => {
    const image = shapes.get(photo.id);
    const landscape = image ? image.width > image.height : false;
    return { ...photo, wide: WIDE_RHYTHM[index % WIDE_RHYTHM.length] && landscape };
  });
}

/* ------------------------------------------------------------------
   The rows
   ------------------------------------------------------------------ */

/**
 * Walk the album newest-first until we have gone past the day we care about,
 * or until the page cap stops us.
 */
async function photosSince(albumId: string, earliestDay: string): Promise<GraphPhoto[]> {
  const collected: GraphPhoto[] = [];
  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const query: Record<string, string> = {
      fields: "id,name,created_time,images",
      limit: String(PAGE_SIZE),
    };
    if (after) query.after = after;

    const response = await graph<Paged<GraphPhoto>>(`${albumId}/photos`, query);
    const batch = response?.data ?? [];
    if (batch.length === 0) break;

    collected.push(...batch);

    // The album is newest-first, so once a page ends before the fortnight
    // begins there is nothing older worth asking for.
    const oldest = batch[batch.length - 1];
    if (torontoDay(new Date(oldest.created_time)) < earliestDay) break;

    after = response?.paging?.cursors?.after;
    if (!after) break;
  }

  return collected;
}

/**
 * This week's photographs and last week's, newest first, as two rows. Weeks
 * turn on a Sunday, so the most recent Sunday service is at the head of "this
 * week" rather than the tail of the week before.
 *
 * Returns an empty list if Facebook cannot be reached or is not configured, or
 * if the fortnight was a quiet one; the caller falls back to the photographs
 * kept in the repository.
 */
export async function getFacebookPhotoRows(): Promise<PhotoRow[]> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!pageId) return [];

  const albumId = await wallAlbumId(pageId);
  if (!albumId) return [];

  const thisWeekStart = weekStart(torontoDay(new Date()));
  const lastWeekStart = weekStart(dayBefore(thisWeekStart));

  const raw = await photosSince(albumId, lastWeekStart);

  // Keep each picture's shape to hand, so the rhythm can decline to widen a
  // portrait without having to carry the dimensions through Photo itself.
  const shapes = new Map<string, GraphImage>();
  for (const photo of raw) {
    const image = bestImage(photo.images ?? []);
    if (image) shapes.set(photo.id, image);
  }

  const rows: PhotoRow[] = [
    { key: "this-week", label: "This week", photos: [] },
    { key: "last-week", label: "Last week", photos: [] },
  ];

  for (const raw_photo of raw) {
    const day = torontoDay(new Date(raw_photo.created_time));
    const row =
      day >= thisWeekStart ? rows[0] : day >= lastWeekStart ? rows[1] : null;
    if (!row || row.photos.length >= MAX_PER_ROW) continue;

    const photo = toPhoto(raw_photo);
    if (photo) row.photos.push(photo);
  }

  return rows
    .filter((row) => row.photos.length > 0)
    .map((row) => ({ ...row, photos: withRhythm(row.photos, shapes) }));
}

/* ------------------------------------------------------------------
   The reels

   Short vertical videos, posted to the Page as reels. Facebook hands over
   a direct MP4 for each — served with byte ranges and open CORS, so a plain
   <video> can play it — along with a poster, a caption and a link back.
   The MP4 links are signed like the photographs' and die on the same
   schedule, so they too are fetched afresh each hour and never kept.
   ------------------------------------------------------------------ */

/**
 * How many reels the page shows, ever. Five, and then Facebook. Each one is
 * a dozen megabytes, so this is a limit on what a visitor is asked to carry
 * as much as on what the page shows.
 */
const REELS_TO_SHOW = 5;

type GraphReel = {
  id: string;
  description?: string;
  source?: string;
  picture?: string;
  permalink_url?: string;
  created_time: string;
  length?: number;
};

/** One short video, ready for the page. */
export type Reel = {
  id: string;
  /** A direct MP4, good for a few days. */
  src: string;
  /** A still from it, to show before it plays. */
  poster: string;
  /** Facebook's own caption. Reels, unlike the photographs, nearly always have one. */
  caption: string | null;
  /** The day it was posted, written out — "3 September 2026". */
  date: string;
  /** The reel on Facebook, for anyone who wants the rest. */
  permalink: string;
  seconds: number;
};

/**
 * The Page's own access token, derived from the system user's.
 *
 * Nearly everything answers to the system-user token. The reels edge is the
 * exception: it refuses a user-type token outright ("a Page access token is
 * required for this call for the new Pages experience"). A Page token can be
 * asked for with the token we have, so we ask, and the hourly cache keeps
 * that to one request an hour rather than one a visit. It is a second
 * secret, but a derived one — nothing new for anyone to keep safe.
 */
async function pageToken(pageId: string): Promise<string | null> {
  const page = await graph<{ access_token?: string }>(pageId, { fields: "access_token" });
  return page?.access_token ?? null;
}

function toReel(reel: GraphReel): Reel | null {
  if (!reel.source || !reel.picture || !reel.permalink_url) return null;

  const caption = reel.description?.trim() || null;
  return {
    id: reel.id,
    src: reel.source,
    poster: reel.picture,
    caption,
    date: formatDate(torontoDay(new Date(reel.created_time))),
    permalink: reel.permalink_url,
    seconds: reel.length ?? 0,
  };
}

/**
 * The five most recent reels, newest first. An empty list when Facebook
 * cannot be reached or is not configured; the section is simply not drawn.
 */
export async function getFacebookReels(): Promise<Reel[]> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!pageId) return [];

  const token = await pageToken(pageId);
  if (!token) return [];

  const reels = await graph<{ data: GraphReel[] }>(
    `${pageId}/video_reels`,
    {
      fields: "id,description,source,picture,permalink_url,created_time,length",
      limit: String(REELS_TO_SHOW),
    },
    token,
  );

  return (reels?.data ?? [])
    .map(toReel)
    .filter((reel): reel is Reel => reel !== null)
    .slice(0, REELS_TO_SHOW);
}
