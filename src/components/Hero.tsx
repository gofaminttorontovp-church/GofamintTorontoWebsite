"use client";

import { useEffect, useRef, useState } from "react";
import HeroBackdrop from "@/components/HeroBackdrop";
import { HERO_TREATMENTS } from "@/lib/site";
import { useHeroTreatment } from "@/lib/use-hero-treatment";

/**
 * The hero: the choir singing behind the welcome.
 *
 * Act 1 — a brand-red line sweeps in above the headline, curves down beneath
 * it, then retracts into the word "Toronto", written letter-by-letter in red
 * under the static "Welcome to Gofamint" headline.
 *
 * The close — the sentence underneath fades up and "The Word" types itself out
 * in white at the end of it. The page then stays where it is; moving it is the
 * visitor's to do.
 *
 * There was a dove here. Ninety-two frames of line art flew a hand-drawn
 * spline for eleven and a half seconds, banking through the turns, and it is
 * gone: the background it was drawn over was a still photograph of the
 * skyline, and the movement had to come from somewhere. It comes from the
 * choir now. The frames are still in /public/dove-flight, unreferenced, if
 * that decision is ever revisited.
 *
 * Both acts run on a clock rather than the scrollbar, so the hero is one
 * screen tall and the page scrolls normally from the first flick. The clock
 * starts when `start` turns true — the loading screen decides that — and not
 * before the hero is actually in front of somebody.
 */

// Act 1's phase boundaries are expressed in the scroll units the hero used to
// be scrubbed by, and `act1Units` maps elapsed milliseconds onto them, so the
// phase maths below reads as it did when a scrollbar supplied the number.
const ACT1_DRAW_MS = 1600; // the line sweeps in and dives    (units  0 → 45)
const ACT1_GAP_MS = 200; //   a beat before the word          (units 45 → 50)
const ACT1_TYPE_MS = 1350; // "Toronto" is written            (units 50 → 90)
const ACT1_MS = ACT1_DRAW_MS + ACT1_GAP_MS + ACT1_TYPE_MS;

/** Elapsed milliseconds of Act 1 → the scroll unit the phase maths wants. */
const act1Units = (ms: number) => {
  if (ms < ACT1_DRAW_MS) {
    // eased out, so the line arrives at the word rather than stopping at it
    const k = ms / ACT1_DRAW_MS;
    return 45 * (1 - (1 - k) * (1 - k));
  }
  if (ms < ACT1_DRAW_MS + ACT1_GAP_MS) return 45 + 5 * ((ms - ACT1_DRAW_MS) / ACT1_GAP_MS);
  // the typing runs linear — letters should land at an even pace
  return 50 + 40 * Math.min(1, (ms - ACT1_DRAW_MS - ACT1_GAP_MS) / ACT1_TYPE_MS);
};

// The close runs 0 → 1 on its own clock behind Act 1: the sentence fades up
// over the first stretch of it, then "The Word" types out.
const CLOSE_MS = 2200;
const CLOSE_TYPE_FROM = 0.45;
const CLOSE_TYPE_TO = 0.8;

// The line is drawn entirely in brand red, starting part-way along the curve —
// the stretch before that carried the old white lead-in and is never inked.
const LINE_LEAD_IN = 0.25; // fraction of the curve skipped before the line starts

