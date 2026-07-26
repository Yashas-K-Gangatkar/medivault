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
};

export default nextConfig;
