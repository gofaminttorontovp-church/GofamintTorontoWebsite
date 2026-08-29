import ThumbnailButton from "@/components/ui/thumbnail-button-video-player";
import { eyebrow, h2, VIDEOS, YOUTUBE_CHANNEL } from "@/lib/site";

/** How many videos stand across the grid, and so how many sit in each row. */
const PER_ROW = 3;

const ROWS = Array.from({ length: Math.ceil(VIDEOS.length / PER_ROW) }, (_, i) =>
  VIDEOS.slice(i * PER_ROW, i * PER_ROW + PER_ROW),
);

/**
 * The video gallery: what has been recorded in service and posted, three
 * across on a laptop and one at a time on a phone.
 *
 * The section itself is a server component — the nine entries are static, and
 * only the poster a visitor clicks needs to be a client component to open the
 * player over the page.
 */
export default function YoutubeGallery() {
  return (
    <section id="videos" className="section-dark overflow-x-clip px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:gap-16">
        <header className="flex flex-col items-center gap-3 text-center">
          <div style={eyebrow}>MEDIA</div>
          <h2 style={h2} className="!text-[36px] md:!text-[46px]">
            YouTube Gallery
          </h2>
          <p className="m-0 max-w-xl text-[17px] leading-relaxed" style={{ color: "var(--ink-64)" }}>
            Sermons, Praise, and Ministrations recorded in service and posted.
          </p>
          <a
            href={YOUTUBE_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            /* The design system's own pearl pill. On the dark section it is
               the one light field on the page, which is where the eye should
               land, and the white the red mark wants to sit on. */
            className="btn btn-secondary mt-2 gap-2.5 !text-[16px] font-normal"
          >
            {/* The mark keeps YouTube's own red, which is how the social row
                in the footer already sets it. */}
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="#FF0000">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.121 2.136c1.871.505 9.377.505 9.377.505s7.505 0 9.376-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Visit our YouTube channel
          </a>
        </header>

        {/* Three rows of three. On a laptop each row is a row of the grid,
            and the three of them stacked read as one nine-up wall — the gap
            down the page is the gap across it. On a phone nine videos is nine
            screens of scrolling, so each row turns on its side and is swiped
            through instead, the way the groups are on their own page.
            `scroll-pl-6` is what keeps the first card aligned with the
            heading above rather than flush to the edge of the screen, and
            `-mx-6` with `px-6` lets the row itself run the full width. */}
        <div className="flex flex-col gap-8 md:gap-y-10">
          {ROWS.map((row) => (
            <ul
              key={row[0].id}
              className="no-scrollbar -mx-6 m-0 flex list-none snap-x snap-mandatory scroll-pl-6 gap-4 overflow-x-auto px-6 pb-2
                         md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-x-8 md:overflow-visible md:p-0"
            >
              {row.map((video) => (
                <li
                  key={video.id}
                  /* 86% leaves the next card peeking, which is the only
                     thing telling a visitor the row moves at all. On the wide
                     phones and small tablets between the two breakpoints one
                     card to a screen is a very large card, so there two ride
                     abreast and the third is the one peeking. */
                  className="w-[86%] shrink-0 snap-start sm:w-[46%] md:w-auto"
                >
                  <ThumbnailButton
                    youtubeId={video.id}
                    title={video.title}
                    kind={video.kind}
                    credit={"credit" in video ? video.credit : undefined}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
