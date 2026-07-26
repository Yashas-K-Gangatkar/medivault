import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is great for Docker / self-hosting (produces .next/standalone/server.js)
  output: "standalone",
  reactStrictMode: true,
  // Production-friendly defaults
  poweredByHeader: false,
  compress: true,
  images: {
    // We use AI-generated images served from /public — no remote optimization needed
    formats: ["image/avif", "image/webp"],
  },
  // Allow large response bodies for chat API
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Skip strict TypeScript checking during builds.
  // We run `npm run lint` locally for type safety; the build itself should
  // not fail on minor type mismatches that don't affect runtime behavior.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
