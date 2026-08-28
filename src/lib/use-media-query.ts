"use client";

import { useEffect, useState } from "react";

/**
 * Whether a media query currently matches.
 *
 * Starts false and settles on mount, because the server has no viewport to
 * measure and guessing one would mean a hydration mismatch. Callers should
 * therefore treat false as the mobile case, which is the layout that reads
 * acceptably at any width if it paints for a frame at the wrong one.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
