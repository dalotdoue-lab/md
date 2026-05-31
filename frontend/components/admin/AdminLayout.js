import AdminSidebar from './AdminSidebar'
import { useState } from 'react'

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-bone">

      {/* Sidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* Top Bar */}
        <div className="bg-paper border-b border-line px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-ink-soft lg:hidden"
          >
            ☰
          </button>

          <h1 className="text-lg font-heading text-ink">
            Admin dashboard
          </h1>

          <div className="text-sm text-ink-soft">
            Admin User
          </div>
        </div>

        {/* Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout