"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressRange,
  CircularProgressTrack,
} from "@/components/ui/circular-progress";

/**
 * The home page's loading screen.
 *
 * It exists for two reasons at once. The first is the feel: the counter runs
 * the moment the document paints, so the site answers instantly instead of
 * showing an empty sky while the skyline photograph arrives. The second is
 * the hero: the performance behind this screen measures the width of the
 * word "Toronto" to lay its line down, and it flies ninety-two frames of
 * dove art. Both want their assets in hand before the curtain lifts.
 *
 * So the count is floored, not faked. It runs 0 → 95 on its own clock, then
 * holds there until the hero's photograph, the first dove frames and the
 * display font have actually landed — with a cap, so a bad connection makes
 * the visitor wait a moment, never forever. `onDone` fires as the number
 * reaches 100, which is what cues the hero to begin, and the screen dissolves
 * off the top of the animation already playing underneath it.
 */

const FLOOR_MS = 1200; // 0 → 95, on the clock alone
const FLOOR_PCT = 95;
const HOLD_MAX_MS = 3500; // longest we will wait at 95 for the assets
const SNAP_MS = 260; // 95 → 100 once they are in
const FADE_MS = 520; // the screen dissolving off the hero

/** The indigo the hero's sky settles into — the screen is cut from it. */
const FIELD = "rgb(40, 16, 104)";

/**
 * Whether this document has already played the intro. Module scope, so it
 * survives a client-side navigation away and back (returning home from
 * Events does not sit the visitor through it a second time) and resets on a
 * real page load, which is what "opening the site" means.
 */
let playedThisDocument = false;

/** Resolve when the image is in the cache — or when it is certain it won't be. */
function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

/**
 * Resolve when the hero's skyline photograph has landed.
 *
 * It is waited on through its own element rather than by fetching the file:
 * next/image rewrites the src through the optimizer, so preloading
 * /cn_tower.webp would warm a URL the browser never asks for and the count
 * would clear over a blank sky anyway. The element is already in the document
 * — the hero renders alongside this screen — and `priority` has it fetching
 * from the first paint.
 */
function awaitHeroPhoto() {
  return new Promise<void>((resolve) => {
    const el = document.querySelector<HTMLImageElement>("img[data-hero-photo]");
    // The light-shaft treatment carries no photograph; nothing to wait for.
    if (!el) return resolve();
    if (el.complete) return resolve();
    el.addEventListener("load", () => resolve(), { once: true });
    el.addEventListener("error", () => resolve(), { once: true });
  });
}

