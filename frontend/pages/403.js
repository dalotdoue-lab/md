import Link from 'next/link'

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-bone flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-clay mb-6 flex justify-center">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-7xl font-heading text-ink mb-4">403</h1>
        <h2 className="text-2xl font-heading text-ink-soft mb-4">Access denied</h2>
        <p className="text-ink-muted mb-8 leading-relaxed">
          You don&apos;t have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Return home
          </Link>
          <Link href="/contact" className="btn-outline">
            Contact support
          </Link>
        </div>
      </div>
    </div>
  )
}
