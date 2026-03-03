import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Support multiple formats for better compatibility
    formats: ["image/webp", "image/avif"],
    // Ensure images load properly even if conversion fails
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
