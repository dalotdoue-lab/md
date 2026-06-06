/** @type {import('next').NextConfig} */
const externalApiUrl = process.env.NEXT_PUBLIC_API_URL || ''
const shouldProxyApi = /^https?:\/\//.test(externalApiUrl)

// GitHub Pages serves this project repo from /<repo>/ (e.g. /md/), so the
// production build needs a basePath/assetPrefix or every CSS/JS/image 404s
// and the site renders as unstyled HTML. Local `next dev` stays at root.
// GITHUB_PAGES=true enables static export mode for GitHub Pages deployment.
// When running `next dev` or standard `next build` (e.g. for Vercel/local),
// static export is disabled so API routes and rewrites work correctly.
const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const isProd = process.env.NODE_ENV === 'production'
const repo = 'md'

const nextConfig = {
  reactStrictMode: true,
  ...(isGitHubPages ? { output: 'export' } : {}),
  basePath: isGitHubPages ? `/${repo}` : '',
  assetPrefix: isGitHubPages ? `/${repo}/` : '',
  trailingSlash: isGitHubPages,
  images: {
    unoptimized: true,
    domains: ['source.unsplash.com', 'images.unsplash.com'],
  },
  async rewrites() {
    // rewrites() only runs when output !== 'export'
    if (!shouldProxyApi) return []

    return [{
      source: '/api/:path*',
      destination: `${externalApiUrl.replace(/\/$/, '')}/api/:path*`,
    }]
  },
}

module.exports = nextConfig


