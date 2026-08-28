import { SocialLinks } from "@/components/ui/social-links";
import { CONTACT, LOCATION, SERVICE_TIMES, SOCIALS } from "@/lib/site";

/**
 * When we gather, where to find us, and how to reach us: the three things a
 * visitor came looking for, set out in one light band before the footer.
 *
 * A phone pairs them off rather than stacking all three, and sets the four
 * times two abreast, which halves what the section costs to scroll past.
 *
 * Everything here is read from site.ts, so nothing else that quotes a time
 * or an address can disagree with it.
 */
export default function ConnectSection() {
  return (
    <section
      id="connect"
      className="scroll-mt-20 bg-[color:var(--canvas-parchment)] text-[color:var(--ink)] md:scroll-mt-24"
    >
      <div className="mx-auto max-w-5xl px-6 py-24 md:py-28">
        <h2 className="text-center font-serif text-[40px] leading-tight md:text-5xl">
          Come and Worship With Us
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:mt-16 md:grid-cols-3 md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-48)]">
              Service Times
            </h3>
            <ul className="m-0 mt-5 grid list-none grid-cols-2 gap-x-6 gap-y-4 p-0 md:block md:space-y-4">
              {SERVICE_TIMES.map((service) => (
                <li key={`${service.name} ${service.when}`}>
                  <p
                    className={
                      "m-0 font-serif text-xl leading-tight" +
                      ("lead" in service && service.lead ? " text-[var(--brand-red)]" : "")
                    }
                  >
                    {service.name}
                  </p>
                  <p className="m-0 mt-1 text-[15px] text-[color:var(--ink-48)]">{service.when}</p>
                </li>
              ))}
            </ul>
            <p className="m-0 mt-5 text-[13px] text-[color:var(--ink-48)]">All times are Eastern.</p>
          </div>

          <div>
            <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-48)]">
              Where to Find Us
            </h3>
            <address className="mt-5 not-italic">
              {LOCATION.lines.map((line) => (
                <p key={line} className="m-0 text-[17px] leading-relaxed text-[color:var(--ink-80)]">
                  {line}
                </p>
              ))}
            </address>
            <a
              href={LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-full border border-black/20 px-5 py-2.5 text-[15px] text-[color:var(--ink)] transition-colors duration-200 hover:bg-black hover:text-white"
            >
              Get directions
            </a>
          </div>

          <div>
            <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-48)]">
              Get in Touch
            </h3>
            <div className="mt-5 space-y-2">
              <p className="m-0">
                <a
                  href={CONTACT.phoneHref}
                  className="text-[17px] text-[color:var(--ink-80)] underline-offset-4 transition-colors hover:text-[color:var(--ink)] hover:underline"
                >
                  {CONTACT.phone}
                </a>
              </p>
              <p className="m-0">
                <a
                  href={CONTACT.emailHref}
                  className="break-all text-[17px] text-[color:var(--ink-80)] underline-offset-4 transition-colors hover:text-[color:var(--ink)] hover:underline"
                >
                  {CONTACT.email}
                </a>
              </p>
            </div>
            <SocialLinks items={SOCIALS} on="light" className="mt-7 justify-start" />
          </div>
        </div>
      </div>
    </section>
  );
}
