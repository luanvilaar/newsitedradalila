import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Force project root so .env.local is picked up correctly
    root: __dirname,
  },
  images: {
    formats: ["image/webp", "image/avif"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
