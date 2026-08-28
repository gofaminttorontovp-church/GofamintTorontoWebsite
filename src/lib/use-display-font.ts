"use client";

import { useEffect } from "react";
import { DISPLAY_FONT, DISPLAY_FONTS, type DisplayFont } from "@/lib/site";

const NAMES = Object.keys(DISPLAY_FONTS) as DisplayFont[];

const isFont = (value: string | null): value is DisplayFont =>
  value !== null && (NAMES as string[]).includes(value);

/**
 * Points --font-display at whichever candidate `?font=` names — ?font=fraunces,
 * ?font=cormorant, and so on — so display faces can be tried on in the browser
 * rather than by editing the layout and waiting for a reload.
 *
 * Development only, and gated the same way as the backdrop override: NODE_ENV
 * is inlined at build time, so this folds away entirely in a production bundle
 * and the deployed site wears DISPLAY_FONT and nothing else. An unrecognised
 * value is ignored.
 */
export function useDisplayFont() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const asked = new URLSearchParams(window.location.search).get("font");
    const name: DisplayFont = isFont(asked) ? asked : DISPLAY_FONT;
    document.documentElement.style.setProperty(
      "--font-display",
      `var(${DISPLAY_FONTS[name]}), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
    );
  }, []);
}
