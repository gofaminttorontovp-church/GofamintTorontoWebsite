import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /**
   * The oldest page a visitor may be handed, in seconds: two days.
   *
   * The Media page asks Facebook for its pictures and reels once a day, and
   * what comes back are signed links that stop working after about four and a
   * half. On its own that would be a comfortable margin — but a page only goes
   * stale, it does not refresh itself. Next serves the copy it has and fetches
   * a new one behind it, so on a week when nobody visits, the first person
   * back would be handed links older than the day they were cached, and on a
   * quiet enough site, older than the links themselves.
   *
   * Past this age Next stops serving the old copy and fetches before it
   * answers. Two days is the ceiling on how old a link can be, which leaves
   * the best part of three days spare.
   */
  expireTime: 2 * 24 * 60 * 60,

  // Pin the workspace root to this project. Without this, Next.js walks up and
  // finds a stray lockfile in the home directory and mis-infers the root.
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // The video gallery's posters are YouTube's own thumbnails, served from
    // these two hosts. The photo gallery's pictures come from the church's
    // Facebook album, which Facebook serves from a rotating set of regional
    // hosts under fbcdn.net. Nothing else is fetched from off-site.
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "**.fbcdn.net" },
    ],
  },
};

export default nextConfig;
