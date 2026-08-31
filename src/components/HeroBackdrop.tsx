"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import LightShaftBackground from "@/components/LightShaftBackground";
import { HERO_TREATMENTS, HERO_VIDEO, type HeroTreatment } from "@/lib/site";
import { useMediaQuery } from "@/lib/use-media-query";

/**
 * What sits behind the hero's headline and drawn line: the choir, singing.
 *
 * The treatment only supplies a surface and the ink colour the type needs to
 * stay legible against it, so the clip wears the same filter and veil the
 * skyline photograph used to. Swap `HERO_BACKDROP` in @/lib/site to compare:
 *
 *   shafts — the original light-shaft sky, kept so the change is reversible
 *   photo  — the choir as shot, under a soft veil that lifts the type off it
 *   mono   — the same drained of colour, leaving the red line the only colour
 *   dark   — pushed to night and tinted toward the logo's indigo, type white
 *
 * A visitor who has asked for reduced motion gets the poster frame and no
 * video at all, which is also what stands in for everyone until the first
 * frame has arrived.
 */
export default function HeroBackdrop({ treatment }: { treatment: HeroTreatment }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) {
      video.pause();
      video.currentTime = 0;
      return;
    }
    // React has a long-standing habit of dropping `muted` when it renders the
    // attribute, and a clip that is not muted is a clip the browser will not
    // autoplay. Set it on the element itself and ask again.
    video.muted = true;
    const played = video.play();
    // Autoplay is a request, not a guarantee. If it is refused the poster
    // stays, which is a perfectly good backdrop.
    if (played) played.catch(() => {});
  }, [reduced]);

  if (treatment === "shafts") return <LightShaftBackground />;

  const t = HERO_TREATMENTS[treatment];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {reduced ? (
        <Image
          src={HERO_VIDEO.poster}
          alt=""
          fill
          priority
          sizes="100vw"
          // The loading screen holds its count until the backdrop has landed,
          // and finds it by this attribute.
          data-hero-photo=""
          style={{ objectFit: "cover", objectPosition: HERO_VIDEO.position, filter: t.filter }}
        />
      ) : (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video
          ref={videoRef}
          data-hero-video=""
          poster={HERO_VIDEO.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: HERO_VIDEO.position,
            filter: t.filter,
          }}
        >
          <source src={HERO_VIDEO.src} type="video/mp4" />
        </video>
      )}
      {/* the veil: what makes the type readable without touching the type */}
      <div style={{ position: "absolute", inset: 0, background: t.veil }} />
    </div>
  );
}
