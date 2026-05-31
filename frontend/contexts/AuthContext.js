import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { isAdminEmail } from '../lib/adminAuth'
import { buildApiUrl } from '../lib/apiUrl'
import { withFirebaseAuthMessage } from '../lib/firebaseAuthErrors'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const clearAuthError = useCallback(() => setAuthError(''), [])

  const fetchUserProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(null)
      return
    }
    const fallbackRole = isAdminEmail(firebaseUser.email, process.env.NEXT_PUBLIC_ADMIN_EMAILS) ? 'admin' : 'client'
    const fallbackProfile = {
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || '',
      role: fallbackRole,
    }

    try {
      const token = await firebaseUser.getIdToken()
      const res = await fetch(buildApiUrl('/api/me'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUserProfile({
          ...fallbackProfile,
          ...(data.user || {}),
          role: fallbackRole === 'admin' ? 'admin' : (data.user?.role || 'client'),
        })
      } else {
        setUserProfile(fallbackProfile)
      }
    } catch (err) {
      console.error('fetchUserProfile error', err)
      setUserProfile(fallbackProfile)
    }
  }

  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      const error = withFirebaseAuthMessage(err)
      if (error.userMessage) {
        setAuthError(error.userMessage)
      }
    })

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      await fetchUserProfile(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result
  }

  const signUp = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: name })
    const token = await result.user.getIdToken()
    await fetch(buildApiUrl('/api/me'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    return result
  }

  const signInWithGoogle = async () => {
    clearAuthError()
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    try {
      return await signInWithPopup(auth, provider)
    } catch (err) {
      const popupFallbackCodes = new Set([
        'auth/cancelled-popup-request',
        'auth/operation-not-supported-in-this-environment',
        'auth/popup-blocked',
        'auth/web-storage-unsupported',
      ])

      if (popupFallbackCodes.has(err.code)) {
        try {
          await signInWithRedirect(auth, provider)
          return null
        } catch (redirectErr) {
          throw withFirebaseAuthMessage(redirectErr)
        }
      }

      throw withFirebaseAuthMessage(err)
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setUser(null)
    setUserProfile(null)
  }

  const value = {
    user,
    userProfile,
    loading,
    authError,
    clearAuthError,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
