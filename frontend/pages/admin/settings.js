import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import { apiGet, apiPut } from '../../lib/api'

const initialForm = {
  mpesaPaybill: '',
  mpesaAccountNumber: '',
  mpesaAccountName: '',
  systemDown: false,
  systemMessage: ''
}

export default function AdminSettings() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading, signOut } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    if (userProfile && userProfile.role !== 'admin') router.push('/403')
  }, [authLoading, router, user, userProfile])

  useEffect(() => {
    const loadSettings = async () => {
      if (!user || userProfile?.role !== 'admin') return
      setLoading(true)
      setError('')
      try {
        const res = await apiGet('/api/admin/settings')
        const settings = res.settings || {}
        setForm({
          mpesaPaybill: settings.mpesaPaybill || settings.mpesaNumber || '',
          mpesaAccountNumber: settings.mpesaAccountNumber || '',
          mpesaAccountName: settings.mpesaAccountName || settings.mpesaName || '',
          systemDown: Boolean(settings.systemDown),
          systemMessage: settings.systemMessage || ''
        })
      } catch (err) {
        setError(err.message || 'Failed to load settings.')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user, userProfile?.role])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setSaved(false)
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    try {
      const res = await apiPut('/api/admin/settings', {
        mpesaPaybill: form.mpesaPaybill.trim(),
        mpesaAccountNumber: form.mpesaAccountNumber.trim(),
        mpesaAccountName: form.mpesaAccountName.trim(),
        systemDown: form.systemDown,
        systemMessage: form.systemMessage.trim()
      })
      const settings = res.settings || {}
      setForm({
        mpesaPaybill: settings.mpesaPaybill || '',
        mpesaAccountNumber: settings.mpesaAccountNumber || '',
        mpesaAccountName: settings.mpesaAccountName || '',
        systemDown: Boolean(settings.systemDown),
        systemMessage: settings.systemMessage || ''
      })
      setSaved(true)
    } catch (err) {
      setError(err.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bone">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-olive border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <Head><title>Payment Settings — Let Investments</title></Head>
      <div className="min-h-screen bg-bone">
        <header className="sticky top-0 z-40 bg-ink px-6 py-4 text-paper border-b border-paper/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-paper text-ink font-heading text-lg">L</div>
              <div>
                <p className="font-heading leading-none">Let Investments</p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-label text-paper/50">Admin Settings</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-md border border-paper/15 bg-paper/10 px-3 py-1 text-xs text-paper/70 sm:block">
                {user?.email}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-md bg-paper/10 px-4 py-2 text-sm font-medium transition hover:bg-paper/20"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="eyebrow mb-3">Payment Controls</div>
              <h1 className="mt-1 text-3xl font-heading text-ink leading-tight">Deposit settings</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                These M-Pesa details are shown to clients when they open the deposit flow.
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="btn-outline text-sm"
            >
              Back to dashboard
            </Link>
          </div>

          {loading ? (
            <div className="rounded-lg border border-line bg-paper p-10 text-center text-ink-soft shadow-card">
              Loading settings...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-lg border border-line bg-paper p-6 shadow-card">
                <div className="border-b border-line pb-5">
                  <h2 className="text-xl font-heading text-ink">M-Pesa Deposit Details</h2>
                  <p className="mt-1 text-sm text-ink-soft">Clients will copy these details before submitting a deposit request.</p>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="mpesaPaybill">Paybill number</label>
                    <input
                      id="mpesaPaybill"
                      name="mpesaPaybill"
                      value={form.mpesaPaybill}
                      onChange={handleChange}
                      className="input-field font-mono"
                      placeholder="400200"
                      required
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="mpesaAccountNumber">Account number</label>
                    <input
                      id="mpesaAccountNumber"
                      name="mpesaAccountNumber"
                      value={form.mpesaAccountNumber}
                      onChange={handleChange}
                      className="input-field font-mono"
                      placeholder="LET-INVEST"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="mpesaAccountName">Account name</label>
                    <input
                      id="mpesaAccountName"
                      name="mpesaAccountName"
                      value={form.mpesaAccountName}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Let Investments"
                      required
                    />
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <section className="rounded-lg border border-line bg-paper p-6 shadow-card">
                  <h2 className="text-lg font-heading text-ink">Client Access</h2>
                  <label className="mt-5 flex items-start gap-3 rounded-md border border-line bg-bone p-4">
                    <input
                      type="checkbox"
                      name="systemDown"
                      checked={form.systemDown}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-olive"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-ink">Pause deposits and investing</span>
                      <span className="mt-1 block text-xs leading-relaxed text-ink-soft">
                        Clients will see a maintenance notice while this is enabled.
                      </span>
                    </span>
                  </label>
                  <div className="mt-5">
                    <label className="label" htmlFor="systemMessage">Maintenance message</label>
                    <textarea
                      id="systemMessage"
                      name="systemMessage"
                      value={form.systemMessage}
                      onChange={handleChange}
                      rows={4}
                      className="input-field resize-none"
                      placeholder="System is currently undergoing maintenance."
                    />
                  </div>
                </section>

                <section className="rounded-lg border border-olive/20 bg-olive/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-label text-olive-deep">Client preview</p>
                  <div className="mt-4 space-y-3 rounded-md border border-line bg-paper p-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-label text-ink-muted">Paybill</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-ink">{form.mpesaPaybill || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-label text-ink-muted">Account number</p>
                      <p className="mt-1 font-mono text-sm font-semibold text-ink">{form.mpesaAccountNumber || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-label text-ink-muted">Account name</p>
                      <p className="mt-1 text-sm font-semibold text-ink">{form.mpesaAccountName || 'Not set'}</p>
                    </div>
                  </div>
                </section>

                {error && (
                  <div className="rounded-md border border-clay/30 bg-clay/10 p-4 text-sm text-clay-deep">
                    {error}
                  </div>
                )}
                {saved && (
                  <div className="rounded-md border border-olive/30 bg-olive/10 p-4 text-sm font-semibold text-olive-deep">
                    Settings saved successfully.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save payment settings'}
                </button>
              </aside>
            </form>
          )}
        </main>
      </div>
    </>
  )
}
