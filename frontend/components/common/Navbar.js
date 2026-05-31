import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { user, userProfile, signOut, loading } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (err) {
      console.error('Logout error', err)
    }
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Projects', href: '/projects' },
    { name: 'Investors', href: '/investors' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActive = (href) => {
    if (href === '/') return router.pathname === '/'
    return router.pathname.startsWith(href)
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom flex justify-between items-center py-4">

        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-let-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div>
              <span className="text-let-blue font-bold text-xl block leading-none">Let</span>
              <span className="text-let-green text-xs font-semibold tracking-widest">INVESTMENTS</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                ${isActive(item.href)
                  ? 'bg-let-blue text-white'
                  : 'text-gray-700 hover:bg-let-light hover:text-let-blue'
                }`}
            >
              {item.name}
            </Link>
          ))}

          {/* Auth Buttons */}
          {!loading && !user && (
            <Link href="/login" className="ml-4 btn-primary text-sm px-4 py-2">
              Login
            </Link>
          )}

          {!loading && user && userProfile?.role === 'client' && (
            <Link href="/dashboard" className="ml-2 btn-primary text-sm px-4 py-2">
              Dashboard
            </Link>
          )}

          {!loading && user && userProfile?.role === 'admin' && (
            <Link href="/admin/dashboard" className="ml-2 btn-secondary text-sm px-4 py-2">
              Admin Panel
            </Link>
          )}

          {!loading && user && (
            <button onClick={handleLogout} className="ml-2 btn-danger text-sm px-4 py-2">
              Logout
            </button>
          )}
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-let-light"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-100 px-4 pb-4 pt-2 space-y-1 bg-white">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive(item.href)
                  ? 'bg-let-blue text-white'
                  : 'text-gray-700 hover:bg-let-light'
                }`}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          <div className="pt-2 border-t border-gray-100 space-y-2">
            {!user && (
              <Link href="/login" className="btn-primary w-full text-center block">
                Login
              </Link>
            )}
            {user && userProfile?.role === 'client' && (
              <Link href="/dashboard" className="btn-primary w-full text-center block">
                Dashboard
              </Link>
            )}
            {user && userProfile?.role === 'admin' && (
              <Link href="/admin/dashboard" className="btn-secondary w-full text-center block">
                Admin Panel
              </Link>
            )}
            {user && (
              <button onClick={handleLogout} className="btn-danger w-full">
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
