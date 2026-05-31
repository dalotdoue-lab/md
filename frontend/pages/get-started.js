import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

export default function GetStarted() {
  const { user, userProfile, signIn, signUp, signInWithGoogle, loading: authLoading } = useAuth()
  const router = useRouter()

  const [mode, setMode] = useState('select') // 'select' | 'email-signin' | 'email-signup'
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Redirect if logged in
  useEffect(() => {
    if (user && userProfile) {
      if (userProfile.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, userProfile, router])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.email.trim()) {
      setError('Email address is required.')
      return
    }

    if (mode === 'email-signup') {
      if (!formData.name.trim()) {
        setError('Full name is required.')
        return
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters.')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'email-signin') {
        await signIn(formData.email, formData.password)
      } else {
        await signUp(formData.email, formData.password, formData.name)
      }
    } catch (err) {
      console.error(err)
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid credentials. Please check your email and password.'
      }
      setError(messages[err.code] || err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Get Started — Kingstone Investments</title>
        <meta name="description" content="Access the secure onboarding gateway for Kingstone Investments." />
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Header */}
        <div className="p-6 relative z-10">
          <Link href="/" className="flex items-center space-x-2 w-fit">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-slate-950 font-bold text-lg">K</span>
            </div>
            <div>
              <span className="text-slate-100 font-bold text-lg block leading-none tracking-tight">Kingstone</span>
              <span className="text-emerald-400 text-[10px] font-bold tracking-widest uppercase">INVESTMENTS</span>
            </div>
          </Link>
        </div>

        {/* Main Box */}
        <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <div className="w-full max-w-md">
            
            {/* Card wrapper */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              
              {/* Decorative line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-blue-500"></div>

              {/* Step Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                  {mode === 'select' && 'Get Started'}
                  {mode === 'email-signin' && 'Sign In'}
                  {mode === 'email-signup' && 'Create Account'}
                </h1>
                <p className="text-slate-400 text-sm mt-2">
                  {mode === 'select' && 'Choose how you want to access your dashboard'}
                  {mode === 'email-signin' && 'Enter email and password to log in'}
                  {mode === 'email-signup' && 'Register a new account to begin investing'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-rose-950/50 border border-rose-800/60 text-rose-200 px-4 py-3 rounded-2xl mb-6 text-sm flex items-start gap-2.5 animate-fadeIn">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {mode === 'select' ? (
                <div className="space-y-4">
                  {/* Google Button */}
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-slate-100 text-slate-900 hover:bg-slate-200 transition duration-200 py-3.5 px-4 rounded-2xl font-semibold shadow-lg disabled:opacity-60"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-[1px] bg-slate-800"></div>
                    <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">or</span>
                    <div className="flex-1 h-[1px] bg-slate-800"></div>
                  </div>

                  {/* Continue with Email Button */}
                  <button
                    onClick={() => setMode('email-signin')}
                    className="w-full flex items-center justify-center gap-3 bg-slate-800/80 border border-slate-700/60 text-slate-100 hover:bg-slate-800 transition duration-200 py-3.5 px-4 rounded-2xl font-semibold shadow-inner"
                  >
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Continue with Email
                  </button>

                  <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
                    By onboarding, you agree to our{' '}
                    <a href="#" className="text-emerald-400 hover:underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-emerald-400 hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {mode === 'email-signup' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 pr-12 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  {mode === 'email-signup' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-500 text-slate-950 font-bold py-3.5 px-4 rounded-2xl hover:bg-emerald-400 transition duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    ) : mode === 'email-signin' ? (
                      'Sign In'
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  {/* Toggle Mode / Back */}
                  <div className="flex flex-col items-center justify-center gap-2 pt-2 text-sm text-slate-400">
                    {mode === 'email-signin' ? (
                      <p>
                        Don't have an account?{' '}
                        <button type="button" onClick={() => { setMode('email-signup'); setError('') }} className="text-emerald-400 font-semibold hover:underline">
                          Sign up
                        </button>
                      </p>
                    ) : (
                      <p>
                        Already have an account?{' '}
                        <button type="button" onClick={() => { setMode('email-signin'); setError('') }} className="text-emerald-400 font-semibold hover:underline">
                          Log in
                        </button>
                      </p>
                    )}
                    <button type="button" onClick={() => { setMode('select'); setError('') }} className="text-xs text-slate-500 hover:text-slate-300 font-medium tracking-wide flex items-center gap-1 mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back to options
                    </button>
                  </div>
                </form>
              )}

            </div>

          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  )
}
