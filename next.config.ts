import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. Without this, Next.js walks up and
  // finds a stray lockfile in the home directory and mis-infers the root.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
