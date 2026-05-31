import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

function PasswordStrength({ password }) {
  const getStrength = () => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const strength = getStrength()
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-clay', 'bg-clay', 'bg-olive', 'bg-olive-deep']
  const textColors = ['', 'text-clay-deep', 'text-clay-deep', 'text-olive-deep', 'text-olive-deep']

  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= strength ? colors[strength] : 'bg-line'
            }`}
          />
        ))}
      </div>
      <span className={`text-xs font-medium ${textColors[strength]}`}>
        Password strength: {labels[strength]}
      </span>
    </div>
  )
}

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signUp, signInWithGoogle, user, authError, clearAuthError } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  useEffect(() => {
    if (!authError) return
    setError(authError)
    clearAuthError()
  }, [authError, clearAuthError])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validate = () => {
    if (!formData.name.trim()) return 'Full name is required.'
    if (!formData.email.trim()) return 'Email address is required.'
    if (formData.password.length < 8) return 'Password must be at least 8 characters.'
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setError('')
    setEmailLoading(true)

    try {
      await signUp(formData.email, formData.password, formData.name)
      router.push('/dashboard')
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
      }
      setError(messages[err.code] || 'Failed to create account. Please try again.')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.userMessage || 'Google sign-in failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const isSubmitting = emailLoading || googleLoading

  return (
    <div className="min-h-screen bg-bone flex flex-col">
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

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="mb-8">
              <div className="eyebrow mb-4">Get Started</div>
              <h1 className="text-3xl font-heading text-ink leading-tight">Create your account</h1>
              <p className="text-ink-soft mt-2">Join 500+ investors growing their wealth.</p>
            </div>

            {error && (
              <div className="bg-clay/10 border border-clay/30 text-clay-deep px-4 py-3 rounded-md mb-6 text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-clay" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="John Kamau"
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-field pr-12"
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
                <PasswordStrength password={formData.password} />
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-clay-deep text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-olive-deep hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-olive-deep hover:underline">Privacy Policy</Link>.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full text-base py-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {emailLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </span>
                ) : 'Create account'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-line"></div>
              <span className="text-ink-muted text-xs font-semibold uppercase tracking-label">or</span>
              <div className="flex-1 h-px bg-line"></div>
            </div>

            {/* Google Sign-up */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 border border-line rounded-md py-3 text-ink hover:bg-bone transition-colors duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed bg-paper"
            >
              {googleLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-olive border-t-transparent rounded-full animate-spin"></div>
                  Opening Google...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <p className="text-center mt-6 text-ink-soft text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-olive-deep font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
