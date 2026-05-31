export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const rawBase = process.env.NEXT_PUBLIC_API_URL || ''
  const base = rawBase.replace(/\/$/, '')

  if (!base || base === '/') return normalizedPath

  if (base.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${base}${normalizedPath.slice(4)}`
  }

  return `${base}${normalizedPath}`
}
