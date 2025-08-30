import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce a standalone build ideal for Docker/Render
  output: 'standalone',
};

export default nextConfig;
