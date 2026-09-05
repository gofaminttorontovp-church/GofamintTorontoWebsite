"use client";

import { useCallback, useState } from "react";
import Hero from "@/components/Hero";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * The opening of the home page: the loading screen, and the hero it uncovers.
 *
 * The two are paired here rather than in the page so the page can stay a
 * server component — a server component cannot hand a callback to a client
 * one, and the screen has to say when it is done.
 *
 * The hero is nearly all still now, but not quite: "The Word" writes itself
 * out a beat after the curtain lifts, and it should be doing that in front of
 * somebody rather than behind a screen still counting. So the state is here
 * again. When the screen decides not to show at all — a visitor arriving at
 * /#mission, or coming back home from Events — it calls back immediately.
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
