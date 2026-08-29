import type { SiteContent } from "@/lib/content";

/**
 * What the editing tool is allowed to write, checked on the server.
 *
 * Two gates. Uploaded files may only land in the image folders, under safe
 * names, as image types, within a size cap. And the content JSON must match
 * the shape the site actually reads — the right sections, the right fields,
 * text of sane length — so a mangled payload can never produce a branch that
 * breaks the build. The same allowlist is applied again before merging, to
 * the pull request's real file list.
 */

export const CONTENT_FILE = "content/site-content.json";

/** Folders an upload may land in. Everything else in the repo is off limits. */
const IMAGE_DIRS = ["public/photos", "public/groups", "public/announcements", "public/hero"];

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp)$/;

/** ~8 MB decoded — far above what the client sends after compression. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function isAllowedImagePath(path: string): boolean {
  if (path.includes("..") || path.includes("//") || path.startsWith("/")) return false;
  if (!IMAGE_EXTENSIONS.test(path)) return false;
  const dir = path.slice(0, path.lastIndexOf("/"));
  if (!IMAGE_DIRS.includes(dir)) return false;
  const name = path.slice(path.lastIndexOf("/") + 1);
  return /^[a-z0-9][a-z0-9._-]*$/i.test(name);
}

/** May this path appear in one of the tool's pull requests? */
export function isAllowedPRPath(path: string): boolean {
  return path === CONTENT_FILE || isAllowedImagePath(path);
}

/* ---------------------------------------------------------------
   Content shape
   --------------------------------------------------------------- */

const MAX_TEXT = 2000;
const MAX_ITEMS = 200;

type Check = (value: unknown) => string | null;

const isText =
  (label: string, { required = true, max = MAX_TEXT } = {}): Check =>
  (value) => {
    if (value === undefined || value === null) return required ? `${label} is missing` : null;
    if (typeof value !== "string") return `${label} must be text`;
    if (required && !value.trim()) return `${label} is empty`;
    if (value.length > max) return `${label} is too long`;
    return null;
  };

const isImageRef = (label: string): Check => (value) => {
  if (typeof value !== "string" || !value.startsWith("/") || value.includes("..")) {
    return `${label} must be a site image path`;
  }
  return null;
};

const isNumber = (label: string): Check => (value) =>
  typeof value === "number" && Number.isFinite(value) && value > 0 && value < 20000
    ? null
    : `${label} must be a sensible number`;

function checkList(
  section: string,
  list: unknown,
  fields: Record<string, Check>,
): string | null {
  if (!Array.isArray(list)) return `${section} must be a list`;
  if (list.length > MAX_ITEMS) return `${section} has too many entries`;
  for (const [index, item] of list.entries()) {
    if (typeof item !== "object" || item === null) return `${section} #${index + 1} is not an entry`;
    const record = item as Record<string, unknown>;
    for (const [field, check] of Object.entries(fields)) {
      const error = check(record[field]);
      if (error) return `${section} #${index + 1}: ${error}`;
    }
    for (const key of Object.keys(record)) {
      if (!(key in fields)) return `${section} #${index + 1}: unexpected field "${key}"`;
    }
  }
  return null;
}

/** Returns an error message, or null if the content is safe to commit. */
export function validateContent(content: unknown): string | null {
  if (typeof content !== "object" || content === null) return "Content is not an object";
  const record = content as Record<string, unknown>;

  const known = [
    "heroImage",
    "announcements",
    "serviceTimes",
    "upcomingEvents",
    "groups",
    "videos",
    "photos",
  ];
  for (const key of Object.keys(record)) {
    if (!known.includes(key)) return `Unexpected section "${key}"`;
  }
  for (const key of known) {
    if (!(key in record)) return `Missing section "${key}"`;
  }

  const heroError = isImageRef("Hero image")(record.heroImage);
  if (heroError) return heroError;

  return (
    checkList("Announcements", record.announcements, {
      id: isText("id", { max: 100 }),
      label: isText("label", { max: 100 }),
      image: isImageRef("image"),
      width: isNumber("width"),
      height: isNumber("height"),
      title: isText("title", { max: 300 }),
      detail: isText("detail"),
    }) ??
    checkList("Service times", record.serviceTimes, {
      name: isText("name", { max: 100 }),
      when: isText("when", { max: 200 }),
      lead: (value) =>
        value === undefined || typeof value === "boolean" ? null : "lead must be true or false",
    }) ??
    checkList("Events", record.upcomingEvents, {
      date: isText("date", { max: 60 }),
      title: isText("title", { max: 200 }),
      time: isText("time", { max: 60 }),
      note: isText("note", { required: false, max: 500 }),
    }) ??
    checkList("Groups", record.groups, {
      id: isText("id", { max: 100 }),
      group: isText("group", { max: 100 }),
      name: isText("name", { required: false, max: 150 }),
      role: isText("role", { required: false, max: 150 }),
      image: isImageRef("photo"),
      alt: isText("photo description", { max: 500 }),
      description: isText("description"),
    }) ??
    checkList("Videos", record.videos, {
      id: (value) =>
        typeof value === "string" && /^[a-zA-Z0-9_-]{6,20}$/.test(value)
          ? null
          : "YouTube link or ID doesn't look right",
      kind: isText("kind", { max: 60 }),
      title: isText("title", { max: 200 }),
      credit: isText("credit", { required: false, max: 300 }),
    }) ??
    checkList("Photos", record.photos, {
      id: isText("id", { max: 100 }),
      src: isImageRef("photo"),
      alt: isText("photo description", { max: 500 }),
      title: isText("title", { max: 200 }),
      caption: isText("caption", { max: 500 }),
    })
  );
}

/** Cast after validation, for callers that need the typed shape. */
export function asSiteContent(content: unknown): SiteContent {
  const error = validateContent(content);
  if (error) throw new Error(error);
  return content as SiteContent;
}
