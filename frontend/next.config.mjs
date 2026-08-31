/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow all origins for dev resources (temporary demo setup)
  allowedDevOrigins: ['fate-floppy-somerset-enrolled.trycloudflare.com', 'reason-discounted-elliott-wilson.trycloudflare.com'],
}

export default nextConfig
