/**
 * The one piece of animation left in the hero: "The Word" written out under a
 * moving clip, with a caret riding its leading edge.
 *
 * The frame maths lives here rather than inside the component so it can be
 * read — and checked — on its own, without a browser and without a clock.
 */

export const TYPE_HOLD_MS = 420; // a beat after the curtain, before the first letter
export const TYPE_MS = 780; //     the word is written
export const CARET_IN_MS = 120; //  the caret arrives just ahead of the first letter
export const CARET_OUT_MS = 320; // and dissolves once the word is whole

export const TYPE_RUN_MS = TYPE_HOLD_MS + TYPE_MS + CARET_OUT_MS;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type WordFrame = {
  /** Clips the written word back to its leading edge. */
  clip: string;
  /** Where the caret sits along the word, as a percentage. */
  caretLeft: string;
  caretOpacity: number;
};

/**
 * The frame at `ms` elapsed — or the resting frame, for null.
 *
 * null means the word is whole and the caret is gone, and it is the state at
 * both ends of the run: what the server renders, what a visitor who has asked
 * for reduced motion keeps, and what the page is left with if the script never
 * runs at all. The word has to rest written rather than unwritten, because
 * what hides it is a clip-path, and a clip that nobody opens is a word that
 * nobody ever sees.
 */
export function wordFrame(ms: number | null): WordFrame {
  const typed = ms === null ? 1 : clamp01((ms - TYPE_HOLD_MS) / TYPE_MS);

  let caretOpacity = 0;
  if (ms !== null && ms > TYPE_HOLD_MS - CARET_IN_MS) {
    caretOpacity = typed < 1 ? 1 : 1 - clamp01((ms - TYPE_HOLD_MS - TYPE_MS) / CARET_OUT_MS);
  }

  return {
    clip: "inset(0 " + ((1 - typed) * 100).toFixed(2) + "% 0 0)",
    caretLeft: (typed * 100).toFixed(2) + "%",
    caretOpacity,
  };
}
