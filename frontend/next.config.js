/** @type {import('next').NextConfig} */
module.exports = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure static generation
  output: "standalone",
  // Configure page generation
  pageExtensions: ["ts", "tsx", "js", "jsx"],
  // Configure build optimization
  poweredByHeader: false,
  // Configure static optimization
  staticPageGenerationTimeout: 120,
  // Configure image optimization
  images: {
    unoptimized: true,
  },
  // Configure experimental features
  experimental: {
    // Enable app directory
    appDir: true,
    // Enable server actions
    serverActions: true,
  },
  // Configure build output
  distDir: ".next",
  // Configure server
  generateEtags: false,
};
