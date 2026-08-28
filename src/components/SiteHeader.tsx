"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { cn } from "@/lib/utils";
import { HEADER_CTAS, HEADER_LINKS } from "@/lib/site";

/**
 * The site header, shared by every page including the home hero.
 *
 * It starts transparent so the hero's sky (and the drawn line) run clean
 * behind it, then settles into a frosted, floating pill once the page is
 * scrolled — narrower, rounded, and lifted off the top edge on desktop.
 * On phones it stays a full-width bar and opens a full-screen menu.
 *
 * `overlay` takes the header out of the flow so the page beneath starts at
 * the very top of the viewport — the home page needs that, since the hero
 * measures its own scroll against the top of the document. Content pages
 * leave it off and let the header hold its place in the flow.
 */
export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const pathname = usePathname();
  // Black once it has a surface of its own; ink-on-sky while transparent.
  const dark = scrolled || open;

  React.useEffect(() => {
    if (open) {
      // Disable scroll
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable scroll
      document.body.style.overflow = "";
    }

    // Cleanup when component unmounts (important for Next.js)
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // A route change should never leave the overlay hanging over the new page.
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "z-50 mx-auto w-full max-w-5xl border-b border-transparent text-foreground md:rounded-md md:border md:border-transparent md:transition-all md:ease-out",
        overlay ? "fixed inset-x-0 top-0" : "sticky top-0",
        dark && "header-dark",
        {
          // Barely translucent: enough for the sky to warm the black, not
          // enough to turn it grey.
          "bg-background/95 supports-[backdrop-filter]:bg-background/90 border-border md:border-border backdrop-blur-lg md:top-4 md:max-w-4xl md:shadow":
            scrolled && !open,
          "bg-background/95": open,
        },
      )}
    >
      <nav
        className={cn(
          "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          },
        )}
      >
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Gofamint Toronto logo" className="h-9 w-9 object-contain" />
          <span className="text-[17px] font-semibold tracking-[-0.01em] text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Gofamint Toronto
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {HEADER_LINKS.map((link) => (
            <Link
              key={link.href}
              className={buttonVariants({
                variant: "ghost",
                className: pathname === link.href ? "font-semibold" : "text-foreground/70",
              })}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          {HEADER_CTAS.map((cta) => (
            <Button key={cta.href} variant={cta.variant} asChild>
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          ))}
        </div>

        <Button size="icon" variant="outline" onClick={() => setOpen(!open)} className="md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>

      <div
        className={cn(
          "bg-background/90 fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y border-border backdrop-blur-lg md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div
          data-slot={open ? "open" : "closed"}
          className={cn(
            "data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out",
            "flex h-full w-full flex-col justify-between gap-y-2 p-4",
          )}
        >
          <div className="grid gap-y-2">
            {HEADER_LINKS.map((link) => (
              <Link
                key={link.href}
                className={buttonVariants({
                  variant: "ghost",
                  className: cn("justify-start", pathname === link.href ? "font-semibold" : "text-foreground/70"),
                })}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {HEADER_CTAS.map((cta) => (
              <Button key={cta.href} variant={cta.variant} className="w-full" asChild>
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
