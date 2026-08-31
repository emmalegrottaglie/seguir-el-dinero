import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Portraits come from Wikimedia Commons (see scripts/fetch-photos.mjs).
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
    ],
  },
};

export default nextConfig;
