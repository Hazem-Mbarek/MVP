/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow all origins for dev resources (temporary demo setup)
  allowedDevOrigins: ['barcelona-inbox-blvd-weapon.trycloudflare.com', 'customs-words-handbags-articles.trycloudflare.com'],
}

export default nextConfig

