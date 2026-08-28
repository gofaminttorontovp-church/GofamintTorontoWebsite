import type { Metadata } from "next";
import {
  Inter,
  Fraunces,
  Cormorant_Garamond,
  Playfair_Display,
  Marcellus,
  Instrument_Serif,
} from "next/font/google";
import DisplayFontSwitch from "@/components/DisplayFontSwitch";
import "./globals.css";

// Inter is the open-source substitute for SF Pro Display / SF Pro Text used
// by the Gofamint Toronto design system. It backs both --font-display and
// --font-text (see globals.css).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Display faces on trial, reachable with ?font= while developing. Declared
// without preloading, so a browser only fetches one if something actually asks
// for it — nothing extra is downloaded on a normal visit. next/font needs
// these spelled out literally, hence the repetition. Once a face is chosen,
// the rest of these come out.
const fraunces = Fraunces({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-fraunces" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "600", "700"], variable: "--font-cormorant" });
const playfair = Playfair_Display({ subsets: ["latin"], display: "swap", preload: false, variable: "--font-playfair" });
const marcellus = Marcellus({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--font-marcellus" });
const instrument = Instrument_Serif({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--font-instrument" });

const fontVariables = [inter, fraunces, cormorant, playfair, marcellus, instrument]
  .map((f) => f.variable)
  .join(" ");

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
    <html lang="en" className={fontVariables}>
      <body>
        <DisplayFontSwitch />
        {children}
      </body>
    </html>
  );
}
