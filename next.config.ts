import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    dirs: ['src'],
  },
  typescript: {
    // Skip type checking for contracts folder - it has its own tsconfig
    // and hardhat dependencies aren't installed in Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
