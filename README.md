# Gofamint Toronto

The website for **Gofamint Toronto** — a parish of The Gospel Faith Mission
International (GOFAMINT) in North York, Toronto.

Built with [Next.js](https://nextjs.org) 16 (App Router), React 19, and
Tailwind CSS v4. The home page implements the "Gofamint Toronto" design system
from Claude Design: a photography-first palette, a single blue accent, and a
scroll-driven hero that traces a dove in brand red and writes "Toronto"
letter-by-letter as you scroll.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Structure

- `src/app/layout.tsx` — root layout, Inter font (the open-source SF Pro substitute), metadata.
- `src/app/globals.css` — design-system tokens (colors, type, spacing, radius, elevation) + button styles.
- `src/app/page.tsx` — the home page: About, Visit, Sermons, Events, Footer.
- `src/components/Hero.tsx` — the scroll-driven animated hero (client component).
- `src/components/Button.tsx` — the pill CTA button (primary / secondary).
- `public/` — logo and photography.

## Deploy

Deploys cleanly to [Vercel](https://vercel.com). `npm run build` produces the
production build.
