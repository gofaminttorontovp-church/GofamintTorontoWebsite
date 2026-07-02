import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter is the open-source substitute for SF Pro Display / SF Pro Text used
// by the Gofamint Toronto design system. It backs both --font-display and
// --font-text (see globals.css).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
