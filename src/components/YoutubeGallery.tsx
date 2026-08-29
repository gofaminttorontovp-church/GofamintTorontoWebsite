import ThumbnailButton from "@/components/ui/thumbnail-button-video-player";
import { eyebrow, h2, VIDEOS, YOUTUBE_CHANNEL } from "@/lib/site";

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
    <section id="videos" className="section-dark grow overflow-x-clip px-6 py-20 md:px-8 md:py-24">
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

        {/* Three across from a laptop, two on a tablet, one on a phone. The
            gap is wider than the cards' own radius so the row reads as three
            separate videos rather than one strip. */}
        <ul className="m-0 grid list-none grid-cols-1 gap-x-8 gap-y-10 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {VIDEOS.map((video) => (
            <li key={video.id}>
              <ThumbnailButton
                youtubeId={video.id}
                title={video.title}
                kind={video.kind}
                credit={"credit" in video ? video.credit : undefined}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
