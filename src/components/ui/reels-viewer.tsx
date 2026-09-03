"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Play, Volume2, VolumeX, X } from "lucide-react";

import type { Reel } from "@/lib/facebook";
import { cn } from "@/lib/utils";

/**
 * The church's latest reels, watched the way reels are watched: one at a
 * time, top to bottom, the next one a flick away.
 *
 * On a laptop the videos play inside a drawn phone, with the caption of
 * whichever is showing set beside it. The phone starts quiet — a still and a
 * play button — and the page scrolls past it like anything else. Pressing
 * play is what arms it: from then on the wheel, over the phone, moves from
 * reel to reel, and the page underneath holds still. The cross on the phone
 * disarms it and gives the wheel back.
 *
 * On a phone the same still and play button open the reels full screen, the
 * caption laid over the foot of each, and the cross in the corner closes
 * them. The page is never hijacked: nothing scrolls inside it that it did
 * not ask for.
 *
 * Five reels, then a card offering the rest on Facebook. Only the reel that
 * is showing is ever loading — each is a dozen megabytes.
 */

type Props = {
  reels: Reel[];
  /** Where the rest of them are. */
  moreUrl: string;
};

/** Below this the viewer goes full screen rather than into the drawn phone. Tailwind's `md`. */
const SMALL_SCREEN = "(max-width: 767px)";

/** How much of a reel must be in the frame before it counts as the one showing. */
const SHOWING_THRESHOLD = 0.6;

/* Copied from the site's eyebrow style rather than imported, so the client
   bundle is not made to carry the whole of the site's content along with it. */
const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.12em",
  color: "var(--ink-48)",
};

const chrome =
  "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/45 text-white " +
  "backdrop-blur-sm transition-colors duration-200 hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/** How much of a caption is shown before it is opened out. */
const CAPTION_LINES = "line-clamp-2";

/**
 * Whether an element is holding more than it is showing — a clamped caption
 * with more to say.
 *
 * Measured rather than guessed from the length of the text, because whether
 * two lines is enough depends on the width it is set at, and the same caption
 * clamps in the phone and does not beside it. Watched as that width changes,
 * so turning a laptop into a narrow window does not leave a button that opens
 * nothing, or hide one that was needed.
 *
 * Only asked while collapsed: an unclamped element holds exactly what it
 * shows, and would always answer no.
 *
 * `present` is whether the caption is in the page at all, and it has to be
 * asked for rather than inferred. A ref filling in is not a render, so an
 * effect watching only the reel and the fold sleeps through the caption
 * appearing — which is exactly what the one over the video does, since it is
 * built the moment the viewer opens and not before.
 */
function useClipped(
  ref: React.RefObject<HTMLElement | null>,
  current: number,
  expanded: boolean,
  present: boolean,
) {
  const [clipped, setClipped] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || expanded || !present) return;

    const measure = () => setClipped(element.scrollHeight > element.clientHeight + 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, current, expanded, present]);

  return clipped;
}

