"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LightShaftBackground from "@/components/LightShaftBackground";
import { NAV_LINKS } from "@/lib/site";

/**
 * Scroll-driven hero, ported from the Gofamint Toronto design.
 *
 * Act 1 — a red line sweeps in from the top-left, traces a single continuous
 * dove, then retracts into the word "Toronto", written letter-by-letter in
 * brand red beneath the static "Welcome to Gofamint" headline.
 *
 * Act 2 — the typing caret sprouts back into a red line, which is consumed
 * into a white flying dove (frame-by-frame line art in /public/dove-flight).
 * The dove swoops down and across the page with the visitor's scroll, then
 * unwraps into a white line that types out "The Word" at the end of the
 * closing sentence — the same mechanic that wrote "Toronto", in white.
 */

// A single continuous line drawing of a dove, hand-traced over the reference
// artwork (local space x:59..995, y:83..1150). Rendered as a smooth
// Catmull-Rom curve through these points.
const DOVE_PTS: [number, number][] = [
  [411, 723], [406, 708], [404.3, 692.9], [407.6, 678.2], [411.3, 671.7], [421.9, 661.3], [435.5, 656.1], [448.2, 657.9], [452.6, 662], [455.3, 667.9], [457, 682.6], [455.6, 706], [450.1, 719.1], [439, 726.2], [424.7, 726.2], [410.6, 720.6], [398.1, 711.3], [381.7, 694.1], [373.1, 680.9], [355.1, 645.3], [342.6, 607.6], [339.1, 584], [338.1, 552.1], [343.8, 512.8], [350.9, 490.1], [369.5, 454.9], [383.7, 435.9], [420.9, 394.1], [456.4, 341.1], [516.2, 210.2], [523.1, 187.4], [533.9, 132.6], [541.2, 109.9], [548.6, 96.8], [553.6, 92], [559.4, 89.2], [565.7, 88.9], [571.9, 90.9], [582.2, 100.5], [589.5, 114.2], [597.4, 136.7], [603, 168.1], [608, 247.9], [605.3, 287.6], [599.1, 310.4], [591.8, 324.3], [582.3, 335.8], [572.5, 340.6], [568.9, 338.7], [566.7, 334.2], [566.9, 320.6], [575.1, 298.8], [588.3, 279], [627.2, 228.7], [637.6, 221.2], [642.7, 221.2], [647.3, 224.1], [653.9, 235.8], [656, 250.7], [648.8, 313.5], [636.8, 359.8], [630.6, 374.3], [622.2, 386.5], [613.3, 391.7], [610.4, 390.3], [609.8, 386.6], [615, 375.5], [632.3, 360.7], [645.6, 355.3], [651.6, 355.2], [656.2, 357.4], [659, 361.9], [659.3, 375.3], [649, 437.5], [643.8, 452.4], [632.6, 473.4], [613.4, 498.9], [591.5, 522], [549.7, 559.2], [516.5, 581], [501.9, 586.7], [433.1, 605.6], [417.8, 606.8], [402.3, 604.4], [371.7, 595.3], [342.3, 582.8], [321.4, 571.5], [297.6, 550.7], [262.7, 507.3], [243.9, 493.2], [222.1, 483.6], [199.4, 476.3], [183.8, 473.8], [168.5, 474.1], [154.3, 478.9], [135.2, 492.5], [79.5, 549.7], [67.9, 566], [68.2, 570.3], [77, 575.7], [115.4, 581.2], [137.8, 588.5], [157.3, 601.8], [173.3, 619.2], [181.5, 632.6], [187.6, 647.2], [201.8, 709.2], [233.8, 799.5], [246.2, 819.7], [280.5, 863.9], [296.4, 881.7], [308.5, 892], [343.4, 911], [409.9, 938.6], [432.5, 946], [495.6, 956.1], [567.2, 960.4], [589.3, 967.6], [607.2, 982.6], [631.6, 1014.1], [689.9, 1109.5], [705.6, 1127.3], [724.7, 1141], [738.9, 1145.6], [752.2, 1143.5], [761.5, 1133.8], [764.3, 1127], [766.2, 1111.9], [761.9, 1089], [750.9, 1068.1], [736.2, 1049.7], [724.7, 1041.7], [719.4, 1040.7], [715.5, 1042.4], [713.5, 1046.5], [715.7, 1059.1], [726.7, 1079.7], [742.9, 1096.6], [790, 1126.6], [811.5, 1136.7], [834.1, 1140.7], [847.7, 1136.8], [856.6, 1126.6], [858.5, 1119.8], [857.7, 1105.1], [847.3, 1075.3], [835.2, 1055.6], [817.2, 1040.3], [789.4, 1025], [767.6, 1018.4], [757.2, 1020.4], [755.4, 1024.2], [756.2, 1029.4], [768.6, 1047.2], [786.7, 1062.7], [806.7, 1075.5], [836.2, 1087.4], [859.3, 1093.5], [882.9, 1097], [906, 1095], [919.5, 1088.5], [924.7, 1083.7], [930.3, 1071.3], [930.3, 1064.2], [922.5, 1042.8], [913.8, 1029.7], [903.1, 1018], [884.2, 1004.2], [854.2, 994.4], [815.3, 988.2], [803.5, 990.5], [801, 993.7], [801.5, 997.8], [810.2, 1006.1], [832, 1013.3], [879.4, 1018.8], [918.9, 1015.1], [941, 1007.1], [959.9, 993.2], [968.6, 981.6], [970.3, 975.3], [966.6, 963.2], [961.7, 958.1], [948.6, 950.4], [925.9, 944.3], [846.2, 940.7], [751.5, 925.6], [683.2, 903.3], [647.7, 885.3], [604.2, 850.3], [588.1, 833.2], [580.5, 819.6], [562.4, 775.3], [539.8, 733.1], [525.9, 713.7], [500.1, 683.2], [465.8, 652.9], [459.9, 641.4], [459.4, 627], [464, 603.8], [477.2, 557.8], [488, 536.7], [506.8, 511.3], [525.2, 496.4], [618.9, 435.1], [674.7, 404.3], [713.1, 376.3], [762.8, 350.8], [782.4, 337.2], [824.6, 300.4], [847, 277.8], [861.1, 258.5], [881.9, 224.6], [950.7, 136.3], [967.7, 122.5], [973.6, 121.4], [979, 123], [986.8, 132.9], [990.2, 147.7], [990.6, 219.3], [986, 242.7], [973, 288.9], [955.6, 333.5], [936.6, 368.6], [923.4, 388.4], [883.7, 427.5], [864.2, 441.1], [829.1, 459.6], [816, 463.3], [811.2, 462.4], [808.7, 459.2], [808.8, 454.2], [815.5, 442.5], [838.9, 421.5], [905.8, 377.8], [963.1, 350], [977.1, 347.5], [983.2, 349.1], [991.2, 358.3], [992.6, 365.1], [991.6, 380.2], [984.2, 402.6], [942.5, 479.7], [922.9, 504.8], [893.6, 531.5], [880, 539.5], [850.7, 552], [804.5, 564.9], [774.1, 568.8], [764.3, 564.7], [763.3, 560.8], [765.5, 556.7], [776.7, 550.1], [807.4, 542.7], [870.4, 532.3], [909.9, 532.5], [923.6, 537.3], [932.1, 547.5], [932.9, 561.4], [923.7, 582.4], [903.2, 606.7], [868.9, 640], [855.7, 648.5], [833.7, 657.3], [794.7, 665.6], [754.9, 666.9], [731.3, 664.1], [717.9, 659.9], [713.6, 656.5], [712.1, 652.7], [713.8, 649.1], [718.3, 646.6], [732.1, 645.3], [779.4, 651.4], [802.4, 657.4], [823.6, 667.2], [832.9, 677.2], [833.8, 689.8], [831.1, 696.3], [821.4, 707.7], [801.8, 720.6], [779.3, 728.2], [747.9, 733.6], [716, 735.4], [684.2, 734], [669.2, 730.4], [656.6, 722.5], [649.3, 711.7], [649, 706.8], [651.3, 703.5], [662.2, 702.8], [683.4, 711.5], [702.8, 725], [713.1, 736.6], [719.9, 750.2], [720.7, 764.5], [714.3, 776.7], [702.1, 783.8], [679.3, 785], [648.8, 776.5], [605.1, 757], [556, 725],
];

