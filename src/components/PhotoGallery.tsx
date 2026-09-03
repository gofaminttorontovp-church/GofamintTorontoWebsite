import BentoGallery from "@/components/ui/bento-gallery";
import { eyebrow, h2, PHOTOS, FACEBOOK_PHOTOS } from "@/lib/site";
import { getFacebookPhotoRows } from "@/lib/facebook";

/**
 * The photographs, under the videos on the Media page.
 *
 * The row runs the full width of the screen rather than stopping at the
 * container the heading keeps to: a row that is dragged should look like it
 * carries on past the edge, because it does.
 *
 * The pictures come from the church's Facebook album, refreshed every hour, in
 * two rows: this week and last week. A week turns on a Sunday, so the most
 * recent Sunday service heads "this week" rather than trailing the week
 * before. A quiet week is left out rather than shown empty.
 *
 * When Facebook cannot be reached — or on a machine that has no token for it —
 * this falls back to the photographs kept in the repository, as one unlabelled
 * row, so the page is never empty and never broken.
 */
export default async function PhotoGallery() {
  const rows = await getFacebookPhotoRows();

  return (
    <section
      id="photos"
      className="section-dark overflow-x-clip px-6 py-20 md:px-8 md:py-24"
    >
      <div className="flex flex-col gap-12 md:gap-16">
        <header className="mx-auto flex max-w-6xl flex-col items-center gap-3 text-center">
          <div style={eyebrow}>PHOTOS</div>
          <h2 style={h2} className="!text-[36px] md:!text-[46px]">
            Photo Gallery
          </h2>
          <p className="m-0 max-w-xl text-[17px] leading-relaxed" style={{ color: "var(--ink-64)" }}>
            Sundays, conventions and the ordinary life of the church. Drag or swipe the
            row to see them all, and tap any picture to open it.
          </p>
          <a
            href={FACEBOOK_PHOTOS}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary mt-2 gap-2.5 !text-[16px] font-normal"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            See all our photos on Facebook
          </a>
        </header>

        {rows.length > 0 ? (
          <div className="flex flex-col gap-10 md:gap-12">
            {rows.map((row) => (
              <section key={row.key} className="flex flex-col gap-4">
                <h3 style={eyebrow} className="m-0">
                  {row.label}
                </h3>
                <BentoGallery photos={row.photos} />
              </section>
            ))}
          </div>
        ) : (
          <BentoGallery photos={PHOTOS} />
        )}
      </div>
    </section>
  );
}
