import Hero from "@/components/Hero";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * The opening of the home page: the loading screen, and the hero behind it.
 *
 * The screen used to hand over to the hero — it counted 0 → 100 while the
 * backdrop and the display font landed, then called back so the hero's first
 * red stroke was already moving as the curtain dissolved. The hero does not
 * perform any more, so there is nothing to hand over to and no state to hold
 * here; the screen simply waits for the same things and then gets out of the
 * way, revealing a hero that was finished before it was covered.
 */
export default function HomeIntro() {
  return (
    <>
      <LoadingScreen />
      <Hero />
    </>
  );
}
