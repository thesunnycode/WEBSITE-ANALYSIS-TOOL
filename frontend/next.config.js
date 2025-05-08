/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure output for better Vercel compatibility
  output: "standalone",
  // Remove experimental features that might cause issues
  experimental: {
    // Remove optimizeCss as it's causing issues with Vercel
  },
};

module.exports = nextConfig;
