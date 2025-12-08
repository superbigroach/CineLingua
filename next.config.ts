import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    dirs: ['src'],
  },
  // Exclude contracts folder from build
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/contracts/**'],
    };
    return config;
  },
};

export default nextConfig;
