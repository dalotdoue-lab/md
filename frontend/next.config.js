/** @type {import('next').NextConfig} */
const externalApiUrl = process.env.NEXT_PUBLIC_API_URL || ''
const shouldProxyApi = /^https?:\/\//.test(externalApiUrl)

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
    domains: ['source.unsplash.com', 'images.unsplash.com'],
  },
  async rewrites() {
    if (!shouldProxyApi) return []

    return [{
      source: '/api/:path*',
      destination: `${externalApiUrl.replace(/\/$/, '')}/api/:path*`,
    }]
  },
}

module.exports = nextConfig


