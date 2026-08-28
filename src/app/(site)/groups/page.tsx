import type { Metadata } from "next";
import Image from "next/image";
import { eyebrow, h2, GROUPS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Groups",
  description:
    "The people who lead at Gofamint Toronto: Pastor Sam Adusi, the choir, and the men's, women's, youth and children's ministries.",
};

export default function GroupsPage() {
  return (
    /* Light grey rather than the white the other pages sit on. The colour is
       on the section, which is the whole of <main>, so the page is grey edge
       to edge and the sections inside it are told apart by the space and the
       hairline between them rather than by a box drawn around each one. */
    <section
      style={{ background: "#f2f2f4" }}
      className="overflow-x-clip px-6 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-12 md:gap-16">
        <header className="flex flex-col gap-3">
          <div style={eyebrow}>GROUPS</div>
          <h2 style={h2} className="!text-[36px] md:!text-[46px]">
            Meet us.
          </h2>
          <p className="m-0 max-w-xl text-[17px] leading-relaxed" style={{ color: "#5a5a5e" }}>
            Every part of the church is somebody&rsquo;s to look after. These are the people to
            find, and what they would want you to know before you do.
          </p>
        </header>

        {/* Six sections down the page on a laptop. On a phone that is six
            screens of scrolling, so the same six turn on their side and are
            swiped through instead, one at a time. `scroll-pl-6` is what keeps
            the first slide aligned with the heading above it rather than
            landing flush against the edge of the screen; `-mx-6` with `px-6`
            lets the row itself run the full width. */}
        <ol
          className="no-scrollbar -mx-6 m-0 flex list-none snap-x snap-mandatory scroll-pl-6 gap-4 overflow-x-auto px-6 pb-2
                     md:mx-0 md:block md:snap-none md:space-y-0 md:overflow-visible md:p-0"
        >
          {GROUPS.map((entry, index) => (
            <li
              key={entry.id}
              /* 86% leaves the next slide peeking, which is the only thing
                 telling a visitor the row moves at all. */
              className="w-[86%] shrink-0 snap-start md:w-auto"
            >
              <article
                className={[
                  // Phone: a white slide, picture above the words.
                  "flex h-full flex-col gap-6 rounded-2xl bg-white p-6",
                  // Laptop: no card at all. A section on the grey, ruled off
                  // from the one before it, with the words on the left and
                  // the picture on the right.
                  "md:grid md:grid-cols-[1fr_minmax(0,340px)] md:items-center md:gap-16 md:rounded-none md:bg-transparent md:p-0 md:py-16",
                  index > 0 ? "md:border-t md:border-black/10" : "",
                ].join(" ")}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:col-start-2 md:row-start-1 md:rounded-[28px]">
                  <Image
                    src={entry.image}
                    alt={entry.alt}
                    fill
                    sizes="(min-width: 768px) 340px, 86vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col gap-4 md:col-start-1 md:row-start-1 md:gap-5">
                  <div className="flex flex-col gap-2">
                    <div style={eyebrow} className="!text-[11px] md:!text-[12px]">
                      {entry.group.toUpperCase()}
                    </div>
                    {/* The choir is the one entry with no name of its own; the
                        group heading above is the whole of its title, so this
                        block is skipped rather than left standing empty. */}
                    {"name" in entry ? (
                      <div className="flex flex-col gap-1">
                        <h3
                          className="m-0 text-[26px] leading-tight md:text-[38px]"
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 600,
                            color: "#1d1d1f",
                          }}
                        >
                          {entry.name}
                        </h3>
                        {"role" in entry ? (
                          <p className="m-0 text-[13px] md:text-[15px]" style={{ color: "#7a7a7a" }}>
                            {entry.role}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <p
                    className="m-0 max-w-lg text-[15px] leading-relaxed md:text-[17px]"
                    style={{ color: "#4a4a4e" }}
                  >
                    {entry.description}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
