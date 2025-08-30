import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a standalone build ideal for Docker/Render
  output: 'standalone',
  eslint: {
    // Do not fail the production build on ESLint warnings/errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
