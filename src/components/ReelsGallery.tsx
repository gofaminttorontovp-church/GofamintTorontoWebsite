import ReelsViewer from "@/components/ui/reels-viewer";
import { eyebrow, h2, FACEBOOK_REELS } from "@/lib/site";
import { getFacebookReels } from "@/lib/facebook";

/**
 * The short videos, between the photographs and the YouTube gallery on the
 * Media page: the five most recent reels from the church's Facebook page,
 * refreshed every hour.
 *
 * There is nothing kept in the repository to fall back on here, and nothing
 * to be gained by pretending there was. When Facebook cannot be reached, or
 * has not been configured, the section is not drawn at all.
 */
export default async function ReelsGallery() {
  const reels = await getFacebookReels();
  if (reels.length === 0) return null;

  return (
    <section
      id="short-videos"
      className="section-dark overflow-x-clip border-t border-[color:var(--hairline)] px-6 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:gap-16">
        <header className="flex flex-col items-center gap-3 text-center">
          <div style={eyebrow}>REELS</div>
          <h2 style={h2} className="!text-[36px] md:!text-[46px]">
            Short Videos
          </h2>
          <p className="m-0 max-w-xl text-[17px] leading-relaxed" style={{ color: "var(--ink-64)" }}>
            The latest five from our Facebook page. Press play, then scroll or swipe
            for the next.
          </p>
          <a
            href={FACEBOOK_REELS}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary mt-2 gap-2.5 !text-[16px] font-normal"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            See all our reels on Facebook
          </a>
        </header>

        <ReelsViewer reels={reels} moreUrl={FACEBOOK_REELS} />
      </div>
    </section>
  );
}
