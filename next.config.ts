import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  allowedDevOrigins: ["*.app.github.dev", "*.github.dev"],
  experimental: {
    serverActions: {
      allowedOrigins: ["*.app.github.dev", "*.github.dev"],
    },
  },
};

export default nextConfig;
