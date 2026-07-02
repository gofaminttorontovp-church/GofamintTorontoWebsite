import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
};

/**
 * The Gofamint Toronto pill button.
 * Renders as an anchor so it works as a link/CTA. `primary` is the accent
 * fill; `secondary` is the pearl surface with a soft hairline ring.
 */
export default function Button({
  children,
  href = "#",
  variant = "primary",
}: ButtonProps) {
  return (
    <a
      href={href}
      className={`btn ${variant === "primary" ? "btn-primary" : "btn-secondary"}`}
    >
      {children}
    </a>
  );
}
