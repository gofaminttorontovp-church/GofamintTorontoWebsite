"use client";

import { useEffect, useRef, useState } from "react";
import HeroBackdrop from "@/components/HeroBackdrop";
import { HERO_TREATMENTS } from "@/lib/site";
import { useHeroTreatment } from "@/lib/use-hero-treatment";
import { TYPE_RUN_MS, wordFrame } from "@/lib/hero-typing";

/**
 * The hero: the choir singing behind the welcome, and one word written out.
 *
 * There was a longer performance here once. A brand-red line swept in above
 * the headline, curved down beneath it and retracted into "Toronto" as that
 * word was written letter by letter; the sentence underneath then rose into
 * place and "The Word" typed itself out at the end of it. The line is gone,
 * and "Toronto"'s writing went with it — that writing was the second half of
 * the line's own gesture, so a caret spelling the city out with no line to
 * retract would have been the tail of a movement whose head had been cut off.
 * The sentence no longer rises either. It is simply there.
 *
 * What is left is the last beat of it: "The Word" still writes itself, on its
 * own, a moment after the curtain lifts.
 *
 * The choir moves too. That is the backdrop, not the text.
 *
 * There was a dove here before any of it: ninety-two frames of line art flying
 * a hand-drawn spline. The frames are still in /public/dove-flight,
 * unreferenced, if that decision is ever revisited.
 */

export default function Hero({ start = true }: { start?: boolean }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const treatment = useHeroTreatment();
  const { ink, base } = HERO_TREATMENTS[treatment];

  // Elapsed milliseconds, or null for "not writing" — see wordFrame.
  const [ms, setMs] = useState<number | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !start) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const fl = { raf: 0 };

    const play = () => {
      let elapsed = 0;
      let last = 0;
      // Clamped deltas rather than a fixed start time, so a hidden tab pauses
      // the writing instead of skipping through it.
      const step = (now: number) => {
        if (last) elapsed += Math.min(now - last, 100);
        last = now;
        if (elapsed < TYPE_RUN_MS) {
          setMs(elapsed);
          fl.raf = requestAnimationFrame(step);
        } else {
          setMs(null); // done: the plain, whole word again
        }
      };
      setMs(0);
      fl.raf = requestAnimationFrame(step);
    };

    // Write it to somebody. A reload restores the scroll position, which can
    // put a visitor below a hero they have not seen; without this the word
    // would write itself off-screen and simply be there by the time they
    // scrolled back up to it.
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "undefined") {
      play();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io?.disconnect();
          io = null;
          play();
        },
        { threshold: 0.5 },
      );
      io.observe(hero);
    }

    return () => {
      io?.disconnect();
      cancelAnimationFrame(fl.raf);
    };
  }, [start]);

  const { clip, caretLeft, caretOpacity } = wordFrame(ms);

  return (
    <div ref={heroRef} id="top" style={{ height: "100vh", position: "relative", background: "#7EC8EF" }}>
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <HeroBackdrop treatment={treatment} />

        {/* the choir settles into the deep indigo at the base */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "34%", background: `linear-gradient(to bottom, rgba(${base}, 0) 0%, rgba(${base}, 0.22) 62%, rgb(${base}) 100%)`, pointerEvents: "none" }} />

        {/* centered title lockup */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(44px, 7vw, 92px)", fontWeight: 600, letterSpacing: "0", lineHeight: 1.1, color: ink, textAlign: "center", padding: "0 16px" }}>Welcome to Gofamint</h1>
          <div style={{ marginTop: 4, padding: "0 16px", fontFamily: "var(--font-display)", fontSize: "clamp(44px, 7vw, 92px)", fontWeight: 700, letterSpacing: "0", lineHeight: 1.15, color: "#d52821", textAlign: "center" }}>Toronto</div>
        </div>

        {/* the closing sentence.

            The sentence is laid out inline and the halves are joined by an
            ordinary space, which matters because "The Word" is written under a
            moving clip and so has to be a positioned box rather than plain
            text. The last time it was, the box was a flex item and the space
            between the halves was a 0.4em gap on the row — which was never a
            word space (about two of them, and a different amount of wrong per
            family, a gap scaling with the font size rather than with the
            font), and which, being a layout property rather than a character,
            left the sentence reading "and LiveThe Word" to a screen reader and
            to anyone who copied it. An inline-block is a positioning root
            without leaving the text, so the space beside it stays a space.

            Being inline-block also makes "The Word" atomic: it wraps whole or
            not at all, and can never come apart into "The" and "Word" across
            two lines. Below md the break before it is forced, so it lands on a
            line of its own rather than trailing the phrase. */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "66%", zIndex: 2, textAlign: "center", padding: "0 16px", pointerEvents: "none", fontFamily: "var(--font-display)", fontSize: "clamp(29px, 4.2vw, 58px)", letterSpacing: "0", lineHeight: 1.15 }}>
          <span style={{ fontWeight: 600, color: ink }}>Where We Teach, Preach, and Live</span>
          <br className="hero-sentence-break" />{" "}
          <span style={{ display: "inline-block", position: "relative", fontWeight: 700 }}>
            {/* invisible sizing copy keeps the layout stable */}
            <span style={{ visibility: "hidden" }}>The Word</span>
            <span style={{ position: "absolute", inset: 0, color: "#ffffff", clipPath: clip }}>The Word</span>
            <span style={{ position: "absolute", top: "8%", bottom: "8%", left: caretLeft, width: 4, borderRadius: 2, background: "#ffffff", transform: "translateX(-50%)", opacity: caretOpacity }} />
          </span>
        </div>

        {/* scroll hint — nothing carries the visitor down, so this is the only
            thing telling them there is more underneath. */}
        <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.85)", zIndex: 3 }}>Keep scrolling</div>
      </div>
    </div>
  );
}
