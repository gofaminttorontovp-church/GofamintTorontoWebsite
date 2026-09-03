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

/** One row's worth. The row is dragged, so it may be longer than the screen. */
const DEFAULT_LIMIT = 24;

/** Beyond this width a picture is only heavier, never sharper on this page. */
const MAX_USEFUL_WIDTH = 2048;

/**
 * Which tiles in the row are given double width.
 *
 * The reference design mixed wide tiles among square ones, and the first
 * version of this file tried to earn that mix from the photographs: landscape
 * gets the wider tile. It turned out every photograph the church posts is
 * exactly four by three — one camera, held one way — so every tile qualified
 * and the row became twenty-four identical slabs.
 *
 * So the rhythm is set here instead, as the reference set it: by hand. The
 * pattern is seven long rather than four so that it does not fall into step
 * with the eye, and it is fixed rather than random so that the server and the
 * browser lay the row out the same way.
 */
const WIDE_RHYTHM = [true, false, false, false, true, false, false];

type GraphImage = { source: string; width: number; height: number };

type GraphPhoto = {
  id: string;
  name?: string;
  created_time: string;
  images?: GraphImage[];
};

type GraphAlbum = { id: string; type: string };

/**
 * Ask Facebook for something, and treat every failure the same way: as
 * nothing. A page that has lost its photographs should still be a page.
 */
async function graph<T>(path: string, query: Record<string, string>): Promise<T | null> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
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

/** The largest copy that is still worth sending down the wire. */
function bestImage(images: GraphImage[]): GraphImage | null {
  if (images.length === 0) return null;
  const withinReason = images.filter((image) => image.width <= MAX_USEFUL_WIDTH);
  const candidates = withinReason.length > 0 ? withinReason : images;
  return candidates.reduce((widest, image) => (image.width > widest.width ? image : widest));
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Toronto",
  }).format(new Date(iso));
}

function toPhoto(photo: GraphPhoto, index: number): Photo | null {
  const image = bestImage(photo.images ?? []);
  if (!image) return null;

  const date = formatDate(photo.created_time);
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
    // The rhythm decides which tiles are wide; the shape of the picture only
    // gets a veto, so that a portrait is never stretched across two.
    wide: WIDE_RHYTHM[index % WIDE_RHYTHM.length] && image.width > image.height,
  };
}

/**
 * The most recent photographs from the church's Facebook album, newest first.
 * Returns an empty list if Facebook cannot be reached or is not configured;
 * the caller falls back to the photographs kept in the repository.
 */
export async function getFacebookPhotos(limit: number = DEFAULT_LIMIT): Promise<Photo[]> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!pageId) return [];

  const albumId = await wallAlbumId(pageId);
  if (!albumId) return [];

  const photos = await graph<{ data: GraphPhoto[] }>(`${albumId}/photos`, {
    fields: "id,name,created_time,images",
    limit: String(limit),
  });

  // Anything Facebook returns without a usable image is dropped before the
  // rhythm is applied, so the pattern counts the tiles actually drawn.
  return (photos?.data ?? [])
    .filter((photo) => bestImage(photo.images ?? []) !== null)
    .map(toPhoto)
    .filter((photo): photo is Photo => photo !== null);
}
