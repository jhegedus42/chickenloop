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
  // Allow images from Vercel Blob Storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