type PathState = {
  pathLine: string;
  lineLen: number;
  ready: boolean;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** 0 before `a`, 1 after `b`, smoothstep-eased in between. */
const fade = (v: number, a: number, b: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function Hero({ start = true }: { start?: boolean }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trowRef = useRef<HTMLDivElement>(null);

  const treatment = useHeroTreatment();
  // True from the moment the performance starts until it settles. While it is
  // up, the geometry underneath it is left alone — see measure().
  const playingRef = useRef(false);
  const [s1, setS1] = useState(0); // Act 1 clock, in the old scroll units
  const [close, setClose] = useState(0); // the closing clock, 0 → 1
  const [paths, setPaths] = useState<PathState>({
    pathLine: "M 0 0",
    lineLen: 1,
    ready: false,
  });

  // ---- where the line is drawn, measured off the laid-out headline ----
  useEffect(() => {
    const stage = stageRef.current;
    const trow = trowRef.current;

    let cur = "";

    const measure = () => {
      if (!stage || !trow) return;
      // Not while the performance is running: the line is mid-draw against
      // these numbers, and a phone fires a resize on its own the moment its
      // URL bar slides away.
      if (playingRef.current) return;
      const s = stage.getBoundingClientRect();
      const t = trow.getBoundingClientRect();
      const W = s.width;
      const H = s.height;
      if (W < 10 || H < 10) return;
      // end of the line: just left of where "Toronto" starts, at its midline
      const ex = t.left - s.left + 14;
      const ey = t.top - s.top + t.height * 0.58;
      const n = (v: number) => v.toFixed(1);

      // The line enters from the upper right and curves down and left into
      // "Toronto".
      const startX = 0.67 * W + 0.007 * Math.min(W, H);
      const startY = 0.13 * H + 0.147 * Math.min(W, H);
      const pathLine =
        "M " + n(startX) + " " + n(startY) +
        " C " + n(startX - 0.02 * W) + " " + n(startY + 0.1 * H) + " " + n(0.3 * W) + " " + n(0.42 * H) + " " + n(0.3 * W) + " " + n(0.5 * H) +
        " C " + n(0.3 * W) + " " + n(0.58 * H) + " " + n(ex - 0.08 * W) + " " + n(ey + 0.04 * H) + " " + n(ex) + " " + n(ey);

      if (pathLine === cur) return;
      cur = pathLine;

      let lineLen = 0;
      try {
        const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
        probe.setAttribute("d", pathLine);
        lineLen = probe.getTotalLength();
      } catch {
        lineLen = 0;
      }
      setPaths((prev) => ({ ...prev, pathLine, lineLen: lineLen || 1 }));
    };

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    // Two passes, because the line is drawn to where "Toronto" actually sits:
    // once the layout has settled, and again once the display font has swapped
    // in and the word has taken its real width.
    const t = setTimeout(() => {
      measure();
      setPaths((prev) => ({ ...prev, ready: true }));
    }, 60);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, []);

  // ---- the performance: Act 1 on its own clock, the close behind it ----
  useEffect(() => {
    const hero = heroRef.current;
    // Nothing starts before the geometry exists. The line is drawn to where
    // "Toronto" actually sits, and starting ahead of the first measure gives
    // the performance a blank stage to open on.
    if (!hero || !start || !paths.ready) return;

    const fl = { raf: 0 };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Straight to the final tableau — the whole story, none of the movement.
      setS1(90);
      setClose(1);
      return;
    }

    // Both clocks accumulate clamped deltas rather than measuring against an
    // absolute start, so a hidden tab pauses the performance instead of
    // skipping through it.
    const run = (durationMs: number, onTick: (k: number) => void, onEnd: () => void) => {
      let elapsed = 0;
      let last = 0;
      const step = (now: number) => {
        if (last) elapsed += Math.min(now - last, 100);
        last = now;
        const k = Math.min(1, elapsed / durationMs);
        onTick(k);
        if (k < 1) fl.raf = requestAnimationFrame(step);
        else onEnd();
      };
      fl.raf = requestAnimationFrame(step);
    };

    const begin = () => {
      playingRef.current = true;
      run(
        ACT1_MS,
        (k) => setS1(act1Units(k * ACT1_MS)),
        () => {
          setS1(90);
          run(CLOSE_MS, setClose, () => {
            // Done performing: the page may resize the hero again, and the
            // final tableau should follow it. The page itself stays where it
            // is — the visitor moves it.
            playingRef.current = false;
          });
        },
      );
    };

    // Play it to somebody. A reload restores the scroll position the closing
    // glide left behind, which can put the visitor below a hero they have not
    // watched yet — and the performance would spend itself off-screen, leaving
    // them whatever was still running when they scrolled back up. It waits
    // until the hero is actually in front of them, which is the one good habit
    // the old scroll-driven version had for free.
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "undefined") {
      begin();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io?.disconnect();
          io = null;
          begin();
        },
        { threshold: 0.5 },
      );
      io.observe(hero);
    }

    return () => {
      io?.disconnect();
      cancelAnimationFrame(fl.raf);
      playingRef.current = false;
    };
  }, [start, paths.ready]);

  // ---- derived render values ----
  const { pathLine, lineLen, ready } = paths;

  // Two clocks, one story: Act 1's runs first, the close picks up behind it.
  const S = s1;
  const C = close;

  // Act 1 — phase A (0 → 45): line draws in, then dives under the headline.
  //         phase B (50 → 90): line retracts as "Toronto" is written.
  const pA = clamp01(S / 45);
  const pB = clamp01((S - 50) / 40);

  // The head lays ink down through phase A, then the tail is consumed into
  // the word through phase B — both measured from the line's own start, so
  // the skipped lead-in stays blank throughout.
  const lead = LINE_LEAD_IN * lineLen;
  const headL = pA * (lineLen - lead);
  const tailL = pB * headL;
  const bigL = (lineLen * 2 + 10).toFixed(1);
  const dashLine = headL <= tailL ? "0 " + bigL : "0 " + (lead + tailL).toFixed(1) + " " + (headL - tailL).toFixed(1) + " " + bigL;

  // The red caret holds after typing, then dissolves as the close begins.
  let caretOpacity = 0;
  if (S > 50) caretOpacity = pB < 1 ? 1 : 1 - clamp01(C / 0.12);

  const clip = "inset(0 " + ((1 - pB) * 100).toFixed(2) + "% 0 0)";
  const caretLeft = (pB * 100).toFixed(2) + "%";

  // The hint fades in behind the opening line and then stays. It used to step
  // aside as the close landed, because the page was about to carry the visitor
  // down by itself; nothing does that now, so it is the only thing telling
  // them there is more underneath.
  const hintOpacity = fade(S, 6, 30);

  // The closing sentence rises into place, then "The Word" types out at the
  // end of it in white.
  const line1Opacity = fade(C, 0.02, 0.4);
  const line1Rise = (1 - line1Opacity) * 20;
  const pT = clamp01((C - CLOSE_TYPE_FROM) / (CLOSE_TYPE_TO - CLOSE_TYPE_FROM));
  const clipW = "inset(0 " + ((1 - pT) * 100).toFixed(2) + "% 0 0)";
  const caretWLeft = (pT * 100).toFixed(2) + "%";
  let caretWOpacity = 0;
  if (C > CLOSE_TYPE_FROM - 0.05) caretWOpacity = pT < 1 ? 1 : 1 - clamp01((C - CLOSE_TYPE_TO) / 0.12);

  const { ink, base } = HERO_TREATMENTS[treatment];

  return (
    <div ref={heroRef} id="top" style={{ height: "100vh", position: "relative", background: "#7EC8EF" }}>
      <div ref={stageRef} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <HeroBackdrop treatment={treatment} />

        {/* the choir settles into the deep indigo at the base */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "34%", background: `linear-gradient(to bottom, rgba(${base}, 0) 0%, rgba(${base}, 0.22) 62%, rgb(${base}) 100%)`, pointerEvents: "none" }} />

        {/* the red line: enters above the headline and dives under it */}
        {ready && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none", overflow: "visible" }}>
            <path d={pathLine} style={{ fill: "none", stroke: "#d52821", strokeWidth: "3px", strokeLinecap: "butt", strokeLinejoin: "round", strokeDasharray: dashLine }} />
          </svg>
        )}

        {/* centered title lockup */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(44px, 7vw, 92px)", fontWeight: 600, letterSpacing: "0", lineHeight: 1.1, color: ink, textAlign: "center", padding: "0 16px" }}>Welcome to Gofamint</h1>
          <div ref={trowRef} style={{ position: "relative", marginTop: 4, padding: "0 16px" }}>
            {/* invisible sizing copy keeps the layout stable */}
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(44px, 7vw, 92px)", fontWeight: 700, letterSpacing: "0", lineHeight: 1.15, visibility: "hidden" }}>Toronto</div>
            {ready && (
              <>
                <div style={{ position: "absolute", inset: 0, padding: "0 16px", fontFamily: "var(--font-display)", fontSize: "clamp(44px, 7vw, 92px)", fontWeight: 700, letterSpacing: "0", lineHeight: 1.15, color: "#d52821", clipPath: clip }}>Toronto</div>
                <div style={{ position: "absolute", top: "8%", bottom: "8%", left: caretLeft, width: 4, borderRadius: 2, background: "#d52821", transform: "translateX(-50%)", opacity: caretOpacity }} />
              </>
            )}
          </div>
        </div>

        {/* closing lockup — the sentence rises, then "The Word" types out.
            Always rendered (opacity-driven) so the layout never shifts. */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "66%", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", columnGap: "0.4em", rowGap: 6, zIndex: 2, textAlign: "center", padding: "0 16px", pointerEvents: "none", fontFamily: "var(--font-display)", fontSize: "clamp(29px, 4.2vw, 58px)", letterSpacing: "0", lineHeight: 1.15 }}>
          <span style={{ fontWeight: 600, color: ink, opacity: line1Opacity, transform: `translateY(${line1Rise.toFixed(1)}px)` }}>We Teach, Preach and Live</span>
          <span style={{ position: "relative", fontWeight: 700 }}>
            {/* invisible sizing copy keeps the layout stable */}
            <span style={{ visibility: "hidden" }}>The Word</span>
            {ready && (
              <>
                <span style={{ position: "absolute", inset: 0, color: "#ffffff", clipPath: clipW }}>The Word</span>
                <span style={{ position: "absolute", top: "8%", bottom: "8%", left: caretWLeft, width: 4, borderRadius: 2, background: "#ffffff", transform: "translateX(-50%)", opacity: caretWOpacity }} />
              </>
            )}
          </span>
        </div>

        {/* scroll hint */}
        <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.85)", opacity: hintOpacity, zIndex: 3 }}>Keep scrolling</div>
      </div>
    </div>
  );
}
