import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "../.next",
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
