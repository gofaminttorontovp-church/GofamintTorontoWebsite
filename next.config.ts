import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, Next.js walks up and
  // finds a stray lockfile in the home directory and mis-infers the root.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // The video gallery's posters are YouTube's own thumbnails, served from
    // these two hosts. Nothing else is fetched from off-site.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/vi/**" },
    ],
  },
};

export default nextConfig;
