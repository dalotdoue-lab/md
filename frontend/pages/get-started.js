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
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-olive border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Get Started — Let Investments</title>
        <meta name="description" content="Create your account or sign in to access your Let Investments dashboard." />
      </Head>

      <div className="min-h-screen bg-bone text-ink-soft flex flex-col font-sans">
        {/* Header */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="w-10 h-10 bg-ink rounded-md flex items-center justify-center">
              <span className="text-paper font-heading text-xl leading-none">L</span>
            </div>
            <div className="leading-none">
              <span className="text-ink font-heading text-xl block">Let</span>
              <span className="text-ink-muted text-[0.65rem] font-semibold uppercase tracking-label">Investments</span>
            </div>
          </Link>
        </div>

        {/* Main Box */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">

            {/* Card wrapper */}
            <div className="bg-paper border border-line rounded-lg p-8 shadow-card">

              {/* Step Title */}
              <div className="mb-8">
                <div className="eyebrow mb-4">
                  {mode === 'select' && 'Welcome'}
                  {mode === 'email-signin' && 'Sign In'}
                  {mode === 'email-signup' && 'Register'}
                </div>
                <h1 className="text-3xl font-heading text-ink leading-tight">
                  {mode === 'select' && 'Get started'}
                  {mode === 'email-signin' && 'Sign in'}
                  {mode === 'email-signup' && 'Create your account'}
                </h1>
                <p className="text-ink-soft text-sm mt-2 leading-relaxed">
                  {mode === 'select' && 'Choose how you want to access your dashboard.'}
                  {mode === 'email-signin' && 'Enter your email and password to log in.'}
                  {mode === 'email-signup' && 'Register a new account to begin investing.'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-clay/10 border border-clay/30 text-clay-deep px-4 py-3 rounded-md mb-6 text-sm flex items-start gap-2.5 animate-fadeIn">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-clay" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full flex items-center justify-center gap-3 bg-paper border border-line text-ink hover:bg-bone transition-colors duration-200 py-3 px-4 rounded-md font-medium disabled:opacity-60"
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
                    <div className="flex-1 h-px bg-line"></div>
                    <span className="text-ink-muted text-xs font-semibold uppercase tracking-label">or</span>
                    <div className="flex-1 h-px bg-line"></div>
                  </div>

                  {/* Continue with Email Button */}
                  <button
                    onClick={() => setMode('email-signin')}
                    className="w-full flex items-center justify-center gap-3 bg-ink text-paper hover:bg-olive-deep transition-colors duration-200 py-3 px-4 rounded-md font-medium"
                  >
                    <svg className="w-5 h-5 text-paper/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Continue with email
                  </button>

                  <p className="text-center text-xs text-ink-muted mt-6 leading-relaxed">
                    By continuing, you agree to our{' '}
                    <Link href="/terms" className="text-olive-deep hover:underline">Terms of Service</Link> and{' '}
                    <Link href="/privacy" className="text-olive-deep hover:underline">Privacy Policy</Link>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {mode === 'email-signup' && (
                    <div>
                      <label className="block text-xs font-semibold text-ink uppercase tracking-label mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-field text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-ink uppercase tracking-label mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field text-sm"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink uppercase tracking-label mb-2">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="input-field text-sm pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors"
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
                      <label className="block text-xs font-semibold text-ink uppercase tracking-label mb-2">Confirm Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="input-field text-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-60 mt-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-paper border-t-transparent rounded-full animate-spin"></div>
                    ) : mode === 'email-signin' ? (
                      'Sign in'
                    ) : (
                      'Create account'
                    )}
                  </button>

                  {/* Toggle Mode / Back */}
                  <div className="flex flex-col items-center justify-center gap-2 pt-2 text-sm text-ink-soft">
                    {mode === 'email-signin' ? (
                      <p>
                        Don't have an account?{' '}
                        <button type="button" onClick={() => { setMode('email-signup'); setError('') }} className="text-olive-deep font-semibold hover:underline">
                          Sign up
                        </button>
                      </p>
                    ) : (
                      <p>
                        Already have an account?{' '}
                        <button type="button" onClick={() => { setMode('email-signin'); setError('') }} className="text-olive-deep font-semibold hover:underline">
                          Log in
                        </button>
                      </p>
                    )}
                    <button type="button" onClick={() => { setMode('select'); setError('') }} className="text-xs text-ink-muted hover:text-ink font-medium tracking-wide flex items-center gap-1 mt-1">
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
