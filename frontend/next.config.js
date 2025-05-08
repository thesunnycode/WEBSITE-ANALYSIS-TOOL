/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable CSS optimization
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
