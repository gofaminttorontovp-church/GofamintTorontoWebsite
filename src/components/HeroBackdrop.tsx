"use client";

import Image from "next/image";
import LightShaftBackground from "@/components/LightShaftBackground";
import { HERO_PHOTO, HERO_TREATMENTS, type HeroTreatment } from "@/lib/site";

/**
 * What sits behind the hero's headline and drawn line.
 *
 * The scroll performance on top of this is untouched by the choice — each
 * treatment only supplies a surface and the ink colour the type needs to stay
 * legible against it. Swap `HERO_BACKDROP` in @/lib/site to compare them:
 *
 *   shafts — the original light-shaft sky, kept so the change is reversible
 *   photo  — the skyline as shot, under a soft veil that lifts the type off it
 *   mono   — the same photo drained of colour, leaving the red line the only
 *            colour in the frame
 *   dark   — the photo pushed to night and tinted toward the logo's indigo,
 *            with the type inverted to white
 */
export default function HeroBackdrop({ treatment }: { treatment: HeroTreatment }) {
  if (treatment === "shafts") return <LightShaftBackground />;

  const t = HERO_TREATMENTS[treatment];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <Image
        src={HERO_PHOTO.src}
        alt=""
        fill
        priority
        sizes="100vw"
        style={{
          objectFit: "cover",
          objectPosition: HERO_PHOTO.position,
          // The aerial shot puts the tower on the left; mirroring it hands the
          // composition back to the right, clear of the headline.
          transform: HERO_PHOTO.flip ? "scaleX(-1)" : undefined,
          filter: t.filter,
        }}
      />
      {/* the veil: what makes the type readable without touching the type */}
      <div style={{ position: "absolute", inset: 0, background: t.veil }} />
    </div>
  );
}
