"use client";

import { useEffect, useState } from "react";

/**
 * Volumetric "light from above" hero backdrop, ported from the Claude
 * Design handoff (Textured Backgrounds.dc.html, layer 2a). Three sway
 * layers of god-rays at different blur/contrast give it parallax depth,
 * a breathing core sits at the source, dust motes drift up through the
 * beam, haze pools at the bottom, and — roughly once every 26s — a warm
 * sun flare sweeps in from the top-left corner.
 *
 * Sits absolutely-positioned behind the hero's foreground content
 * (dove line, headline); replaces the flat #7EC8EF fill it used to sit on.
 */

type LightShaftBackgroundProps = {
  sunFlare?: boolean;
};

export default function LightShaftBackground({ sunFlare = true }: LightShaftBackgroundProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const playState = reduceMotion ? "paused" : "running";
  const sunDisplay = sunFlare ? "block" : "none";

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* deepen the base toward the corners/bottom so light reads brighter */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(rgba(120,196,236,0) 42%, rgba(56,126,176,0.28) 100%)" }} />

      {/* back rays: wide, soft, blurred */}
      <div
        style={{
          position: "absolute",
          inset: "-35%",
          filter: "blur(9px)",
          transformOrigin: "50% -12%",
          background: "repeating-conic-gradient(from 156deg at 50% -12%, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.14) 3.4deg, rgba(255,255,255,0) 8.5deg)",
          WebkitMaskImage: "linear-gradient(rgba(0,0,0,1) 8%, rgba(0,0,0,0) 60%)",
          maskImage: "linear-gradient(rgba(0,0,0,1) 8%, rgba(0,0,0,0) 60%)",
          animation: "rayBack 20s ease-in-out infinite alternate",
          animationPlayState: playState,
        }}
      />

      {/* front rays: sharper, higher contrast, opposite sway for parallax */}
      <div
        style={{
          position: "absolute",
          inset: "-35%",
          filter: "blur(2.5px)",
          transformOrigin: "50% -10%",
          background: "repeating-conic-gradient(from 158deg at 50% -10%, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.22) 1.4deg, rgba(255,255,255,0) 5.2deg)",
          WebkitMaskImage: "linear-gradient(rgba(0,0,0,1) 5%, rgba(0,0,0,0) 55%)",
          maskImage: "linear-gradient(rgba(0,0,0,1) 5%, rgba(0,0,0,0) 55%)",
          animation: "rayFront 15s ease-in-out infinite alternate",
          animationPlayState: playState,
        }}
      />

      {/* fine bright streaks */}
      <div
        style={{
          position: "absolute",
          inset: "-35%",
          transformOrigin: "50% -8%",
          background: "repeating-conic-gradient(from 160deg at 50% -8%, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.28) 0.5deg, rgba(255,255,255,0) 3.4deg)",
          WebkitMaskImage: "linear-gradient(rgba(0,0,0,1) 3%, rgba(0,0,0,0) 44%)",
          maskImage: "linear-gradient(rgba(0,0,0,1) 3%, rgba(0,0,0,0) 44%)",
          animation: "rayFine 10s ease-in-out infinite alternate",
          animationPlayState: playState,
        }}
      />

      {/* brief sun flare: warm diagonal beam sweeping from the top-left corner */}
      <div
        style={{
          position: "absolute",
          inset: "-25%",
          filter: "blur(10px)",
          transformOrigin: "0% 0%",
          opacity: 0,
          background: "linear-gradient(118deg, rgba(255,252,238,0) 6%, rgba(255,252,238,0.55) 15%, rgba(255,252,238,0) 28%)",
          animation: "sunSweep 26s linear infinite",
          animationPlayState: playState,
          display: sunDisplay,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          background: "radial-gradient(42% 40% at 0% 0%, rgba(255,250,230,0.9), rgba(255,250,230,0.3) 45%, rgba(255,250,230,0) 72%)",
          animation: "sunGlow 26s linear infinite",
          animationPlayState: playState,
          display: sunDisplay,
        }}
      />

      {/* dust motes drifting up through the beam */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.7) 1px, rgba(255,255,255,0) 1.6px), radial-gradient(rgba(255,255,255,0.5) 1.3px, rgba(255,255,255,0) 1.9px), radial-gradient(rgba(255,255,255,0.4) 0.9px, rgba(255,255,255,0) 1.5px)",
          backgroundSize: "160px 260px, 220px 300px, 130px 220px",
          WebkitMaskImage: "radial-gradient(70% 80% at 50% 0%, rgba(0,0,0,0.9), rgba(0,0,0,0) 75%)",
          maskImage: "radial-gradient(70% 80% at 50% 0%, rgba(0,0,0,0.9), rgba(0,0,0,0) 75%)",
          animation: "moteRise 44s linear infinite",
          animationPlayState: playState,
        }}
      />

      {/* breathing bright core at the source */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% -6%",
          background: "radial-gradient(58% 42% at 50% -6%, rgba(255,255,255,0.85), rgba(255,255,255,0.32) 46%, rgba(255,255,255,0) 74%)",
          animation: "coreBreath 11s ease-in-out infinite alternate",
          animationPlayState: playState,
        }}
      />

      {/* soft atmospheric haze pooling at the bottom */}
      <div
        style={{
          position: "absolute",
          left: "-10%",
          right: "-10%",
          bottom: "-12%",
          height: "46%",
          filter: "blur(34px)",
          background: "radial-gradient(60% 100% at 50% 100%, rgba(255,255,255,0.34), rgba(255,255,255,0) 72%)",
          animation: "hazeDrift 26s ease-in-out infinite alternate",
          animationPlayState: playState,
        }}
      />

      {/* gentle vignette to seat the scene */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 105% at 50% 30%, rgba(43,108,152,0) 58%, rgba(43,108,152,0.16) 100%)" }} />
    </div>
  );
}
