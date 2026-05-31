import AdminSidebar from './AdminSidebar'
import { useState } from 'react'

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Bar */}
        <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 lg:hidden"
          >
            ☰
          </button>

          <h1 className="text-lg font-bold text-gray-800">
            Admin Dashboard
          </h1>

          <div className="text-sm text-gray-600">
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