import Image from "next/image";

/**
 * The mission statements, the first thing the home page says after the hero.
 *
 * Ported from the reference about section, with its emoji icons dropped for
 * numerals and its palette inverted: black behind white type, so the top of
 * the page carries the same weight as the header and footer that bracket it.
 *
 * On a phone the three statements are swiped through rather than scrolled
 * past, which is the difference between one screen and three.
 */

const STATEMENTS = [
  {
    number: "01",
    title: "Preach the Word",
    body: "We proclaim the gospel plainly and without apology, trusting Scripture to do in a person what no argument of ours ever could. Every gathering is built around it.",
  },
  {
    number: "02",
    title: "Teach the Word",
    body: "Sunday teaching and midweek Bible study take the text slowly, so that what is heard on a Sunday can be carried into Monday and understood well enough to pass on.",
  },
  {
    number: "03",
    title: "Live the Word",
    body: "What is preached and taught is meant to be lived. We are a family that prays together, gives together, and shows up for one another across this city.",
  },
];

export default function MissionSection() {
  return (
    <section id="mission" className="scroll-mt-20 bg-black text-white md:scroll-mt-24">
      <div className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <h2 className="text-center font-serif text-[40px] leading-tight md:text-5xl">
          Our Mission Statements
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-[17px] leading-relaxed text-white/70">
          Three commitments shape everything we do at Gofamint Toronto, from what is said on a
          Sunday morning to how we live the rest of the week.
        </p>

        <div className="mt-16 grid items-start gap-12 md:mt-20 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:gap-16">
          <figure className="m-0">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl">
              <Image
                src="/pastor-samuel-adusi.jpg"
                alt="Pastor Samuel Adusi, Head Pastor of Gofamint Toronto"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover object-top"
              />
            </div>
            <figcaption className="mt-5">
              <p className="m-0 font-serif text-2xl">Pastor Samuel Adusi</p>
              <p className="m-0 mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                Head Pastor
              </p>
            </figcaption>
          </figure>

          {/* Sideways on a phone, where three stacked statements cost a
              screen and a half of scrolling; a column again from md up. */}
          <ol className="no-scrollbar -mx-6 m-0 flex snap-x snap-mandatory scroll-pl-6 list-none gap-5 overflow-x-auto px-6 pb-2 md:mx-0 md:block md:snap-none md:space-y-12 md:overflow-visible md:p-0">
            {STATEMENTS.map((statement) => (
              <li key={statement.number} className="w-[78%] shrink-0 snap-start md:w-auto">
                <span className="block text-sm font-semibold tracking-[0.2em] text-[var(--brand-red)]">
                  {statement.number}
                </span>
                <h3 className="mt-3 mb-0 font-serif text-3xl leading-tight">{statement.title}</h3>
                <p className="m-0 mt-3 text-[17px] leading-relaxed text-white/70">{statement.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
