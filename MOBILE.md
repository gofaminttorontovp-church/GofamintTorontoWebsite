# Mobile design notes

What we learned building the home page, written down so the next section does
not have to rediscover it. Everything here came from a real problem on a real
phone, and each note says what went wrong as well as what to do.

The site is laid out mobile first with Tailwind. Assume the phone case is the
default and add `md:` rules for the laptop, not the other way round.

## Lay it sideways, not down

A column of three or four blocks on a laptop becomes three or four screens of
scrolling on a phone. Turn it into a row that swipes instead.

```tsx
<ol className="no-scrollbar -mx-6 flex snap-x snap-mandatory scroll-pl-6
               gap-5 overflow-x-auto px-6 md:mx-0 md:block md:space-y-12
               md:overflow-visible md:p-0">
  <li className="w-[78%] shrink-0 snap-start md:w-auto">…</li>
</ol>
```

Four details, all of which matter:

- `-mx-6` with `px-6` lets the row run to both edges of the screen while its
  contents stay aligned with the rest of the section. A row that stops at the
  section padding looks like a mistake.
- **`scroll-pl-6` is not optional.** Without it the snap point ignores the
  row's own padding, so the first card lands flush against the edge of the
  screen and the alignment you just set up is cancelled. This one is easy to
  miss because it only shows at rest.
- `w-[78%]` leaves the next card peeking. That peek is the only thing telling
  a visitor the row moves at all.
- `.no-scrollbar` (in `globals.css`) hides the bar. The swipe is the
  affordance; a scrollbar under the content is noise at that size.

Live examples: the mission statements in `MissionSection.tsx`, the flyer names
in `AnnouncementsSection.tsx`.

## Pair things off rather than stacking them

Three short blocks of information stacked cost a full screen. Two abreast cost
half of it and are still readable at 320px, as long as the content is short.

```tsx
<div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
  <div className="col-span-2 md:col-span-1">…</div>
</div>
```

Give the longest block `col-span-2` so it keeps the full width, and let the
short ones share a row. `ConnectSection.tsx` does this with the service times,
the address and the contact details.

## Lead with the image, put the controls under it

On a phone the picture should arrive first and whatever drives it should sit
beneath. Use `order` on a flex column rather than writing the section twice.

```tsx
<div className="flex flex-col gap-8 md:grid md:grid-cols-2">
  <div className="order-1 md:order-none">…the image…</div>
  <div className="order-2 md:order-none">…the controls…</div>
</div>
```

## One set of controls, rearranged

Never render a mobile copy and a desktop copy of the same buttons and hide one
with `hidden md:block`. A screen reader is handed both and reads the list
twice. Keep one set in the DOM and change how it is laid out.

Where the two versions need different *behaviour* and not just different
layout, read the breakpoint in JavaScript with `useMediaQuery` and branch on
it. `AnnouncementsSection.tsx` does this: the same four buttons animate on a
vertical axis beside the flyer on a laptop and sit in a horizontal row beneath
it on a phone.

## A touch screen cannot hover

This bit us properly. A carousel paused on `mouseEnter` so a flyer being read
was not pulled away. On a phone a tap fires `mouseenter` and never a matching
`mouseleave`, so choosing a flyer once stopped the carousel for good.

- Gate anything hover driven on `useMediaQuery("(hover: hover)")`.
- A hover only affordance should not be rendered at all on a phone. Our social
  tooltips are `hidden md:block`: they could never appear on a touch screen,
  and because they were transparent rather than absent they still widened the
  page.

## Nothing may reach past the viewport width

The worst class of mobile bug here, because the symptom appears far from the
cause. One element a few pixels past the right edge makes the **whole
document** draggable sideways, and then every section that is only as wide as
the viewport shows the page background beside it. It reads as though a dozen
sections are broken.

Run this in the console at 320, 375 and 414 wide. It lists what actually
sticks out, ignoring anything already inside a scroller:

```js
const vw = document.documentElement.clientWidth;
const clipped = (el) => { let p = el.parentElement;
  while (p && p !== document.body) {
    if (['auto','hidden','clip','scroll'].includes(getComputedStyle(p).overflowX)) return true;
    p = p.parentElement; } return false; };
[...document.querySelectorAll('body *')]
  .filter(el => el.getBoundingClientRect().right > vw + 1 && !clipped(el))
  .map(el => ({ tag: el.tagName, cls: String(el.className).slice(0,50),
                right: Math.round(el.getBoundingClientRect().right) }));
```

The check that matters: `document.documentElement.scrollWidth` must equal
`clientWidth`.

Two causes we hit, both worth watching for:

- **Transformed neighbours.** Cards translated outward from a carousel are
  laid out inside their container but painted past it.
- **Invisible but present elements.** `opacity-0` still occupies space and
  still counts toward the page width. Only `display: none` does not.

Fix it at the section with `overflow-x-clip`, not at the element, so whatever
was meant to peek still peeks. Use `clip` rather than `hidden`: `hidden` turns
the section into a scroll port, which changes how `position: sticky` resolves
inside it.

One thing that will mislead you while debugging: a `fixed` full width header
grows to match an overflowing document, so it shows up in the list of
offenders. It is a symptom. Fix the real cause and it returns to viewport
width on its own.

## Images on a narrow screen

- A wide photo in a portrait viewport loses most of its width to the crop.
  Bias `object-position` so the subject survives it. The hero skyline uses
  `62% 50%` to keep the tower inside the crop.
- When an image is the content rather than the background, let the card take
  the image's own ratio instead of padding it out to a fixed frame. Pass the
  real pixel dimensions and bound it with `max-h-*` and `max-w-full`, and
  there is no letterboxing to explain away.
- Photographs from a phone often carry an EXIF orientation tag. Browsers apply
  it, image pipelines often do not, and rotating the pixels without clearing
  the tag gets it applied twice. Bake the rotation in and reset the tag.
- Next's dev server caches optimised images in `.next/dev/cache/images`, not
  `.next/cache/images`. If a picture will not update, that is why.

## Motion

- Anything that moves on its own holds still for
  `prefers-reduced-motion: reduce`.
- If a carousel advances on a timer and can also be driven by hand, restart
  the timer on every change. Otherwise a slide chosen by tapping can be taken
  away a fraction of a second later.
- Keep a colour transition short, around 200ms. At 500ms a chip going from
  dark text on light to light text on dark passes through a moment where both
  are mid grey and the label disappears.

## Before calling a section done

1. Look at it at 320, 375 and 414 wide, not just one phone size.
2. Confirm `scrollWidth === clientWidth` at each.
3. Check every `md:` rule left the laptop layout alone.
4. Tap the interactive parts rather than only clicking them, and make sure
   nothing depends on a hover that will never arrive.
5. Measure the section height. If it is more than about one and a half
   screens, something in it should be going sideways.
