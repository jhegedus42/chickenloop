import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations for dev server
  typescript: {
    // Faster TypeScript compilation
    ignoreBuildErrors: false,
  },
  // Enable faster refresh
  reactStrictMode: true,
  // Faster development builds
  compiler: {
    // Remove console logs in production (optional)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['react', 'react-dom'],
  },
};

export default nextConfig;
