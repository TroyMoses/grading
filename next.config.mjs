/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Also ignore ESLint errors during the build
    ignoreDuringBuilds: true,
  },
  swcMinify: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
