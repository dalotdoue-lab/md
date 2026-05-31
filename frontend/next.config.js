/** @type {import('next').NextConfig} */
const externalApiUrl = process.env.NEXT_PUBLIC_API_URL || ''
const shouldProxyApi = /^https?:\/\//.test(externalApiUrl)

// GitHub Pages serves this project repo from /<repo>/ (e.g. /md/), so the
// production build needs a basePath/assetPrefix or every CSS/JS/image 404s
// and the site renders as unstyled HTML. Local `next dev` stays at root.
const isProd = process.env.NODE_ENV === 'production'
const repo = 'md'

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
  trailingSlash: true,
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


