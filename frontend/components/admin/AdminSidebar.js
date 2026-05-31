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
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 min-h-screen`}>
      
      {/* Logo */}
      <div className="p-4 text-xl font-bold border-b border-gray-700">
        {isOpen ? 'ADMIN PANEL' : 'A'}
      </div>

      {/* Menu */}
      <div className="mt-4 space-y-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`block px-4 py-3 text-sm rounded hover:bg-gray-800 transition
              ${router.pathname === item.href ? 'bg-gray-800' : ''}`}
          >
            {isOpen ? item.name : item.name.charAt(0)}
          </Link>
        ))}

        {/* Logout */}
        <button
          className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-800 mt-6"
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