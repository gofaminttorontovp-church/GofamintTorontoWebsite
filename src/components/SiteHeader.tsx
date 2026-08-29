"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScrollProgress } from "@/components/ui/use-scroll-progress";
import { cn } from "@/lib/utils";
import { HEADER_CTAS, HEADER_LINKS } from "@/lib/site";

/** How far the page travels while the top bar draws in to its pill, in px. */
const SHRINK_DISTANCE = 140;

/**
 * The site header, shared by every page including the home hero.
 *
 * It is black throughout — a full-bleed bar across the top of the page that
 * condenses into a floating pill as you scroll: narrower, rounded, and lifted
 * off the top edge on desktop, each of those interpolated across the first
 * SHRINK_DISTANCE pixels rather than switched at a threshold. On phones it
 * stays a full-width bar and opens a full-screen menu.
 *
 * `overlay` takes the header out of the flow so the page beneath starts at
 * the very top of the viewport — the home page needs that, since the hero
 * measures its own scroll against the top of the document. Content pages
 * leave it off and let the header hold its place in the flow.
 */
export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  // The pill forms over the first stretch of the page rather than at a
  // threshold; the hook feeds the progress straight to CSS.
  const headerRef = useScrollProgress<HTMLElement>(SHRINK_DISTANCE);

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

  /**
   * Closing on tap, for the two header links that are hashes on the home page
   * rather than routes of their own.
   *
   * The route-change effect above cannot close the menu for those: /#mission
   * tapped from / leaves the pathname exactly where it was, so it never fires.
   * And the scroll lock has to be released here, synchronously, rather than
   * left to the effect a render later — the browser scrolls to the hash as the
   * link is followed, and it will not scroll a body still pinned at
   * overflow: hidden. Tapping Visit would close the menu onto an unmoved page.
   * The effect sets the same empty value again on the next render, harmlessly.
   */
  const closeMenu = React.useCallback(() => {
    document.body.style.overflow = "";
    setOpen(false);
  }, []);

  return (
    /* The menu panel is a sibling of the header rather than a child of it,
       and it has to stay that way. The header carries `backdrop-blur`, and an
       element with a backdrop-filter becomes the containing block for any
       `position: fixed` inside it — so nested, the panel's `top-14 bottom-0`
       resolved against a 57px header instead of the viewport and it opened
       two pixels tall with the links clipped out of sight. The menu looked
       dead on every phone. */
    <>
      <header
        ref={headerRef}
        className={cn(
          // Black throughout — barely translucent, so what is behind warms it
          // rather than greying it out. Only the shape changes on scroll, and
          // that lives in .header-fluid, driven by --header-p.
          "header-dark header-fluid bg-background/95 supports-[backdrop-filter]:bg-background/90 backdrop-blur-lg text-foreground",
          "z-50 mx-auto w-full",
          overlay ? "fixed inset-x-0 top-0" : "sticky top-0",
        )}
      >
        <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 md:h-12">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Gofamint Toronto logo" className="h-9 w-9 object-contain" />
            <span className="text-[20px] font-semibold tracking-normal text-foreground" style={{ fontFamily: "var(--font-display)" }}>
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
      </header>

      <div
        className={cn(
          // `header-dark` re-points the token layer the same way the bar
          // above does, so the panel is the black the bar is rather than the
          // white it inherited from the page. It is a sibling of the header,
          // not a child, so it cannot pick that up on its own.
          // `text-foreground` is carried here, not left to the links: the
          // unlayered `a { color: inherit }` in globals.css beats any colour
          // utility on an anchor, so the panel has to be the one holding the
          // colour they inherit.
          "header-dark bg-background/90 text-foreground fixed top-14 right-0 bottom-0 left-0 z-50 flex flex-col overflow-hidden border-y border-border backdrop-blur-lg md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <div
          data-slot={open ? "open" : "closed"}
          className={cn(
            "data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out",
            // The buttons follow the links at the same interval the links
            // keep between themselves. They used to be pushed to the foot of
            // the screen, a third of a phone away from the thing above them.
            "flex h-full w-full flex-col gap-y-2 p-4",
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
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {HEADER_CTAS.map((cta) => (
              <Button key={cta.href} variant={cta.variant} className="w-full" asChild>
                <Link href={cta.href} onClick={closeMenu}>
                  {cta.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
