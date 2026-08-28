"use client";

import { useEffect, useState } from "react";
import { HERO_BACKDROP, HERO_TREATMENTS, type HeroTreatment } from "@/lib/site";

const NAMES = Object.keys(HERO_TREATMENTS) as HeroTreatment[];

const isTreatment = (value: string | null): value is HeroTreatment =>
  value !== null && (NAMES as string[]).includes(value);

/**
 * Which backdrop the hero wears: HERO_BACKDROP, unless a `?bg=` in the URL
 * asks for another — `?bg=mono`, `?bg=dark`, `?bg=photo`, `?bg=shafts` — so
 * the treatments can be compared in the browser instead of by editing a file.
 *
 * A development convenience, and gated to it: NODE_ENV is inlined at build
 * time, so the override folds away to nothing in a production bundle and the
 * deployed page only ever wears what site.ts names. Anything unrecognised in
 * the parameter is ignored rather than trusted.
 *
 * The URL is read after mount rather than through useSearchParams, which
 * would pull the statically rendered home page into dynamic rendering for the
 * sake of a dev tool. The cost is that the default paints for one frame first.
 */
export function useHeroTreatment(): HeroTreatment {
  const [treatment, setTreatment] = useState<HeroTreatment>(HERO_BACKDROP);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const asked = new URLSearchParams(window.location.search).get("bg");
    if (isTreatment(asked)) setTreatment(asked);
  }, []);

  return treatment;
}
