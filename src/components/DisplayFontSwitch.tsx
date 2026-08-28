"use client";

import { useDisplayFont } from "@/lib/use-display-font";

/**
 * Renders nothing; exists so the root layout, a server component, can run the
 * development-only `?font=` override. Inert in a production build.
 */
export default function DisplayFontSwitch() {
  useDisplayFont();
  return null;
}
