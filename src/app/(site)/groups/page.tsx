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
    /* Light grey rather than the white the other pages sit on, so the white
       cards below have something to be cards against. The colour is on the
       section, which is the whole of <main>, so the page is grey edge to edge. */
    <section style={{ background: "#f2f2f4" }} className="px-6 py-20 md:px-8 md:py-24">
      <div className="mx-auto flex max-w-4xl flex-col gap-12 md:gap-16">
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

        <ol className="m-0 flex list-none flex-col gap-4 p-0 md:gap-5">
          {GROUPS.map((entry) => (
            <li key={entry.id}>
              {/* Who they are on the left, their picture on the right.
                  One grid does both screen sizes: the photograph keeps the
                  right on a phone at 132px, and the description drops to a
                  second row spanning the full card rather than wrapping into
                  a ribbon in what is left of the width beside it. From md it
                  moves back up under the name and the photograph grows to
                  fill both rows. */}
              <article
                className="grid grid-cols-[1fr_132px] items-start gap-x-5 gap-y-4 overflow-hidden rounded-2xl bg-white p-4 sm:grid-cols-[1fr_168px] sm:gap-x-6 sm:p-5 md:grid-cols-[1fr_minmax(0,240px)] md:gap-x-10 md:gap-y-3 md:p-7"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)" }}
              >
                <div className="relative col-start-2 row-start-1 aspect-square w-full overflow-hidden rounded-xl md:row-span-2 md:self-center">
                  <Image
                    src={entry.image}
                    alt={entry.alt}
                    fill
                    sizes="(min-width: 768px) 240px, (min-width: 640px) 168px, 132px"
                    className="object-cover"
                  />
                </div>

                <div className="col-start-1 row-start-1 flex flex-col gap-2 md:self-end">
                  <div style={eyebrow} className="!text-[11px] md:!text-[12px]">
                    {entry.group.toUpperCase()}
                  </div>
                  {/* The choir is the one entry with no name of its own; the
                      group heading above is the whole of its title, so this
                      block is skipped rather than left standing empty. */}
                  {"name" in entry ? (
                    <div className="flex flex-col gap-0.5">
                      <h3
                        className="m-0 text-[20px] leading-tight md:text-[26px]"
                        style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "#1d1d1f" }}
                      >
                        {entry.name}
                      </h3>
                      {"role" in entry ? (
                        <p className="m-0 text-[13px] md:text-[14px]" style={{ color: "#7a7a7a" }}>
                          {entry.role}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <p
                  className="col-span-2 col-start-1 row-start-2 m-0 text-[15px] leading-relaxed md:col-span-1 md:text-[16px] md:self-start"
                  style={{ color: "#4a4a4e" }}
                >
                  {entry.description}
                </p>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
