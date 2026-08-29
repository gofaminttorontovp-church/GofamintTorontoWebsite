import type { Metadata } from "next";

/**
 * The editing tool's own chrome: none of the site's header or footer, a calm
 * neutral ground, and a firm request that search engines stay away. The link
 * is shared by hand with the media team; it is never linked from the site.
 */

export const metadata: Metadata = {
  title: "Website updates",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-text)", background: "#f7f6f3", minHeight: "100vh" }}>
      {children}
    </div>
  );
}
