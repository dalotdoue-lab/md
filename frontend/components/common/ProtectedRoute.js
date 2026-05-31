import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const router = useRouter()
  const { user, userProfile, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (allowedRoles.length > 0 && userProfile) {
      if (!allowedRoles.includes(userProfile.role)) {
        router.push('/403')
      }
    }
  }, [user, userProfile, loading, router, allowedRoles])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-let-light">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-let-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-let-blue font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (allowedRoles.length > 0 && userProfile && !allowedRoles.includes(userProfile.role)) {
    return null
  }

  return children
}

export default ProtectedRoute
