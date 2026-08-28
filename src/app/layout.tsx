import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// Inter carries the body text — the open-source substitute for SF Pro Text
// used by the Gofamint Toronto design system. It backs --font-text.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Cormorant Garamond carries the display voice: the headline, the wordmark,
// the section titles. Loaded as its variable font, so every weight the design
// asks for comes out of one file. See --font-display in globals.css.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Gofamint Toronto",
    template: "%s | Gofamint Toronto",
  },
  description:
    "A parish of The Gospel Faith Mission International in the heart of Toronto — one family gathered around the Word, worship, and one another. Come as you are.",
  keywords: [
    "Gofamint Toronto",
    "Gospel Faith Mission International",
    "church Toronto",
    "North York church",
    "Sunday service",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>{children}</body>
    </html>
  );
}
