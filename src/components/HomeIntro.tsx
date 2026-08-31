"use client";

import { useCallback, useState } from "react";
import Hero from "@/components/Hero";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * The opening of the home page: the loading screen, and the hero it lifts off.
 *
 * The two are paired here rather than in the page so the page can stay a
 * server component. The screen counts 0 → 100 while the hero's photograph and
 * the first dove frames land, and hands over on the way out — the hero's first
 * red stroke is already moving as the curtain dissolves, which is the whole
 * point: nothing about the site should look like it is waiting on itself.
 *
 * When the screen decides not to show at all — a visitor arriving at
 * /#mission, or coming back home from Events — it calls back immediately and
 * the hero simply begins.
 */
export default function HomeIntro() {
  const [started, setStarted] = useState(false);
  const begin = useCallback(() => setStarted(true), []);

  return (
    <>
      <LoadingScreen onDone={begin} />
      <Hero start={started} />
    </>
  );
}
