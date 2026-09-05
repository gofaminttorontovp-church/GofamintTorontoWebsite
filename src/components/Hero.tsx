"use client";

import HeroBackdrop from "@/components/HeroBackdrop";
import { HERO_TREATMENTS } from "@/lib/site";
import { useHeroTreatment } from "@/lib/use-hero-treatment";

/**
 * The hero: the choir singing behind the welcome, and the welcome held still.
 *
 * There was a performance here. A brand-red line swept in above the headline,
 * curved down beneath it and retracted into the word "Toronto" as that word
 * was written letter by letter; the sentence underneath then rose into place
 * and "The Word" typed itself out in white at the end of it. All of it is
 * gone, and so is what drove it: two clocks, the geometry that measured where
 * the line had to finish, the hand-drawn mobile curve, the carets, and the
 * `start` cue the loading screen used to hand over with.
 *
 * Taking the line out took "Toronto"'s writing with it, necessarily. The
 * writing was the second half of the line's own gesture — the line was
 * consumed into the word as the word appeared — so a caret spelling "Toronto"
 * out with no line to retract would have been the tail of a movement whose
 * head had been cut off.
 *
 * The choir still moves. That is the backdrop, not the text.
 *
 * There was a dove here too, before the line: ninety-two frames of line art
 * flying a hand-drawn spline. The frames are still in /public/dove-flight,
 * unreferenced, if that decision is ever revisited.
 */

export default function Hero() {
  const treatment = useHeroTreatment();
  const { ink, base } = HERO_TREATMENTS[treatment];

  return (
    <div id="top" style={{ height: "100vh", position: "relative", background: "#7EC8EF" }}>
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

            The space in the middle of it is an ordinary space, which is worth
            saying only because it could not be one before. "The Word" typed
            out under a moving clip, so it had to be a positioned box rather
            than inline text, and the two halves were held apart by a 0.4em gap
            on a flex row instead. That was never a word space — it measured
            about two of them, and a different amount of wrong in each family,
            since a gap scales with the font size rather than with the font —
            and being a layout property rather than a character, it was not in
            the text at all: the sentence read "and LiveThe Word" to a screen
            reader and to anyone who copied it. With nothing left to animate,
            the sentence is just a sentence, and the space is just a space. */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "66%", zIndex: 2, textAlign: "center", padding: "0 16px", pointerEvents: "none", fontFamily: "var(--font-display)", fontSize: "clamp(29px, 4.2vw, 58px)", letterSpacing: "0", lineHeight: 1.15 }}>
          <span style={{ fontWeight: 600, color: ink }}>We Teach, Preach and Live</span>{" "}
          <span style={{ fontWeight: 700, color: "#ffffff" }}>The Word</span>
        </div>

        {/* scroll hint — nothing carries the visitor down, so this is the only
            thing telling them there is more underneath. It used to fade in
            behind the opening line; there is no opening line to fade in
            behind, so it is simply here. */}
        <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.85)", zIndex: 3 }}>Keep scrolling</div>
      </div>
    </div>
  );
}
