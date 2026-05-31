import Link from 'next/link'
import { useRouter } from 'next/router'

const AdminSidebar = ({ isOpen }) => {
  const router = useRouter()

  const menu = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Users', href: '/admin/users' },
    { name: 'KYC Verification', href: '/admin/kyc' },
    { name: 'Transactions', href: '/admin/transactions' },
    { name: 'Wallet', href: '/admin/wallet' },
    { name: 'Projects', href: '/admin/projects' },
    { name: 'Blog Management', href: '/admin/blog' },
    { name: 'Market Insights', href: '/admin/market' },
    { name: 'Settings', href: '/admin/settings' },
  ]

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-ink text-paper transition-all duration-300 min-h-screen`}>

      {/* Logo */}
      <div className="p-5 border-b border-paper/10">
        {isOpen ? (
          <span className="font-heading text-lg">Let <span className="text-paper/50 text-xs font-semibold uppercase tracking-label align-middle ml-1">Admin</span></span>
        ) : (
          <span className="font-heading text-xl">L</span>
        )}
      </div>

      {/* Menu */}
      <div className="mt-4 px-2 space-y-1">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block px-3 py-2.5 text-sm rounded-md transition-colors
              ${router.pathname === item.href ? 'bg-paper/10 text-paper' : 'text-paper/70 hover:bg-paper/5 hover:text-paper'}`}
          >
            {isOpen ? item.name : item.name.charAt(0)}
          </Link>
        ))}

        {/* Logout */}
        <button
          className="w-full text-left px-3 py-2.5 text-sm text-clay hover:bg-paper/5 rounded-md mt-6 transition-colors"
          onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/'
          }}
        >
          {isOpen ? 'Logout' : '⏻'}
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar