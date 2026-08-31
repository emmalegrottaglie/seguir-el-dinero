import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /sueldos and /caras merged into /politicos; keep old links working.
  async redirects() {
    return [
      { source: "/:locale/sueldos", destination: "/:locale/politicos", permanent: true },
      { source: "/:locale/caras", destination: "/:locale/politicos", permanent: true },
      { source: "/:locale/politician/:slug", destination: "/:locale/politicos", permanent: true },
    ];
  },
  images: {
    // Portraits come from Wikimedia Commons (see scripts/fetch-photos.mjs).
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
    ],
  },
};

export default nextConfig;
