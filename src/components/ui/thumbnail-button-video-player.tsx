"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Play, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A poster that opens the video over the page.
 *
 * Adapted from the reference thumbnail-button component. Three things changed
 * on the way in. The reference is a small pill — a 70px still with the title
 * set beside it — and this one is the card itself, because a gallery of nine
 * wants the picture at full size. It animates with `motion/react`, which the
 * announcements carousel already uses, rather than pulling framer-motion in
 * beside it. And its stock fallback video and Rickroll placeholder are gone:
 * every video here is one of ours, named in `VIDEOS`.
 *
 * The frame is only loaded once the poster is clicked. Nine embeds on one page
 * is nine players, each with its own scripts and cookies, all of it fetched
 * before a visitor has asked for any of them.
 */

interface ThumbnailButtonProps {
  /** A YouTube id. The poster and the player are both derived from it. */
  youtubeId?: string;
  /** ...or a video file, for anything not hosted on YouTube. */
  videoUrl?: string;
  /** Overrides YouTube's own still. Required for a `videoUrl`. */
  thumbnailUrl?: string;
  title: string;
  /** The small label above the title: Sermon, Praise, Ministration. */
  kind?: string;
  /** Who it belongs to — the preacher, or the singers. */
  credit?: string;
  className?: string;
}

const youTubePoster = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

/** Every video has one of these; not all of them have a maxres still. */
const youTubePosterFallback = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

const youTubeEmbed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

export default function ThumbnailButton({
  youtubeId,
  videoUrl,
  thumbnailUrl,
  title,
  kind,
  credit,
  className,
}: ThumbnailButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [origin, setOrigin] = useState("center center");
  const [poster, setPoster] = useState(
    thumbnailUrl ?? (youtubeId ? youTubePoster(youtubeId) : ""),
  );

  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const isYouTube = !!youtubeId;
  const source = isYouTube ? youTubeEmbed(youtubeId) : videoUrl;

  const open = () => {
    // The modal grows out of the card that was clicked, so the eye is not
    // asked to find the video somewhere else on the screen.
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      setOrigin(`${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`);
    }
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    // Put the keyboard back where it was. Without this, closing with Escape
    // drops focus on <body> and the next Tab starts again from the header.
    buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);

    // Hold the page still underneath. Without this a phone scrolls the
    // gallery behind the video as soon as a finger moves on the backdrop.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className={cn(
          "group flex w-full cursor-pointer flex-col gap-4 rounded-[20px] text-left",
          "focus-visible:outline-2 focus-visible:outline-offset-4",
          className,
        )}
      >
        <div
          className="relative aspect-video w-full overflow-hidden rounded-[18px] bg-black
                     shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06]
                     transition-shadow duration-300 group-hover:shadow-[3px_5px_30px_rgba(0,0,0,0.22)]"
        >
          {poster ? (
            <Image
              src={poster}
              alt=""
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 46vw, 92vw"
              onError={() => {
                if (youtubeId) setPoster(youTubePosterFallback(youtubeId));
              }}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          ) : null}

          {/* The still darkens under the disc so a white play mark holds up
              over a bright frame as readily as over a dark one. */}
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-black/10
                       opacity-70 transition-opacity duration-300 group-hover:opacity-90"
          />

          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
          >
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg
                         backdrop-blur-sm transition-transform duration-300 ease-out
                         group-hover:scale-110 group-active:scale-95"
            >
              <Play size={20} className="ml-0.5 fill-[#1d1d1f] text-[#1d1d1f]" />
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {kind ? (
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-48)]">
              {kind}
            </span>
          ) : null}
          <span
            className="text-[17px] font-medium leading-snug text-[color:var(--ink)]"
          >
            {title}
          </span>
          {credit ? (
            <span className="text-[14px] leading-snug text-[#5a5a5e]">{credit}</span>
          ) : null}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && source ? (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <motion.div
              onClick={(event) => event.stopPropagation()}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.12 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.12 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{ transformOrigin: origin }}
              className="flex w-full max-w-4xl flex-col items-end gap-3"
            >
              {/* Above the frame rather than in its corner: YouTube draws its
                  own controls across the top of the player, and a close button
                  laid over them is two buttons in one place. */}
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close video"
                className="shrink-0 cursor-pointer rounded-full border border-white/20 bg-white/10 p-2
                           text-white backdrop-blur-sm transition-colors duration-200 hover:bg-white/25"
              >
                <X size={20} />
              </button>

              <div className="aspect-video w-full min-h-0 overflow-hidden rounded-2xl bg-black shadow-2xl">
                {isYouTube ? (
                  <iframe
                    src={source}
                    title={title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={source} controls autoPlay className="h-full w-full" />
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
