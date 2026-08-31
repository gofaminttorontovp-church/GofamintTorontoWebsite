"use client";

import { useEffect, useRef, useState } from "react";
import HeroBackdrop from "@/components/HeroBackdrop";
import { HERO_TREATMENTS } from "@/lib/site";
import { useHeroTreatment } from "@/lib/use-hero-treatment";

/**
 * The hero, ported from the Gofamint Toronto design and now self-playing.
 *
 * Act 1 — a brand-red line sweeps in above the headline, curves down beneath
 * it, then retracts into the word "Toronto", written letter-by-letter in red
 * under the static "Welcome to Gofamint" headline.
 *
 * Act 2 — once "Toronto" is written, the typing caret sprouts back into a
 * white line, which is consumed into a white flying dove (frame-by-frame line
 * art in /public/dove-flight). The dove glides the hand-drawn spline, unwraps
 * into a white line, and types out "The Word" at the end of the closing
 * sentence — then the page gently carries the visitor on to the next section.
 *
 * Both acts run on a clock now. Act 1 used to be scrubbed by the scrollbar,
 * which meant the hero had to be 240vh of pinned emptiness and the visitor
 * had to scroll to be told the story. It plays on its own, the hero is one
 * screen tall, and the page scrolls normally from the first flick — a visitor
 * who wants the service times is never held back by the dove. The clock
 * starts when `start` turns true, which the loading screen decides.
 */

// Act 1's phase boundaries are still expressed in the old scroll units, and
// `act1Units` below maps elapsed milliseconds onto them — so the phase maths
// further down reads exactly as it did when a scrollbar supplied the number.
const ACT1_DRAW_MS = 1600; // the line sweeps in and dives    (units  0 → 45)
const ACT1_GAP_MS = 200; //  a beat before the word           (units 45 → 50)
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

// Act 2 plays on its own clock once "Toronto" is written. Its virtual
// timeline keeps the old scroll units (205 → 520) so the phase maths below
// read unchanged; the clock covers them in ANIM_MS with soft ramps at both
// ends (trapezoidal velocity — even wing-beats through the middle).
//
// The performance used to run 16.7s, which was long enough that a visitor
// waited on it rather than watched it. It runs 11.5s. The saving is not taken
// evenly, and two phases are deliberately not squeezed: the flight, which is
// the part worth watching, and the unwrap, which is the line finding the
// word and reads as hurried if it is rushed. The sprout, the typing and the
// closing settle carry the cut.
const ANIM_FROM = 205;
const ANIM_TO = 505;
const ANIM_MS = 11500;
const RAMP = 0.12; // eased fraction of the clock at each end

// The close. "The Word" is left standing for SETTLE_MS before the page moves
// at all, and the move itself takes SCROLL_MS — slower than a thumb-flick on
// purpose, so the hero hands the visitor on rather than shoving them.
const SETTLE_MS = 1600;
const SCROLL_MS = 1900;

// The line is drawn entirely in brand red, starting part-way along the curve —
// the stretch before that carried the old white lead-in and is never inked.
const LINE_LEAD_IN = 0.25; // fraction of the curve skipped before the line starts

// Flying-dove sprite frames (white line art on transparency) from the
// turning-flight GIF, in three sections: a right-facing flap cycle, the full
// right→left turn, and a left-facing flap cycle. Wherever the flight path
// changes horizontal direction the turn section plays through (reversed for
// left→right), so the bird visibly banks around instead of mirror-flipping.
const FRAME_R = { start: 0, count: 35 }; // dove_001..035 — fly right
const FRAME_T = { start: 35, count: 43 }; // dove_036..078 — turn right→left
const FRAME_L = { start: 78, count: 14 }; // dove_079..092 — fly left
const FLIGHT_FRAME_COUNT = 92;
const FLAP_STEP_VH = 1.9; // virtual-clock distance per wing-beat frame (~16 fps)
const TURN_HALF = 0.1; // half-width of a turn window, as a fraction of flight distance
const flightSrc = (i: number) => `/dove-flight/dove_${String(i + 1).padStart(3, "0")}.png`;

// Flight waypoints between the runtime-anchored start (where the dove
// materialises below "Toronto") and end (where it unwraps into "The Word"),
// as [x, y] fractions of the viewport — hand-drawn with the path tool.
const FLIGHT_MIDS_NORM: [number, number][] = [
  [0.758, 0.587],
  [0.794, 0.471],
  [0.731, 0.378],
  [0.606, 0.404],
  [0.475, 0.412],
  [0.349, 0.438],
  [0.235, 0.502],
  [0.128, 0.573],
  [0.06, 0.681],
  [0.148, 0.753],
  [0.275, 0.723],
  [0.394, 0.671],
];

