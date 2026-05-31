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
      <div className="flex min-h-screen items-center justify-center bg-let-light">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-let-blue border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <Head><title>Payment Settings - Kingstone Investments</title></Head>
      <div className="min-h-screen bg-let-light">
        <header className="sticky top-0 z-40 bg-let-blue px-6 py-4 text-white shadow-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <Link href="/admin/dashboard" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 font-bold">K</div>
              <div>
                <p className="font-heading font-bold leading-none">Kingstone Investments</p>
                <p className="text-xs text-blue-200">Admin settings</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-blue-100 sm:block">
                {user?.email}
              </span>
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-let-green">Payment controls</p>
              <h1 className="mt-1 text-3xl font-heading font-bold text-let-blue">Deposit Settings</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
                These M-Pesa details are shown to clients when they open the deposit flow.
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-let-blue px-4 py-2 text-sm font-semibold text-let-blue transition hover:bg-let-blue hover:text-white"
            >
              Back to dashboard
            </Link>
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-gray-500 shadow-sm">
              Loading settings...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="border-b border-gray-100 pb-5">
                  <h2 className="text-xl font-heading font-bold text-let-blue">M-Pesa Deposit Details</h2>
                  <p className="mt-1 text-sm text-gray-500">Clients will copy these details before submitting a deposit request.</p>
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
                      placeholder="KINGSTONE"
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
                      placeholder="Kingstone Investments"
                      required
                    />
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-heading font-bold text-let-blue">Client Access</h2>
                  <label className="mt-5 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <input
                      type="checkbox"
                      name="systemDown"
                      checked={form.systemDown}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-let-blue"
                    />
                    <span>
                      <span className="block text-sm font-bold text-gray-800">Pause deposits and investing</span>
                      <span className="mt-1 block text-xs leading-relaxed text-gray-500">
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

                <section className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Client preview</p>
                  <div className="mt-4 space-y-3 rounded-xl border border-emerald-100 bg-white p-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Paybill</p>
                      <p className="mt-1 font-mono text-sm font-bold text-gray-900">{form.mpesaPaybill || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Account number</p>
                      <p className="mt-1 font-mono text-sm font-bold text-gray-900">{form.mpesaAccountNumber || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Account name</p>
                      <p className="mt-1 text-sm font-bold text-gray-900">{form.mpesaAccountName || 'Not set'}</p>
                    </div>
                  </div>
                </section>

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}
                {saved && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                    Settings saved successfully.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-let-blue px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-let-accent disabled:cursor-not-allowed disabled:opacity-60"
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
