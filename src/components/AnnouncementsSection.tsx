"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { ANNOUNCEMENTS } from "@/lib/site";

/**
 * The announcements, turning through the flyers one at a time.
 *
 * Ported from the reference feature carousel, with the changes the material
 * asked for. These are posters rather than photographs, so nothing is cropped:
 * each is shown whole and the caption sits beneath the card instead of over
 * it, where it would have covered the very text it describes. The chips carry
 * names alone, so the two icon packages the reference wanted are not here.
 *
 * The wheel advances on its own and stops while the pointer is on it, so a
 * flyer being read is never pulled away.
 */

const AUTO_PLAY_MS = 6000;
const ITEM_HEIGHT = 64;

/** Wrap a value into [min, max), so the wheel has no ends. */
const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

export default function AnnouncementsSection() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = ANNOUNCEMENTS.length;
  const current = ((step % count) + count) % count;

  const next = useCallback(() => setStep((s) => s + 1), []);

  const goTo = (index: number) => {
    const forward = (index - current + count) % count;
    if (forward > 0) setStep((s) => s + forward);
  };

  useEffect(() => {
    if (paused) return;
    // Someone who asked for less motion gets the first flyer and the chips,
    // and turns the wheel themselves.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [next, paused]);

  /** Where a card sits relative to the one on show. */
  const placeOf = (index: number) => {
    let offset = index - current;
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;
    if (offset === 0) return "active";
    if (offset === -1) return "prev";
    if (offset === 1) return "next";
    return "away";
  };

  const showing = ANNOUNCEMENTS[current];

  return (
    <section id="announcements" className="bg-white text-[color:var(--ink)]">
      <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <h2 className="text-center font-serif text-[40px] leading-tight md:text-5xl">
          Announcements
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-[17px] leading-relaxed text-[color:var(--ink-48)]">
          What is coming up at Gofamint Toronto, and the word we are standing on while it does.
        </p>

        <div
          className="mt-14 grid gap-10 md:mt-16 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-center md:gap-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* the wheel of names */}
          <div className="relative h-[240px] overflow-hidden md:h-[300px]">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-white to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-white to-transparent" />
            <div className="relative flex h-full items-center justify-center md:justify-start">
              {ANNOUNCEMENTS.map((item, index) => {
                const isActive = index === current;
                const distance = wrap(-(count / 2), count / 2, index - current);
                return (
                  <motion.div
                    key={item.id}
                    style={{ height: ITEM_HEIGHT, width: "fit-content" }}
                    animate={{
                      y: distance * ITEM_HEIGHT,
                      opacity: 1 - Math.abs(distance) * 0.3,
                    }}
                    transition={{ type: "spring", stiffness: 90, damping: 22, mass: 1 }}
                    className="absolute flex items-center"
                  >
                    <button
                      type="button"
                      onClick={() => goTo(index)}
                      aria-current={isActive}
                      className={cn(
                        "rounded-full border px-6 py-3 text-left text-sm tracking-tight whitespace-nowrap transition-colors duration-200 md:text-[15px]",
                        isActive
                          ? "border-black bg-black text-white"
                          : "border-[color:var(--hairline)] bg-transparent text-[color:var(--ink-48)] hover:border-black/40 hover:text-[color:var(--ink)]",
                      )}
                    >
                      {item.label}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* the flyers */}
          <div>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px]">
              {ANNOUNCEMENTS.map((item, index) => {
                const place = placeOf(index);
                const isActive = place === "active";
                const isPrev = place === "prev";
                const isNext = place === "next";
                return (
                  <motion.div
                    key={item.id}
                    initial={false}
                    animate={{
                      x: isPrev ? -70 : isNext ? 70 : 0,
                      scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                      opacity: isActive ? 1 : isPrev || isNext ? 0.28 : 0,
                      rotate: isPrev ? -3 : isNext ? 3 : 0,
                      zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
                    className="absolute inset-0 overflow-hidden rounded-2xl bg-[color:var(--canvas-parchment)] ring-1 ring-black/[0.06] shadow-[var(--shadow-product)]"
                    style={{ pointerEvents: isActive ? "auto" : "none" }}
                    aria-hidden={!isActive}
                  >
                    {/* contain, not cover: these are posters, and a crop would
                        take the dates and the scripture off the edges */}
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 420px, 90vw"
                      className={cn(
                        "object-contain transition-[filter] duration-700",
                        isActive ? "blur-0 grayscale-0" : "blur-[2px] grayscale",
                      )}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* the caption sits below the card so the poster stays whole */}
            <motion.div
              key={showing.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mx-auto mt-8 max-w-[460px] text-center md:text-left"
            >
              <h3 className="m-0 font-serif text-2xl leading-tight md:text-3xl">{showing.title}</h3>
              <p className="m-0 mt-3 text-[15px] leading-relaxed text-[color:var(--ink-48)]">
                {showing.detail}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