const SCROLL_LENGTH_VH = 620;
// Total scrollable distance (hero height minus the pinned viewport), in vh.
// All phase boundaries below are expressed in these units.
const SCROLL_VH = SCROLL_LENGTH_VH - 100;

// Flying-dove sprite frames (white line art on transparency) from the
// turning-flight GIF, in three sections: a right-facing flap cycle, the full
// right→left turn, and a left-facing flap cycle. Wherever the flight path
// changes horizontal direction the turn section plays through (reversed for
// left→right), so the bird visibly banks around instead of mirror-flipping.
const FRAME_R = { start: 0, count: 35 }; // dove_001..035 — fly right
const FRAME_T = { start: 35, count: 43 }; // dove_036..078 — turn right→left
const FRAME_L = { start: 78, count: 14 }; // dove_079..092 — fly left
const FLIGHT_FRAME_COUNT = 92;
const FLAP_STEP_VH = 1.6; // scroll distance per wing-beat frame
const TURN_HALF = 0.05; // half-width of a turn window, as a path fraction
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
  pathEntry: string;
  pathDove: string;
  pathExit: string;
  pathSprout: string;
  pathUnwrap: string;
  entryLen: number;
  doveLen: number;
  exitLen: number;
  sproutLen: number;
  unwrapLen: number;
  flightPts: [number, number][];
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

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trowRef = useRef<HTMLDivElement>(null);
  const twRef = useRef<HTMLSpanElement>(null);

  const [p, setP] = useState(0);
  const [paths, setPaths] = useState<PathState>({
    pathEntry: "M 0 0",
    pathDove: "M 0 0",
    pathExit: "M 0 0",
    pathSprout: "M 0 0",
    pathUnwrap: "M 0 0",
    entryLen: 1,
    doveLen: 1,
    exitLen: 1,
    sproutLen: 1,
    unwrapLen: 1,
    flightPts: [],
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
    const sticky = stickyRef.current;
    const trow = trowRef.current;
    if (!hero) return;

    let cur = { entry: "", dove: "", sprout: "", unwrap: "" };

    const measure = () => {
      if (!sticky || !trow) return;
      const s = sticky.getBoundingClientRect();
      const t = trow.getBoundingClientRect();
      const W = s.width;
      const H = s.height;
      if (W < 10 || H < 10) return;
      // end of the line: just left of where "Toronto" starts, at its midline
      const ex = t.left - s.left + 14;
      const ey = t.top - s.top + t.height * 0.58;
      const n = (v: number) => v.toFixed(1);

      // scale + position the hand-traced dove (local space x:59..995, y:83..1150)
      const doveH = Math.min(W, H) * 0.245;
      const sc = doveH / 1067;
      const oy = 0.13 * H - 83 * sc;
      const ox = 0.67 * W - 527 * sc; // 527 ≈ mid-x of the dove artwork
      const tx = (x: number) => ox + x * sc;
      const ty = (y: number) => oy + y * sc;

      // Smooth the traced polyline with a Catmull-Rom → cubic-bezier pass.
      const P = DOVE_PTS;
      const startX = tx(P[0][0]);
      const startY = ty(P[0][1]);
      let doveCmds = "";
      for (let i = 0; i < P.length - 1; i++) {
        const p0 = P[i - 1] || P[i];
        const p1 = P[i];
        const p2 = P[i + 1];
        const p3 = P[i + 2] || p2;
        const c1x = tx(p1[0] + (p2[0] - p0[0]) / 6);
        const c1y = ty(p1[1] + (p2[1] - p0[1]) / 6);
        const c2x = tx(p2[0] - (p3[0] - p1[0]) / 6);
        const c2y = ty(p2[1] - (p3[1] - p1[1]) / 6);
        doveCmds +=
          " C " + c1x.toFixed(1) + " " + c1y.toFixed(1) + " " + c2x.toFixed(1) + " " + c2y.toFixed(1) + " " + tx(p2[0]).toFixed(1) + " " + ty(p2[1]).toFixed(1);
      }
      const endX = tx(P[P.length - 1][0]);
      const endY = ty(P[P.length - 1][1]);

      // entry sweep — waves rightward AND downward, then hooks back up-left
      // into the dove's start point.
      const entryCmds =
        "M " + n(-40) + " " + n(0.02 * H) +
        " C " + n(0.16 * W) + " " + n(0.07 * H) + " " + n(0.3 * W) + " " + n(0.0 * H) + " " + n(0.44 * W) + " " + n(0.09 * H) +
        " C " + n(0.57 * W) + " " + n(0.17 * H) + " " + n(0.7 * W) + " " + n(0.08 * H) + " " + n(0.83 * W) + " " + n(0.19 * H) +
        " C " + n(0.89 * W) + " " + n(0.245 * H) + " " + n(0.905 * W) + " " + n(0.32 * H) + " " + n(0.875 * W) + " " + n(0.38 * H) +
        " C " + n(0.83 * W) + " " + n(0.44 * H) + " " + n(0.72 * W) + " " + n(startY + 0.055 * H) + " " + n(startX) + " " + n(startY);
      const exitCmds =
        " C " + n(endX - 0.02 * W) + " " + n(endY + 0.1 * H) + " " + n(0.3 * W) + " " + n(0.42 * H) + " " + n(0.3 * W) + " " + n(0.5 * H) +
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
      // Find where the path's horizontal direction flips — each one becomes
      // a window where the turn frames play (dir +1 = right→left).
      const turns: { u: number; dir: number }[] = [];
      let prevDx = 0;
      for (let i = 1; i <= 200; i++) {
        const [xA] = splineAt(flightPts, (i - 1) / 200);
        const [xB] = splineAt(flightPts, i / 200);
        const d = xB - xA;
        if (Math.abs(d) < 0.0004 * W) continue;
        if (prevDx !== 0 && Math.sign(d) !== Math.sign(prevDx)) {
          turns.push({ u: (i - 0.5) / 200, dir: prevDx > 0 ? 1 : -1 });
        }
        prevDx = d;
      }
      // Unwrap line: the white thread the dove spools out, hooking into the
      // left edge of "The Word" where the typing caret picks it up.
      const unwrapCmds =
        "M " + n(fex) + " " + n(fey) +
        " C " + n(fex + 0.025 * W) + " " + n(fey + 0.055 * H) + " " + n(wx - 0.09 * W) + " " + n(wy - 0.012 * H) + " " + n(wx) + " " + n(wy);
      const doveW = 0.3 * Math.min(W, H);

      // five INDEPENDENT sub-paths so coloring never depends on draw order:
      // entry (red) → dove (white) → exit (red), then the Act 2 sprout (red)
      // and unwrap (white).
      const pathEntry = entryCmds;
      const pathDove = "M " + n(startX) + " " + n(startY) + doveCmds;
      const pathExit = "M " + n(endX) + " " + n(endY) + exitCmds;
      const pathSprout = sproutCmds;
      const pathUnwrap = unwrapCmds;
      if (pathEntry === cur.entry && pathDove === cur.dove && pathSprout === cur.sprout && pathUnwrap === cur.unwrap) return;
      cur = { entry: pathEntry, dove: pathDove, sprout: pathSprout, unwrap: pathUnwrap };

      const measureLen = (str: string) => {
        try {
          const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
          probe.setAttribute("d", str);
          return probe.getTotalLength();
        } catch {
          return 0;
        }
      };
      const entryLen = measureLen(pathEntry) || 1;
      const doveLen = measureLen(pathDove) || 1;
      const exitLen = measureLen(pathExit) || 1;
      const sproutLen = measureLen(pathSprout) || 1;
      const unwrapLen = measureLen(pathUnwrap) || 1;
      setPaths((prev) => ({ ...prev, pathEntry, pathDove, pathExit, pathSprout, pathUnwrap, entryLen, doveLen, exitLen, sproutLen, unwrapLen, flightPts, turns, doveW }));
    };

    const update = () => {
      const r = hero.getBoundingClientRect();
      const total = hero.offsetHeight - window.innerHeight;
      const next = Math.max(0, Math.min(1, total > 0 ? -r.top / total : 1));
      setP((prev) => (Math.abs(next - prev) > 0.0004 || (next !== prev && (next === 0 || next === 1)) ? next : prev));
    };

    const onScroll = () => update();
    const onResize = () => {
      measure();
      update();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const t = setTimeout(() => {
      measure();
      update();
      setPaths((prev) => ({ ...prev, ready: true }));
    }, 60);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        measure();
        update();
      });
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, []);

  // ---- derived render values (was renderVals) ----
  const { pathEntry, pathDove, pathExit, pathSprout, pathUnwrap, entryLen, doveLen, exitLen, sproutLen, unwrapLen, flightPts, turns, doveW, ready } = paths;

  // Scroll progress in vh units, so phases read as absolute scroll distances.
  const S = p * SCROLL_VH;

  // Act 1 — phase A (0 → 110): line draws in, then dives under the headline.
  //         phase B (120 → 184): line retracts as "Toronto" is written.
  const pA = clamp01(S / 110);
  const pB = clamp01((S - 120) / 64);
  // Act 2 — phase C (205 → 250): the caret sprouts a red line, consumed into
  //         the flying dove. Phase D (250 → 435): the dove flies the spline.
  //         Phase E (435 → 470): it unwraps into a white line. Phase T
  //         (470 → 510): the line is consumed as "The Word" types out.
  const pC = clamp01((S - 205) / 45);
  const pD = clamp01((S - 250) / 185);
  const pE = clamp01((S - 435) / 35);
  const pT = clamp01((S - 470) / 40);

  const total = entryLen + doveLen + exitLen;
  const head = pA * total; // how far the ink has been laid down (global)
  const tail = pB * head; // how much has been consumed into the word (global)
  const big = (total * 2 + 10).toFixed(1);
  const seg = (globalStart: number, segLen: number) => {
    const vs = clamp01((tail - globalStart) / segLen) * segLen;
    const ve = clamp01((head - globalStart) / segLen) * segLen;
    if (ve <= vs) return "0 " + big;
    return "0 " + vs.toFixed(1) + " " + (ve - vs).toFixed(1) + " " + big;
  };
  const dashEntry = seg(0, entryLen);
  const dashDove = seg(entryLen, doveLen);
  const dashExit = seg(entryLen + doveLen, exitLen);

  // The caret holds after typing, then dissolves as the sprout line grows.
  let caretOpacity = 0;
  if (S > 120) caretOpacity = pB < 1 ? 1 : 1 - clamp01(pC / 0.18);

  const clip = "inset(0 " + ((1 - pB) * 100).toFixed(2) + "% 0 0)";
  const caretLeft = (pB * 100).toFixed(2) + "%";
  const hintOpacity = clamp01(1 - S / 16);

  // Sprout line: the head advances out of the caret, then the tail is
  // consumed into the head — the line "becomes" the dove.
  const headC = clamp01(pC / 0.6) * sproutLen;
  const tailC = clamp01((pC - 0.5) / 0.5) * headC;
  const bigC = (sproutLen * 2 + 10).toFixed(1);
  const dashSprout = headC <= tailC ? "0 " + bigC : "0 " + tailC.toFixed(1) + " " + (headC - tailC).toFixed(1) + " " + bigC;

  // Flying dove: position + heading from the flight spline, flap frame from
  // scroll, materialise during phase C, unwrap into the white line in phase E.
  const hasFlight = flightPts.length > 1;
  const [fx, fy] = hasFlight ? splineAt(flightPts, pD) : [0, 0];
  const [bx, by] = hasFlight ? splineAt(flightPts, Math.max(0, pD - 0.02)) : [0, 0];
  const [ax, ay] = hasFlight ? splineAt(flightPts, Math.min(1, pD + 0.02)) : [0, 0];
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
    const flap = Math.max(0, Math.floor((S - 250) / FLAP_STEP_VH));
    frameIdx = sec.start + (flap % sec.count);
  }
  const doveRot = Math.max(-16, Math.min(16, ((Math.atan2(dy, Math.abs(dx)) * 180) / Math.PI) * 0.45)) * (1 - fade(pD, 0.88, 1)) * (1 - turnEase);
  // The bird dissolves along its final approach — ~99% gone before it even
  // reaches the hover point — and the last trace clears as the unwrap starts.
  const doveOpacity = fade(pC, 0.55, 1) * (1 - 0.99 * fade(pD, 0.78, 0.97)) * (1 - fade(pE, 0, 0.3));
  const doveScale = 1 - 0.25 * fade(pD, 0.78, 0.97);

  // Unwrap line: the head spools out of the fading dove toward the word,
  // then the tail is consumed into it as the letters type.
  const headU = clamp01(pE / 0.9) * unwrapLen;
  const tailU = clamp01(pT * 1.05) * headU;
  const bigU = (unwrapLen * 2 + 10).toFixed(1);
  const dashUnwrap = headU <= tailU ? "0 " + bigU : "0 " + tailU.toFixed(1) + " " + (headU - tailU).toFixed(1) + " " + bigU;

  // The welcome lockup bows out as the dove takes flight; the closing
  // sentence fades in ahead of the landing, and "The Word" types on in white.
  const welcomeOpacity = 1 - fade(S, 255, 310);
  const line1Opacity = fade(S, 400, 430);
  const line1Rise = (1 - fade(S, 400, 430)) * 20;
  const clipW = "inset(0 " + ((1 - pT) * 100).toFixed(2) + "% 0 0)";
  const caretWLeft = (pT * 100).toFixed(2) + "%";
  let caretWOpacity = 0;
  if (S > 468) caretWOpacity = pT < 1 ? 1 : 1 - clamp01((S - 512) / 8);

  const navLinkStyle: React.CSSProperties = {
    fontSize: 14,
    color: "#1d1d1f",
    textDecoration: "none",
    opacity: 0.85,
  };

  return (
    <div ref={heroRef} id="top" style={{ height: `${SCROLL_LENGTH_VH}vh`, position: "relative", background: "#7EC8EF" }}>
      <div ref={stickyRef} style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <LightShaftBackground />

        {/* the red line, drawn by scroll: enters top-left, loops, dives under the headline */}
        {ready && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none", overflow: "visible" }}>
            <path d={pathEntry} style={{ fill: "none", stroke: "#d52821", strokeWidth: "3px", strokeLinecap: "butt", strokeLinejoin: "round", strokeDasharray: dashEntry }} />
            <path d={pathDove} style={{ fill: "none", stroke: "#ffffff", strokeWidth: "3px", strokeLinecap: "butt", strokeLinejoin: "round", strokeDasharray: dashDove }} />
            <path d={pathExit} style={{ fill: "none", stroke: "#d52821", strokeWidth: "3px", strokeLinecap: "butt", strokeLinejoin: "round", strokeDasharray: dashExit }} />
            <path d={pathSprout} style={{ fill: "none", stroke: "#d52821", strokeWidth: "3px", strokeLinecap: "butt", strokeLinejoin: "round", strokeDasharray: dashSprout }} />
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

        {/* top bar: logo left + nav links */}
        <header className="hero-header" style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Gofamint Toronto logo" style={{ width: 52, height: 52, objectFit: "contain" }} />
            <span className="hero-wordmark" style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em", color: "#1d1d1f" }}>Gofamint Toronto</span>
          </div>
          <nav className="hero-nav" style={{ display: "flex", alignItems: "center" }}>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} style={navLinkStyle}>
                {link.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* centered title lockup — bows out as the dove takes flight */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2, opacity: welcomeOpacity }}>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6.5vw, 84px)", fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.1, color: "#1d1d1f", textAlign: "center", padding: "0 16px" }}>Welcome to Gofamint</h1>
          <div ref={trowRef} style={{ position: "relative", marginTop: 4, padding: "0 16px" }}>
            {/* invisible sizing copy keeps the layout stable */}
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6.5vw, 84px)", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.15, visibility: "hidden" }}>Toronto</div>
            {ready && (
              <>
                <div style={{ position: "absolute", inset: 0, padding: "0 16px", fontFamily: "var(--font-display)", fontSize: "clamp(40px, 6.5vw, 84px)", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.15, color: "#d52821", clipPath: clip }}>Toronto</div>
                <div style={{ position: "absolute", top: "8%", bottom: "8%", left: caretLeft, width: 4, borderRadius: 2, background: "#d52821", transform: "translateX(-50%)", opacity: caretOpacity }} />
              </>
            )}
          </div>
        </div>

        {/* closing lockup — one line; the dove unwraps into a white thread
            that types "The Word" at the end of the sentence. Always rendered
            (opacity-driven) so measure() can find it. */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "66%", display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", columnGap: "0.4em", rowGap: 6, zIndex: 2, textAlign: "center", padding: "0 16px", pointerEvents: "none", fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.8vw, 52px)", letterSpacing: "-0.012em", lineHeight: 1.15 }}>
          <span style={{ fontWeight: 600, color: "#1d1d1f", opacity: line1Opacity, transform: `translateY(${line1Rise.toFixed(1)}px)` }}>We Teach, Preach and Live</span>
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
        <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", fontSize: 12, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(29, 29, 31, 0.55)", opacity: hintOpacity, zIndex: 3 }}>Keep scrolling</div>
      </div>
    </div>
  );
}