export default function ReelsViewer({ reels, moreUrl }: Props) {
  /** Armed on a laptop, open on a phone. */
  const [active, setActive] = useState(false);
  /** Active, and on a screen too small for the drawn phone. */
  const [fullscreen, setFullscreen] = useState(false);
  /** Which reel is showing; `reels.length` is the closing card. */
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  /** Whether the phone is on screen at all — nothing plays to an empty room. */
  const [inView, setInView] = useState(true);

  /** Whether the caption of the reel showing is opened out past its two lines. */
  const [expanded, setExpanded] = useState(false);

  const screenRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const exitRef = useRef<HTMLButtonElement>(null);
  const asideCaptionRef = useRef<HTMLParagraphElement>(null);
  const overlayCaptionRef = useRef<HTMLParagraphElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);

  const atEnd = current >= reels.length;
  const shown = reels[Math.min(current, reels.length - 1)];

  // The two captions are measured apart. The same words clamp at the width of
  // the phone and run to a line and a half beside it, so each surface has to
  // be asked about itself.
  const asideClipped = useClipped(asideCaptionRef, current, expanded, !atEnd);
  const overlayClipped = useClipped(overlayCaptionRef, current, expanded, active);

  /* ---- arming and disarming ---- */

  const start = () => {
    setFullscreen(window.matchMedia(SMALL_SCREEN).matches);
    setPaused(false);
    setActive(true);
  };

  const exit = useCallback(() => {
    setActive(false);
    setFullscreen(false);
    // Put the keyboard back where it was, once the play button is back.
    requestAnimationFrame(() => playRef.current?.focus());
  }, []);

  // The keyboard lands on the cross as the viewer opens, so Escape is one
  // press away and a screen reader is told where it is.
  useEffect(() => {
    if (active) exitRef.current?.focus();
  }, [active]);

  // If the window is resized across the breakpoint while open, follow it:
  // the drawn phone cannot hold a full-screen viewer, nor the reverse.
  useEffect(() => {
    if (!active) return;
    const query = window.matchMedia(SMALL_SCREEN);
    const follow = () => setFullscreen(query.matches);
    query.addEventListener("change", follow);
    return () => query.removeEventListener("change", follow);
  }, [active]);

  // Full screen holds the page still underneath. Keyed on the pair, not on
  // anything that changes reel to reel, so the saved overflow is the page's
  // own and not the lock's.
  useEffect(() => {
    if (!(active && fullscreen)) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [active, fullscreen]);

  /* ---- which reel is showing ---- */

  const go = useCallback(
    (to: number) => {
      const feed = feedRef.current;
      if (!feed) return;
      const clamped = Math.max(0, Math.min(reels.length, to));
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      feed.scrollTo({ top: clamped * feed.clientHeight, behavior: reduce ? "auto" : "smooth" });
    },
    [reels.length],
  );

  // Whichever slide fills most of the feed is the one showing.
  useEffect(() => {
    const feed = feedRef.current;
    if (!active || !feed) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.index);
          if (!Number.isNaN(index)) setCurrent(index);
        }
      },
      { root: feed, threshold: SHOWING_THRESHOLD },
    );
    for (const slide of feed.children) observer.observe(slide);
    return () => observer.disconnect();
  }, [active]);

  // Whether the phone itself is on screen. A laptop reader who arms it and
  // then scrolls the page away should not leave it talking to itself.
  useEffect(() => {
    const screen = screenRef.current;
    if (!active || fullscreen || !screen) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(screen);
    return () => {
      observer.disconnect();
      setInView(true);
    };
  }, [active, fullscreen]);

  /* ---- playing ---- */

  // A pause belongs to the reel that was paused, and so does an opened-out
  // caption. Moving on to the next one starts it and folds its caption back,
  // the way a flick on a phone would.
  useEffect(() => {
    setPaused(false);
    setExpanded(false);
  }, [current]);

  // One reel plays: the one showing, while the viewer is open, on screen and
  // not paused. Every other one is stopped. Nothing here touches `src`, so
  // the browser fetches a reel only when it is first asked to play.
  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (!video) return;
      video.muted = muted;
      const shouldPlay = active && inView && !paused && index === current;
      if (shouldPlay) {
        video.play().catch(() => {
          /* autoplay refused, or the reel is gone — the poster stays */
        });
      } else {
        video.pause();
      }
    });
  }, [active, inView, paused, muted, current]);

  // Escape closes; the arrows walk the reels. Only while open, so the page's
  // own keys are untouched the rest of the time.
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        exit();
      } else if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        go(current + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        go(current - 1);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, current, exit, go]);

  const first = reels[0];
  if (!first) return null;

  return (
    <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center md:gap-12 lg:gap-16">
      {/* ---- the phone ---- */}
      <div
        className={cn(
          "relative w-full max-w-[20rem] shrink-0 md:w-[300px] md:max-w-none lg:w-[330px]",
          // The body of the drawn phone, on a laptop only. On a phone the
          // card is a card; a phone drawn on a phone is a joke told twice.
          "md:rounded-[3rem] md:bg-neutral-950 md:p-[10px] md:shadow-2xl md:ring-1 md:ring-white/15",
        )}
      >
        {/* The island and the side keys, the small things that make it a phone. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[22px] z-30 hidden h-6 w-[88px] -translate-x-1/2 rounded-full bg-black md:block"
        />
        <div aria-hidden className="absolute -left-[3px] top-[112px] hidden h-8 w-[3px] rounded-l bg-neutral-800 md:block" />
        <div aria-hidden className="absolute -left-[3px] top-[156px] hidden h-14 w-[3px] rounded-l bg-neutral-800 md:block" />
        <div aria-hidden className="absolute -left-[3px] top-[222px] hidden h-14 w-[3px] rounded-l bg-neutral-800 md:block" />
        <div aria-hidden className="absolute -right-[3px] top-[176px] hidden h-20 w-[3px] rounded-r bg-neutral-800 md:block" />

        {/* ---- the screen ---- */}
        <div
          ref={screenRef}
          className={cn(
            "relative overflow-hidden bg-black",
            "aspect-[9/16] rounded-2xl md:aspect-[9/19.5] md:rounded-[2.4rem]",
            // On a small screen, opening lifts the screen out of the card and
            // over everything. Same element, so nothing is remounted.
            active && fullscreen && "fixed inset-0 z-[70] aspect-auto rounded-none",
          )}
          role={active && fullscreen ? "dialog" : undefined}
          aria-modal={active && fullscreen ? true : undefined}
          aria-label={active && fullscreen ? "Short videos" : undefined}
        >
          {active ? (
            <>
              <div
                ref={feedRef}
                className="no-scrollbar h-full w-full snap-y snap-mandatory overflow-y-auto overscroll-contain"
                role="region"
                aria-label="Short videos"
              >
                {reels.map((reel, index) => (
                  <div key={reel.id} data-index={index} className="relative h-full w-full snap-start snap-always bg-black">
                    <video
                      ref={(element) => {
                        videos.current[index] = element;
                      }}
                      src={reel.src}
                      poster={reel.poster}
                      playsInline
                      loop
                      muted
                      preload="none"
                      onClick={() => setPaused((was) => !was)}
                      aria-label={reel.caption ?? `Short video from the church, ${reel.date}`}
                      // Contained, not covered. A reel is 9:16 and the screen
                      // is taller; covering would trim a tenth off each side,
                      // and the reels carry their titles right to the edge.
                      // The screen is black, so the bars read as the phone's.
                      className="h-full w-full cursor-pointer object-contain"
                    />

                    {paused && index === current ? (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white"
                      >
                        <Play size={26} fill="currentColor" className="ml-1" />
                      </span>
                    ) : null}

                    {/* On a phone the caption lies over the foot of the reel,
                        the way reels carry their captions. On a laptop it is
                        beside the phone instead, and this is hidden. */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-6 pt-16 text-white md:hidden">
                      {reel.caption ? (
                        <p
                          // Only the reel showing is measured; the other four
                          // are off screen, and one of them is the one asked
                          // about.
                          ref={index === current ? overlayCaptionRef : undefined}
                          className={cn(
                            "m-0 whitespace-pre-line text-[14px] leading-snug",
                            expanded
                              ? // Opened out, a long caption would cover the
                                // whole reel, so it is given a share of the
                                // screen and scrolls within it. `contain` keeps
                                // that scroll from turning into a swipe to the
                                // next reel.
                                "pointer-events-auto max-h-[38vh] overflow-y-auto overscroll-contain"
                              : CAPTION_LINES,
                          )}
                        >
                          {reel.caption}
                        </p>
                      ) : null}

                      {index === current && (expanded || overlayClipped) ? (
                        <button
                          type="button"
                          onClick={() => setExpanded((was) => !was)}
                          aria-expanded={expanded}
                          className="pointer-events-auto mt-1 cursor-pointer text-[13px] font-medium text-white/80 underline decoration-white/40 underline-offset-2 hover:text-white"
                        >
                          {expanded ? "Show less" : "See full caption"}
                        </button>
                      ) : null}

                      <p className="m-0 mt-1.5 text-[12px] text-white/70">
                        {reel.date}
                        {" · "}
                        <a
                          href={moreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pointer-events-auto underline decoration-white/40 underline-offset-2 hover:text-white"
                        >
                          View on Facebook
                        </a>
                      </p>
                    </div>
                  </div>
                ))}

                {/* The closing card. Five, and then Facebook. */}
                <div
                  data-index={reels.length}
                  className="flex h-full w-full snap-start snap-always flex-col items-center justify-center gap-5 bg-neutral-950 px-8 text-center text-white"
                >
                  <p className="m-0 text-[22px] font-semibold leading-tight">That&rsquo;s the latest five.</p>
                  <p className="m-0 max-w-[16rem] text-[15px] leading-relaxed text-white/70">
                    There are many more where these came from.
                  </p>
                  <a href={moreUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary !text-[15px]">
                    See the rest on Facebook
                  </a>
                  <button
                    type="button"
                    onClick={() => go(0)}
                    className="cursor-pointer text-[14px] text-white/60 underline decoration-white/30 underline-offset-4 hover:text-white"
                  >
                    Back to the first
                  </button>
                </div>
              </div>

              {/* ---- the controls, over the screen ---- */}
              <button
                ref={exitRef}
                type="button"
                onClick={exit}
                aria-label="Close short videos"
                className={cn(chrome, "absolute right-3 top-3 z-40 md:top-[52px]")}
              >
                <X size={20} />
              </button>

              {!atEnd ? (
                <button
                  type="button"
                  onClick={() => setMuted((was) => !was)}
                  aria-label={muted ? "Turn sound on" : "Turn sound off"}
                  aria-pressed={!muted}
                  className={cn(chrome, "absolute bottom-24 right-3 z-40 md:bottom-4")}
                >
                  {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              ) : null}

              {/* Up and down, for a mouse that would rather click than scroll. */}
              <div className="absolute right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => go(current - 1)}
                  disabled={current === 0}
                  aria-label="Previous short video"
                  className={cn(chrome, "disabled:cursor-default disabled:opacity-30")}
                >
                  <ChevronUp size={20} />
                </button>
                <button
                  type="button"
                  onClick={() => go(current + 1)}
                  disabled={atEnd}
                  aria-label="Next short video"
                  className={cn(chrome, "disabled:cursor-default disabled:opacity-30")}
                >
                  <ChevronDown size={20} />
                </button>
              </div>

              <p className="sr-only" aria-live="polite">
                {atEnd ? "End of the short videos" : `Short video ${current + 1} of ${reels.length}`}
              </p>
            </>
          ) : (
            /* ---- quiet: a still, and a play button ---- */
            <button
              ref={playRef}
              type="button"
              onClick={start}
              aria-label={`Watch our short videos, starting with: ${first.caption ?? first.date}`}
              className="group absolute inset-0 block h-full w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
            >
              <Image
                src={first.poster}
                alt=""
                fill
                sizes="(min-width: 1024px) 330px, (min-width: 768px) 300px, 100vw"
                // Fitted the same way as the video it stands in for, so
                // pressing play does not make the picture jump.
                className="object-contain"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/35"
              />
              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform duration-300 group-hover:scale-105"
              >
                <Play size={26} fill="currentColor" className="ml-1" />
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ---- the caption, beside the phone ---- */}
      <aside className="flex w-full max-w-[20rem] flex-col gap-3 md:w-[22rem] md:max-w-none md:pt-8 lg:w-[26rem]">
        <div style={eyebrow}>
          {atEnd ? "THAT'S THE LATEST FIVE" : `SHORT VIDEO ${current + 1} OF ${reels.length}`}
        </div>
        {atEnd ? (
          <p className="m-0 text-[17px] leading-relaxed" style={{ color: "var(--ink-64)" }}>
            There are many more where these came from.
          </p>
        ) : (
          <>
            <p
              ref={asideCaptionRef}
              className={cn(
                "m-0 whitespace-pre-line text-[17px] leading-relaxed",
                !expanded && CAPTION_LINES,
              )}
              style={{ color: "var(--ink)" }}
            >
              {shown.caption ?? "A short video from the life of the church."}
            </p>

            {/* Shown only where there is more to read — or once it has been
                read, to fold it back again. */}
            {expanded || asideClipped ? (
              <button
                type="button"
                onClick={() => setExpanded((was) => !was)}
                aria-expanded={expanded}
                className="w-fit cursor-pointer text-[15px] underline decoration-[color:var(--ink-48)] underline-offset-4 transition-colors hover:decoration-current"
                style={{ color: "var(--ink-64)" }}
              >
                {expanded ? "Show less" : "See full caption"}
              </button>
            ) : null}
          </>
        )}
        <p className="m-0 text-[14px]" style={{ color: "var(--ink-48)" }}>
          {atEnd ? null : <>{shown.date}</>}
        </p>
        <a
          href={moreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-[15px] underline decoration-[color:var(--ink-48)] underline-offset-4 transition-colors hover:decoration-current"
          style={{ color: "var(--ink)" }}
        >
          {atEnd ? "See the rest on Facebook" : "View on Facebook"}
        </a>
      </aside>
    </div>
  );
}
