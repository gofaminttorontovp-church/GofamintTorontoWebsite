import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /**
   * The oldest page a visitor may be handed, in seconds: two days.
   *
   * What the Media page shows are signed links that stop working after about
   * four and a half days, and a page only goes stale — it does not refresh
   * itself. Next serves the copy it has and fetches a new one behind it, so on
   * a quiet week the first person back would be handed a page older than
   * anything its own cadence suggests, and on a quiet enough site, one whose
   * links have died. That page would not be empty; it would be worse, drawn
   * in full with every picture broken.
   *
   * Past this age Next stops handing out the old copy and fetches before it
   * answers. Two days here, on top of the day the photographs may already have
   * been held for, puts the oldest link a visitor can be shown at three days —
   * a day and a half inside the four and a half.
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
