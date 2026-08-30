/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow all origins for dev resources (temporary demo setup)
  allowedDevOrigins: ['crossword-dealt-fighter-land.trycloudflare.com'],
}

export default nextConfig
