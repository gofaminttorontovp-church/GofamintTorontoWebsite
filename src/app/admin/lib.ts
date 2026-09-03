"use client";

/** Client-side helpers for the editing tool. */

/** A short, filesystem-safe name from whatever the phone called the file. */
export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "photo"
  );
}

export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export type ResizedImage = {
  /** Base64 without the data: prefix, ready for the upload endpoint. */
  base64: string;
  /** A data URL for showing the picked image immediately. */
  dataUrl: string;
  width: number;
  height: number;
};

const MAX_DIMENSION = 1800;
const JPEG_QUALITY = 0.85;

/**
 * Shrink a picked photo to web size in the browser, so a 12 MB phone
 * photograph goes over the wire as a few hundred kilobytes. Also the step
 * that turns whatever format the phone had (HEIC included, where the
 * browser can read it) into a plain JPEG the site can serve anywhere.
 */
export async function resizeImage(file: File): Promise<ResizedImage> {
  const bitmap = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare the image");
  context.drawImage(bitmap, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  if (base64.length < 100) throw new Error("The image could not be read");
  return { base64, dataUrl, width, height };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(
        new Error(
          "That photo couldn't be opened. If it is an HEIC file, please convert it to JPG first (or take the screenshot route).",
        ),
      );
    image.src = url;
  });
}

/* ---------------------------------------------------------------
   API calls
   --------------------------------------------------------------- */

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin${path}`, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Something went wrong. Please try again.");
  }
  return body;
}

export function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 2) return "just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? "an hour ago" : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

/** Pull a YouTube video id out of a pasted link, or pass an id through. */
export function parseYouTubeId(input: string): string {
  const text = input.trim();
  const patterns = [
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{6,20})/,
    /youtu\.be\/([a-zA-Z0-9_-]{6,20})/,
    /youtube\.com\/(?:shorts|live|embed)\/([a-zA-Z0-9_-]{6,20})/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return text;
}
