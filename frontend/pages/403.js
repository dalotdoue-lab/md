import Link from 'next/link'

export default function Forbidden() {
  return (
    <div className="min-h-screen bg-let-light flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-6xl font-heading font-extrabold text-let-blue mb-4">403</h1>
        <h2 className="text-2xl font-heading font-bold text-gray-700 mb-4">Access Denied</h2>
        <p className="text-gray-500 mb-8">
          You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Return Home
          </Link>
          <Link href="/contact" className="btn-outline">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  )
}