type PathState = {
  pathLine: string;
  pathSprout: string;
  pathUnwrap: string;
  lineLen: number;
  sproutLen: number;
  unwrapLen: number;
  flightPts: [number, number][];
  flightArc: number[];
  turns: { u: number; dir: number }[];
  doveW: number;
  ready: boolean;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** 0 before `a`, 1 after `b`, smoothstep-eased in between. */
const fade = (v: number, a: number, b: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Point on a Catmull-Rom spline through `pts`, u in [0, 1]. */
const splineAt = (pts: [number, number][], u: number): [number, number] => {
  const segs = pts.length - 1;
  const s = Math.min(Math.max(u, 0), 0.9999) * segs;
  const i = Math.floor(s);
  const t = s - i;
  const p0 = pts[i - 1] || pts[i];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[i + 2] || p2;
  const c1x = p1[0] + (p2[0] - p0[0]) / 6;
  const c1y = p1[1] + (p2[1] - p0[1]) / 6;
  const c2x = p2[0] - (p3[0] - p1[0]) / 6;
  const c2y = p2[1] - (p3[1] - p1[1]) / 6;
  const mt = 1 - t;
  return [
    mt * mt * mt * p1[0] + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * p2[0],
    mt * mt * mt * p1[1] + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * p2[1],
  ];
};

/**
 * Map a distance fraction (0..1 of total flight length) to the spline
 * parameter, via the cumulative arc-length table — so equal clock time
 * covers equal on-screen distance and the flight speed never wavers.
 */
const arcParam = (lut: number[], f: number): number => {
  const totalLen = lut[lut.length - 1];
  if (!totalLen) return f;
  const target = clamp01(f) * totalLen;
  let lo = 1;
  let hi = lut.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (lut[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const l0 = lut[lo - 1];
  const l1 = lut[lo];
  const frac = l1 > l0 ? (target - l0) / (l1 - l0) : 0;
  return (lo - 1 + frac) / (lut.length - 1);
};

export default function Hero({ start = true }: { start?: boolean }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trowRef = useRef<HTMLDivElement>(null);
  const twRef = useRef<HTMLSpanElement>(null);

  const treatment = useHeroTreatment();
  const [s1, setS1] = useState(0); // Act 1 clock, in the old scroll units
  const [anim, setAnim] = useState(0); // Act 2 virtual clock; 0 = not started
  const [paths, setPaths] = useState<PathState>({
    pathLine: "M 0 0",
    pathSprout: "M 0 0",
    pathUnwrap: "M 0 0",
    lineLen: 1,
    sproutLen: 1,
    unwrapLen: 1,
    flightPts: [],
    flightArc: [],
    turns: [],
    doveW: 0,
    ready: false,
  });

  // Warm the flying-dove frames so the flight never flickers mid-scroll.
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    for (let i = 0; i < FLIGHT_FRAME_COUNT; i++) {
      const img = new Image();
      img.src = flightSrc(i);
      imgs.push(img);
    }
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const stage = stageRef.current;
    const trow = trowRef.current;
    if (!hero) return;

    let cur = { line: "", sprout: "", unwrap: "" };

    const measure = () => {
      if (!stage || !trow) return;
      const s = stage.getBoundingClientRect();
      const t = trow.getBoundingClientRect();
      const W = s.width;
      const H = s.height;
      if (W < 10 || H < 10) return;
      // end of the line: just left of where "Toronto" starts, at its midline
      const ex = t.left - s.left + 14;
      const ey = t.top - s.top + t.height * 0.58;
      const n = (v: number) => v.toFixed(1);

      // The line enters from the upper right — where the dove drawing used to
      // hand the stroke over — and curves down and left into "Toronto".
      const startX = 0.67 * W + 0.007 * Math.min(W, H);
      const startY = 0.13 * H + 0.147 * Math.min(W, H);
      const lineCmds =
        "M " + n(startX) + " " + n(startY) +
        " C " + n(startX - 0.02 * W) + " " + n(startY + 0.1 * H) + " " + n(0.3 * W) + " " + n(0.42 * H) + " " + n(0.3 * W) + " " + n(0.5 * H) +
        " C " + n(0.3 * W) + " " + n(0.58 * H) + " " + n(ex - 0.08 * W) + " " + n(ey + 0.04 * H) + " " + n(ex) + " " + n(ey);

      // Act 2 geometry — the sprout line grows out of the parked caret (right
      // edge of "Toronto"), flicks outward, and hooks into the point where
      // the flying dove materialises.
      const tw = twRef.current;
      const w2 = tw ? tw.getBoundingClientRect() : null;
      const sx = t.right - s.left; // caret parks at 100% of the "Toronto" row
      const sy = t.top - s.top + t.height * 0.58;
      const wx = w2 ? w2.left - s.left + 4 : 0.56 * W; // left edge of "The Word"
      const wy = w2 ? w2.top - s.top + w2.height * 0.58 : 0.7 * H;
      const dsx = sx + 0.02 * W;
      const dsy = sy + 0.06 * H;
      const sproutCmds =
        "M " + n(sx) + " " + n(sy) +
        " C " + n(sx + 0.05 * W) + " " + n(sy + 0.005 * H) + " " + n(sx + 0.075 * W) + " " + n(sy + 0.035 * H) + " " + n(sx + 0.05 * W) + " " + n(sy + 0.055 * H) +
        " C " + n(sx + 0.03 * W) + " " + n(sy + 0.07 * H) + " " + n(dsx - 0.03 * W) + " " + n(dsy - 0.025 * H) + " " + n(dsx) + " " + n(dsy);
      // Flight path: runtime-anchored start and end with the drawn waypoints
      // between. The flight ends hovering just up-left of "The Word".
      const fex = wx - 0.12 * W;
      const fey = wy - 0.11 * H;
      const flightPts: [number, number][] = [
        [dsx, dsy],
        ...FLIGHT_MIDS_NORM.map(([mx, my]) => [mx * W, my * H] as [number, number]),
        [fex, fey],
      ];
      // Sample the spline once for two things: a cumulative arc-length table
      // (so the flight runs at constant on-screen speed) and the spots where
      // the horizontal direction flips — each becomes a window where the
      // turn frames play (dir +1 = right→left). Turn positions are stored as
      // distance fractions to match the constant-speed playhead.
      const ARC_N = 240;
      const flightArc: number[] = [0];
      const turns: { u: number; dir: number }[] = [];
      let prevPt = splineAt(flightPts, 0);
      let prevDx = 0;
      for (let i = 1; i <= ARC_N; i++) {
        const pt = splineAt(flightPts, i / ARC_N);
        flightArc.push(flightArc[i - 1] + Math.hypot(pt[0] - prevPt[0], pt[1] - prevPt[1]));
        const d = pt[0] - prevPt[0];
        if (Math.abs(d) >= 0.0004 * W) {
          if (prevDx !== 0 && Math.sign(d) !== Math.sign(prevDx)) {
            turns.push({ u: (flightArc[i - 1] + flightArc[i]) / 2, dir: prevDx > 0 ? 1 : -1 });
          }
          prevDx = d;
        }
        prevPt = pt;
      }
      const flightLen = flightArc[ARC_N] || 1;
      for (const tn of turns) tn.u /= flightLen;
      // Unwrap line: the white thread the dove spools out, hooking into the
      // left edge of "The Word" where the typing caret picks it up.
      const unwrapCmds =
        "M " + n(fex) + " " + n(fey) +
        " C " + n(fex + 0.025 * W) + " " + n(fey + 0.055 * H) + " " + n(wx - 0.09 * W) + " " + n(wy - 0.012 * H) + " " + n(wx) + " " + n(wy);
      const doveW = 0.3 * Math.min(W, H);

      // three INDEPENDENT sub-paths so coloring never depends on draw order:
      // the Act 1 line (red), then the Act 2 sprout and unwrap (both white).
      const pathLine = lineCmds;
      const pathSprout = sproutCmds;
      const pathUnwrap = unwrapCmds;
      if (pathLine === cur.line && pathSprout === cur.sprout && pathUnwrap === cur.unwrap) return;
      cur = { line: pathLine, sprout: pathSprout, unwrap: pathUnwrap };

      const measureLen = (str: string) => {
        try {
          const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
          probe.setAttribute("d", str);
          return probe.getTotalLength();
        } catch {
          return 0;
        }
      };
      const lineLen = measureLen(pathLine) || 1;
      const sproutLen = measureLen(pathSprout) || 1;
      const unwrapLen = measureLen(pathUnwrap) || 1;
      setPaths((prev) => ({ ...prev, pathLine, pathSprout, pathUnwrap, lineLen, sproutLen, unwrapLen, flightPts, flightArc, turns, doveW }));
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

  // ---- the performance: Act 1 on its own clock, Act 2 chained behind it ----
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || !start) return;

    const fl = { raf: 0, timer: 0, release: () => {} };

    // Act 2's trapezoidal clock: gentle ramps at both ends, constant through
    // the middle so the glide and wing-beat stay even.
    const easeClock = (k: number) => {
      const v = 1 / (1 - RAMP);
      if (k < RAMP) return (v * k * k) / (2 * RAMP);
      if (k > 1 - RAMP) return 1 - (v * (1 - k) * (1 - k)) / (2 * RAMP);
      return v * (k - RAMP / 2);
    };

    // The one nudge the hero gives: a long beat after "The Word" lands, the
    // page drifts on to what is under it. Only if the visitor has stayed at
    // the top — the moment they scroll for themselves they are driving, and a
    // page that jumps under a reader is the scroll lock in another coat.
    //
    // The travel is drawn by hand rather than handed to `behavior: "smooth"`.
    // The native easing covers a whole viewport in a few hundred milliseconds,
    // which arrives as a swipe — the one movement this hero should not make
    // straight after asking to be watched for fifteen seconds. This is the
    // same smoothstep the rest of the performance fades on, over SCROLL_MS,
    // so it leaves from nothing and settles into nothing.
    const advance = () => {
      fl.timer = window.setTimeout(() => {
        if (window.scrollY > 40) return;
        const from = window.scrollY;
        const distance = hero.getBoundingClientRect().bottom;
        if (distance <= 10) return;

        // Whatever else happens, the visitor can take the page back. A hand on
        // the wheel, a finger, an arrow key or a scrollbar drag all stop the
        // drift where it stands — the last two only show up as the page
        // landing somewhere we did not put it, hence both checks.
        let taken = false;
        let placed = from;
        const yield_ = () => {
          taken = true;
        };
        const INPUTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
        for (const ev of INPUTS) window.addEventListener(ev, yield_, { passive: true });
        const release = () => {
          for (const ev of INPUTS) window.removeEventListener(ev, yield_);
        };
        fl.release = release;

        let elapsed = 0;
        let last = 0;
        const glide = (now: number) => {
          if (taken || Math.abs(window.scrollY - placed) > 4) return release();
          if (last) elapsed += Math.min(now - last, 100);
          last = now;
          const k = Math.min(1, elapsed / SCROLL_MS);
          placed = Math.round(from + fade(k, 0, 1) * distance);
          window.scrollTo(0, placed);
          if (k < 1) fl.raf = requestAnimationFrame(glide);
          else release();
        };
        fl.raf = requestAnimationFrame(glide);
      }, SETTLE_MS);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Straight to the final tableau — the whole story, none of the movement,
      // and no page that travels on its own either.
      setS1(90);
      setAnim(ANIM_TO);
      return;
    }

    // Both acts accumulate clamped deltas rather than measuring against an
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

    run(
      ACT1_MS,
      (k) => setS1(act1Units(k * ACT1_MS)),
      () => {
        setS1(90);
        run(
          ANIM_MS,
          (k) => setAnim(ANIM_FROM + easeClock(k) * (ANIM_TO - ANIM_FROM)),
          advance,
        );
      },
    );

    return () => {
      cancelAnimationFrame(fl.raf);
      clearTimeout(fl.timer);
      fl.release();
    };
  }, [start]);

  // ---- derived render values (was renderVals) ----
  const { pathLine, pathSprout, pathUnwrap, lineLen, sproutLen, unwrapLen, flightPts, flightArc, turns, doveW, ready } = paths;

  // Two clocks, one story: Act 1's runs first, Act 2's picks up behind it.
  const S = s1;
  const A = anim;

  // Act 1 — phase A (0 → 45): line draws in, then dives under the headline.
  //         phase B (50 → 90): line retracts as "Toronto" is written.
  const pA = clamp01(S / 45);
  const pB = clamp01((S - 50) / 40);
  // Act 2 — an 11.5s performance on the virtual clock A (205 → 505): the
  //         caret sprouts a white line (205 → 222) consumed into the flying
  //         dove; the dove flies the spline (222 → 444); unwraps into a white
  //         line (444 → 493); "The Word" types out (493 → 502.5). Because the
  //         clock ramps at both ends these units are not seconds — they were
  //         solved backwards from the wanted durations, and land at 1.26s of
  //         sprout, 7.49s of flight, 1.69s of unwrap and 0.57s of typing,
  //         with half a second of settle behind it.
  const pC = clamp01((A - 205) / 17);
  const pD = clamp01((A - 222) / 222);
  const pE = clamp01((A - 444) / 49);
  const pT = clamp01((A - 493) / 9.5);

  // The head lays ink down through phase A, then the tail is consumed into
  // the word through phase B — both measured from the line's own start, so
  // the skipped lead-in stays blank throughout.
  const lead = LINE_LEAD_IN * lineLen;
  const headL = pA * (lineLen - lead);
  const tailL = pB * headL;
  const bigL = (lineLen * 2 + 10).toFixed(1);
  const dashLine = headL <= tailL ? "0 " + bigL : "0 " + (lead + tailL).toFixed(1) + " " + (headL - tailL).toFixed(1) + " " + bigL;

  // The caret holds after typing, then dissolves as the sprout line grows.
  let caretOpacity = 0;
  if (S > 50) caretOpacity = pB < 1 ? 1 : 1 - clamp01(pC / 0.18);

  const clip = "inset(0 " + ((1 - pB) * 100).toFixed(2) + "% 0 0)";
  const caretLeft = (pB * 100).toFixed(2) + "%";
  // The hint is an invitation now, not an instruction: the story plays whether
  // or not the visitor scrolls, so it fades in behind the opening line, stays
  // while there is page underneath still unseen, and steps aside as the dove
  // comes in to land and the page moves on by itself.
  const hintOpacity = fade(S, 6, 30) * (1 - fade(A, 400, 460));

  // Sprout line: the head advances out of the caret, then the tail is
  // consumed into the head — the line "becomes" the dove.
  const headC = clamp01(pC / 0.6) * sproutLen;
  const tailC = clamp01((pC - 0.5) / 0.5) * headC;
  const bigC = (sproutLen * 2 + 10).toFixed(1);
  const dashSprout = headC <= tailC ? "0 " + bigC : "0 " + tailC.toFixed(1) + " " + (headC - tailC).toFixed(1) + " " + bigC;

  // Flying dove: the playhead pD is a distance fraction — arcParam converts
  // it to the spline parameter so the bird covers equal distance per tick,
  // one clean constant-speed flight. Materialise in phase C, unwrap in E.
  const hasFlight = flightPts.length > 1 && flightArc.length > 1;
  const uMid = hasFlight ? arcParam(flightArc, pD) : 0;
  const uPrev = hasFlight ? arcParam(flightArc, Math.max(0, pD - 0.02)) : 0;
  const uNext = hasFlight ? arcParam(flightArc, Math.min(1, pD + 0.02)) : 0;
  const [fx, fy] = hasFlight ? splineAt(flightPts, uMid) : [0, 0];
  const [bx, by] = hasFlight ? splineAt(flightPts, uPrev) : [0, 0];
  const [ax, ay] = hasFlight ? splineAt(flightPts, uNext) : [0, 0];
  const dx = ax - bx;
  const dy = ay - by;
  // Frame choice: inside a turn window the turn section scrubs through
  // (forward for right→left, reversed for left→right); elsewhere the
  // direction of travel picks which flap cycle loops.
  let activeTurn: { u: number; dir: number } | null = null;
  for (const tn of turns) {
    if (pD > 0 && pD < 1 && Math.abs(pD - tn.u) < TURN_HALF) activeTurn = tn;
  }
  let frameIdx: number;
  let turnEase = 0; // 1 at the heart of a turn — damps the path-tilt
  if (activeTurn) {
    const q = clamp01((pD - (activeTurn.u - TURN_HALF)) / (2 * TURN_HALF));
    const qq = activeTurn.dir > 0 ? q : 1 - q;
    frameIdx = FRAME_T.start + Math.min(FRAME_T.count - 1, Math.floor(qq * FRAME_T.count));
    turnEase = Math.sin(Math.PI * q);
  } else {
    const sec = dx >= 0 ? FRAME_R : FRAME_L;
    const flap = Math.max(0, Math.floor((A - 222) / FLAP_STEP_VH));
    frameIdx = sec.start + (flap % sec.count);
  }
  const doveRot = Math.max(-16, Math.min(16, ((Math.atan2(dy, Math.abs(dx)) * 180) / Math.PI) * 0.45)) * (1 - fade(pD, 0.88, 1)) * (1 - turnEase);
  // The bird dissolves along its final approach — ~90% gone as the unwrap
  // line starts — and the last trace clears in the first beat of the unwrap.
  const doveOpacity = fade(pC, 0.55, 1) * (1 - 0.9 * fade(pD, 0.85, 1)) * (1 - fade(pE, 0, 0.3));
  const doveScale = 1 - 0.25 * fade(pD, 0.85, 1);

  // Unwrap line: the head spools out of the fading dove toward the word,
  // then the tail is consumed into it as the letters type.
  const headU = clamp01(pE / 0.9) * unwrapLen;
  const tailU = clamp01(pT * 1.05) * headU;
  const bigU = (unwrapLen * 2 + 10).toFixed(1);
  const dashUnwrap = headU <= tailU ? "0 " + bigU : "0 " + tailU.toFixed(1) + " " + (headU - tailU).toFixed(1) + " " + bigU;

  // The welcome lockup bows out as the dove takes flight and returns to its
  // place as "The Word" types on; the closing sentence fades in ahead of the
  // landing.
  const welcomeOpacity = Math.max(1 - fade(A, 228, 293), fade(A, 493, 502.5));
  const line1Opacity = fade(A, 402, 434);
  const line1Rise = (1 - fade(A, 402, 434)) * 20;
  const { ink, base } = HERO_TREATMENTS[treatment];
  const clipW = "inset(0 " + ((1 - pT) * 100).toFixed(2) + "% 0 0)";
  const caretWLeft = (pT * 100).toFixed(2) + "%";
  let caretWOpacity = 0;
  if (A > 468) caretWOpacity = pT < 1 ? 1 : 1 - clamp01((A - 499) / 6);

  return (
    <div ref={heroRef} id="top" style={{ height: "100vh", position: "relative", background: "#7EC8EF" }}>
      <div ref={stageRef} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <HeroBackdrop treatment={treatment} />

        {/* the sky settles into the logo's deep indigo at the base */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "34%", background: `linear-gradient(to bottom, rgba(${base}, 0) 0%, rgba(${base}, 0.22) 62%, rgb(${base}) 100%)`, pointerEvents: "none" }} />

        {/* the red line, drawn by scroll: enters above the headline and dives under it */}
        {ready && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none", overflow: "visible" }}>
            <path d={pathLine} style={{ fill: "none", stroke: "#d52821", strokeWidth: "3px", strokeLinecap: "butt", strokeLinejoin: "round", strokeDasharray: dashLine }} />
            <path d={pathSprout} style={{ fill: "none", stroke: "#ffffff", strokeWidth: "3px", strokeLinecap: "butt", strokeLinejoin: "round", strokeDasharray: dashSprout }} />
            <path d={pathUnwrap} style={{ fill: "none", stroke: "#ffffff", strokeWidth: "3px", strokeLinecap: "butt", strokeLinejoin: "round", strokeDasharray: dashUnwrap }} />
          </svg>
        )}

        {/* the flying dove — frame-by-frame line art riding the flight spline */}
        {ready && hasFlight && doveOpacity > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={flightSrc(frameIdx)}
            alt=""
            style={{
              position: "absolute",
              left: fx,
              top: fy,
              width: doveW,
              transform: `translate(-50%, -50%) rotate(${doveRot.toFixed(1)}deg) scale(${doveScale.toFixed(3)})`,
              opacity: doveOpacity,
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        )}

        {/* centered title lockup — bows out as the dove takes flight */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2, opacity: welcomeOpacity }}>
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

        {/* closing lockup — one line; the dove unwraps into a white thread
            that types "The Word" at the end of the sentence. Always rendered
            (opacity-driven) so measure() can find it. */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "66%", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", columnGap: "0.4em", rowGap: 6, zIndex: 2, textAlign: "center", padding: "0 16px", pointerEvents: "none", fontFamily: "var(--font-display)", fontSize: "clamp(29px, 4.2vw, 58px)", letterSpacing: "0", lineHeight: 1.15 }}>
          <span style={{ fontWeight: 600, color: ink, opacity: line1Opacity, transform: `translateY(${line1Rise.toFixed(1)}px)` }}>We Teach, Preach and Live</span>
          <span ref={twRef} style={{ position: "relative", fontWeight: 700 }}>
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
