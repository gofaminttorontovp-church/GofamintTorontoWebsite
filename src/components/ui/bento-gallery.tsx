"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A row of photographs, dragged sideways, any one of which opens full size.
 *
 * Adapted from the reference bento gallery. The layout is the reference's —
 * one row, wide tiles among square ones, the caption rising on hover — but
 * three things underneath it changed.
 *
 * The row scrolls natively rather than being a `motion` drag surface. Native
 * scrolling is what a trackpad, a touch screen and the arrow keys all already
 * speak; the drag is kept for a mouse, laid over it. The tiles are real
 * buttons, so the keyboard reaches them and Space works as well as Enter — the
 * reference used a div with a key handler that listened for Enter alone. And
 * it draws with next/image, which is what the rest of the site does.
 */

export type Photo = {
  id: string;
  src: string;
  /** What is in the picture, for anyone who cannot see it. */
  alt: string;
  title: string;
  caption?: string;
  /** A landscape photograph earns twice the width in the row. */
  wide?: boolean;
};

/** Past this many pixels a pointer is dragging the row, not picking a tile. */
const DRAG_SLOP = 6;

/** The round buttons over the photograph: close, and one either way. */
const VIEWER_BUTTON =
  "shrink-0 cursor-pointer rounded-full border border-white/20 bg-white/10 p-2 text-white " +
  "backdrop-blur-sm transition-colors duration-200 hover:bg-white/25 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export default function BentoGallery({ photos }: { photos: readonly Photo[] }) {
  // Which photograph is open is held as its place in the row, not as the
  // photograph itself, because the arrow keys move along the row from here.
  const [index, setIndex] = useState<number | null>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const selected = index === null ? null : (photos[index] ?? null);
  const isOpen = selected !== null;

  /* ---- drag the row with a mouse, on top of its own scrolling ---- */
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });

  const onPointerDown = (event: React.PointerEvent) => {
    // Touch and pen already scroll the row themselves; taking the pointer
    // captive here would only fight them.
    if (event.pointerType !== "mouse" || !rowRef.current) return;
    drag.current = {
      down: true,
      startX: event.clientX,
      startLeft: rowRef.current.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const state = drag.current;
    if (!state.down || !rowRef.current) return;
    const travelled = event.clientX - state.startX;
    if (Math.abs(travelled) > DRAG_SLOP) state.moved = true;
    if (state.moved) rowRef.current.scrollLeft = state.startLeft - travelled;
  };

  const endDrag = () => {
    drag.current.down = false;
  };

  /* ---- the picture, over the page ---- */
  const open = (at: number) => {
    // A click that ended a drag is not a click on this photograph.
    if (drag.current.moved) {
      drag.current.moved = false;
      return;
    }
    setIndex(at);
  };

  /** The keyboard goes back to the tile the reader left on, which after a few
   *  arrow presses is not the tile they started from. */
  const focusTile = useCallback((at: number) => {
    rowRef.current?.querySelector<HTMLButtonElement>(`[data-tile="${at}"]`)?.focus();
  }, []);

  const close = useCallback(() => {
    const leaving = index;
    setIndex(null);
    if (leaving !== null) requestAnimationFrame(() => focusTile(leaving));
  }, [index, focusTile]);

  /** One along the row, round the end and back to the start. */
  const step = useCallback(
    (by: number) => {
      setIndex((at) => (at === null ? at : (at + by + photos.length) % photos.length));
    },
    [photos.length],
  );

  // Hold the page still underneath, and put the keyboard into the viewer.
  //
  // This watches whether the viewer is open, never which photograph is in it.
  // Were it to run again on each arrow press, the second run would save the
  // hidden overflow it had itself just set, and closing would restore that —
  // leaving the page unable to scroll.
  useEffect(() => {
    if (!isOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
      else return;
      // Only once one of ours matched, so the row keeps its own arrow keys
      // when the viewer is shut.
      event.preventDefault();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close, step]);

  return (
    <>
      <ul
        ref={rowRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="no-scrollbar -mx-6 m-0 grid list-none auto-cols-[minmax(15rem,1fr)] grid-flow-col
                   gap-4 overflow-x-auto scroll-pl-6 px-6 pb-2 select-none
                   md:-mx-8 md:scroll-pl-8 md:px-8"
      >
        {photos.map((photo, at) => (
          <li key={photo.id} className={cn("h-60 md:h-72", photo.wide && "md:col-span-2")}>
            <button
              type="button"
              data-tile={at}
              onClick={() => open(at)}
              aria-haspopup="dialog"
              className="group relative block h-full w-full cursor-pointer overflow-hidden rounded-xl
                         ring-1 ring-[color:var(--hairline)] focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                draggable={false}
                sizes={photo.wide ? "(min-width: 768px) 34rem, 15rem" : "(min-width: 768px) 17rem, 15rem"}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* The caption is laid over the foot of the picture on hover, and
                  is always there for a keyboard, which never hovers. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent
                           opacity-0 transition-opacity duration-500
                           group-hover:opacity-100 group-focus-visible:opacity-100"
              />
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-3 flex-col gap-1 p-4 text-left
                           opacity-0 transition-all duration-500
                           group-hover:translate-y-0 group-hover:opacity-100
                           group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
              >
                <span className="text-[15px] font-medium leading-snug text-white">{photo.title}</span>
                {photo.caption ? (
                  <span className="text-[13px] leading-snug text-white/80">{photo.caption}</span>
                ) : null}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
          >
            <motion.div
              onClick={(event) => event.stopPropagation()}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 16 }}
              transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex max-h-full w-full max-w-4xl flex-col items-end gap-3"
            >
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close photo"
                className={VIEWER_BUTTON}
              >
                <X size={20} />
              </button>

              {/* Unoptimised: this is the whole photograph at full size, and
                  running it back through the resizer only softens it. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.src}
                alt={selected.alt}
                className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
              />
              <div className="flex w-full items-center justify-between gap-4">
                <p className="m-0 text-left text-[14px] text-white/75">
                  <span className="text-white">{selected.title}</span>
                  {selected.caption ? ` — ${selected.caption}` : null}
                </p>

                {/* The arrow keys do this too, but they are no use to a thumb,
                    and nothing on screen would otherwise say the rest of the
                    row is reachable from here. */}
                {photos.length > 1 ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <span aria-live="polite" className="text-[13px] tabular-nums text-white/60">
                      {(index ?? 0) + 1} of {photos.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      aria-label="Previous photo"
                      className={VIEWER_BUTTON}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      aria-label="Next photo"
                      className={VIEWER_BUTTON}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