/** The dove frames the flight opens on; the rest stream in behind the hero. */
const FIRST_DOVE_FRAMES = Array.from(
  { length: 10 },
  (_, i) => `/dove-flight/dove_${String(i + 1).padStart(3, "0")}.png`,
);

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  // Decided once, before the first paint, so the screen never flashes for a
  // visitor who is not going to be shown it.
  //
  // The server cannot make this call — a URL fragment is never sent to it —
  // so the answer can differ between the server render and the first client
  // one. That difference is kept to a style attribute on an element that is
  // always there: returning null instead would change the shape of the tree
  // and fail hydration outright, which is exactly what it did.
  const [show] = useState(() => {
    if (typeof window === "undefined") return true;
    // Arriving at a section — /#mission from another page — is the one case
    // that skips it: the visitor asked for a particular place, and a
    // full-screen curtain would only be in the way of getting there.
    //
    // A reload is not that case, even though the browser restores the scroll
    // position the hero's own closing glide left behind. Reloading the home
    // page means asking for the home page again, so it opens the way it opens
    // the first time — from the top, behind the count.
    if (window.location.hash) return false;
    return !playedThisDocument;
  });

  const [value, setValue] = useState(0);
  // `finished` drives the dissolve, `gone` unmounts the screen once it has.
  const [finished, setFinished] = useState(false);
  const [gone, setGone] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!show) {
      onDone();
      setGone(true); // it was only ever display:none; take it out of the tree
      return;
    }
    playedThisDocument = true;

    // Undo the browser's scroll restoration. Without this the count plays over
    // a page already scrolled to the mission section, the hero performs to
    // nobody, and the visitor scrolls back up into the middle of a flight.
    // `manual` is what stops a late restore landing on top of the reset — the
    // restore would otherwise arrive as a scroll event and dismiss the curtain
    // through the handler below.
    //
    // It is put back to "auto" rather than to whatever was read here. The
    // property lives on the session history entry and outlives the document,
    // so a visitor who reloads or leaves during the second and a half the
    // curtain is up would strand it on "manual" — and the next load would read
    // that, "restore" it, and strand it for good. "auto" is the browser
    // default, and nothing else on the site touches this.
    const restoreScrollRestoration = () => {
      if ("scrollRestoration" in history) history.scrollRestoration = "auto";
    };
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const floorMs = reduced ? 400 : FLOOR_MS;

    let raf = 0;
    let fadeTimer = 0;
    let cancelled = false;
    const startedAt = performance.now();
    let assetsReady = false;
    let snapFrom = 0; // when the 95 → 100 snap began; 0 until it does

    // ---- what we are actually waiting on ----
    const fonts =
      document.fonts && document.fonts.ready
        ? document.fonts.ready.then(() => undefined)
        : Promise.resolve();
    // The logo is not on this list: it is rendered by next/image with
    // `priority`, which preloads it from the document head — and it is the one
    // thing on screen while we wait, so waiting on it would be circular.
    const assets = Promise.all([fonts, awaitHeroPhoto(), ...FIRST_DOVE_FRAMES.map(preload)]);
    const capped = new Promise<void>((resolve) => {
      window.setTimeout(resolve, floorMs + HOLD_MAX_MS);
    });
    Promise.race([assets.then(() => undefined), capped]).then(() => {
      assetsReady = true;
    });

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      window.removeEventListener("scroll", onScroll);
      restoreScrollRestoration();
      setFinished(true);
      onDone(); // the hero starts while the curtain is still dissolving
      fadeTimer = window.setTimeout(() => {
        if (!cancelled) setGone(true);
      }, FADE_MS + 40);
    };

    // The curtain is not a lock. The page is deliberately left scrollable
    // underneath it, and the first sign that it has moved — a visitor with a
    // hand already on the wheel, the router jumping to /#mission, a reload
    // restoring where someone was — ends the count then and there and hands
    // over to the hero. Freezing the body instead would have been tidier to
    // look at and would have swallowed the hash jump whole.
    const onScroll = () => {
      if (window.scrollY > 0) finish();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const step = (now: number) => {
      const elapsed = now - startedAt;

      if (!snapFrom) {
        // The floor: 0 → 95, eased out so the count arrives rather than stops.
        const k = Math.min(1, elapsed / floorMs);
        const v = FLOOR_PCT * (1 - Math.pow(1 - k, 2));
        setValue(v);
        if (k >= 1 && assetsReady) snapFrom = now;
      } else {
        const k = Math.min(1, (now - snapFrom) / SNAP_MS);
        setValue(FLOOR_PCT + (100 - FLOOR_PCT) * k);
        if (k >= 1) {
          finish();
          return;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(fadeTimer);
      window.removeEventListener("scroll", onScroll);
      restoreScrollRestoration();
    };
    // onDone is stable for the life of the page; the intro runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (gone) return null;

  const shown = Math.round(value);

  return (
    <div
      aria-live="polite"
      aria-busy={!finished}
      suppressHydrationWarning
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: show ? "flex" : "none",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 26,
        background: FIELD,
        opacity: finished ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease`,
        pointerEvents: finished ? "none" : "auto",
      }}
    >
      <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
        <CircularProgress value={value} size={168} thickness={3} aria-label="Loading Gofamint Toronto">
          <CircularProgressIndicator>
            <CircularProgressTrack className="text-white/15" />
            {/* No CSS transition on the ring: the value is already animated
                frame by frame, and a second easing on top only lags it. */}
            <CircularProgressRange className="text-[#d52821] transition-none" />
          </CircularProgressIndicator>
        </CircularProgress>
        <Image
          src="/logo.png"
          alt=""
          width={96}
          height={96}
          priority
          style={{ position: "absolute", width: 96, height: 96, objectFit: "contain" }}
        />
      </div>

      <div
        style={{
          fontFamily: "var(--font-text)",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.14em",
          color: "rgba(255, 255, 255, 0.72)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {shown}%
      </div>
    </div>
  );
}
