/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow all origins for dev resources (temporary demo setup)
  allowedDevOrigins: ['progressive-mining-sufficient-genome.trycloudflare.com'],
}

export default nextConfig
