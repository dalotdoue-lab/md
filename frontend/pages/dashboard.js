import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { apiGet, apiPost } from '../lib/api'

function fmt(n) { 
  return `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
}

function compactFmt(n) {
  return `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function pct(n) {
  return `${Math.max(0, Math.min(100, Math.round(Number(n || 0))))}%`
}

function FlowStep({ number, title, text, active }) {
  return (
    <div className="flex gap-3">
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-heading ${
        active ? 'border-olive bg-olive text-paper' : 'border-line bg-paper text-ink-muted'
      }`}>
        {number}
      </div>
      <div>
        <p className="text-sm font-heading text-ink">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-soft">{text}</p>
      </div>
    </div>
  )
}

function FinancialLineChart({ invested, balance, dailyProfit }) {
  const baseInvested = Number(invested || 0)
  const baseBalance = Number(balance || 0)
  const monthlyProfit = Number(dailyProfit || 0) * 30
  const points = [0.7, 0.78, 0.86, 0.92, 1.02, 1.08].map((m, index) => {
    const value = baseInvested * m + monthlyProfit * index + baseBalance * 0.08
    return Math.max(value, 1)
  })
  const max = Math.max(...points, 1)
  const coords = points.map((value, index) => {
    const x = 24 + index * 86
    const y = 176 - (value / max) * 132
    return `${x},${y}`
  })
  const area = `24,188 ${coords.join(' ')} ${24 + (points.length - 1) * 86},188`

  return (
    <div className="rounded-lg border border-line bg-paper shadow-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-label text-ink-muted">Portfolio value trend</p>
          <h3 className="text-lg font-heading text-ink">Capital growth projection</h3>
        </div>
        <span className="rounded-md bg-olive/10 px-3 py-1 text-xs font-semibold text-olive-deep">6 months</span>
      </div>
      <svg className="h-56 w-full" viewBox="0 0 480 210" role="img" aria-label="Projected portfolio value line chart">
        <path d="M24 44h430M24 88h430M24 132h430M24 176h430" stroke="#E6DECF" strokeDasharray="4 6" />
        <polygon points={area} fill="#5C6B4A" opacity="0.12" />
        <polyline points={coords.join(' ')} fill="none" stroke="#5C6B4A" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
        {coords.map((point) => {
          const [x, y] = point.split(',')
          return <circle key={point} cx={x} cy={y} r="5" fill="#5C6B4A" stroke="#FBF8F2" strokeWidth="3" />
        })}
        {['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map((label, index) => (
          <text key={label} x={24 + index * 86} y="205" textAnchor="middle" fill="#857F76" fontSize="12" fontWeight="600">{label}</text>
        ))}
      </svg>
    </div>
  )
}

function AllocationPanel({ projects }) {
  const visibleProjects = projects.slice(0, 4)
  const totalValue = visibleProjects.reduce((sum, project) => sum + Number(project.price || project.minInvestment || 0), 0) || 1

  return (
    <div className="rounded-lg border border-line bg-paper shadow-card p-4">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-label text-ink-muted">Capital allocation</p>
        <h3 className="text-lg font-heading text-ink">Available opportunities</h3>
      </div>
      <div className="space-y-4">
        {visibleProjects.length === 0 ? (
          <p className="rounded-md border border-dashed border-line bg-bone p-6 text-center text-sm font-semibold text-ink-muted">
            No project allocation data yet.
          </p>
        ) : visibleProjects.map((project, index) => {
          const value = Number(project.price || project.minInvestment || 0)
          const width = pct((value / totalValue) * 100)
          const colors = ['bg-ink', 'bg-olive', 'bg-clay', 'bg-ink-soft']
          return (
            <div key={project.id || project._id || project.title}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-semibold text-ink-soft">{project.title}</span>
                <span className="font-heading text-ink">{compactFmt(value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bone">
                <div className={`h-full rounded-full ${colors[index]}`} style={{ width }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, userProfile, loading: authLoading, signOut } = useAuth()
  const router = useRouter()

  // Redirection guard: redirect if not logged in; redirect to admin dashboard if admin
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    if (userProfile?.role === 'admin') {
      router.push('/admin/dashboard')
    }
  }, [user, userProfile, authLoading, router])

  // Data states
  const [stats, setStats] = useState({ balance: 0, dailyProfit: 0, totalInvested: 0 })
  const [settings, setSettings] = useState({ paybill: '', accountNumber: '', withdrawalInstructions: '' })
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Polling / Success Overlay State
  const [unacknowledged, setUnacknowledged] = useState(null)

  // Investment Modal State
  const [selectedProj, setSelectedProj] = useState(null)
  const [investAmount, setInvestAmount] = useState('')
  const [paymentRef, setPaymentRef] = useState('')
  const [submittingInvest, setSubmittingInvest] = useState(false)
  const [investMessage, setInvestMessage] = useState(null) // { type: 'success'|'error', text: '' }

  // Withdrawal Modal State
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showWithdrawWarning, setShowWithdrawWarning] = useState(false)
  const canWithdraw = Number(stats.balance || 0) > 0
  const totalPortfolioValue = Number(stats.balance || 0) + Number(stats.totalInvested || 0)
  const annualizedProfit = Number(stats.dailyProfit || 0) * 365
  const activeProjects = projects.filter(project => project.status !== 'completed').length
  const averageFunding = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + Number(project.progress || 0), 0) / projects.length)
    : 0

  // Load all client portal data
  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [statsRes, settingsRes, projRes] = await Promise.all([
        apiGet('/api/invest-portal/client/stats'),
        apiGet('/api/invest-portal/settings'),
        apiGet('/api/catalog/projects')
      ])
      if (statsRes.success) setStats(statsRes.data)
      if (settingsRes.success) setSettings(settingsRes.data)
      setProjects((projRes.data || []).map(d => ({ ...d, id: d._id })))
    } catch (err) {
      console.error('Error loading client dashboard data', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Check for any approved investment that the user hasn't acknowledged
  const checkUnacknowledged = useCallback(async () => {
    if (!user) return
    try {
      const res = await apiGet('/api/invest-portal/investments/unacknowledged')
      if (res.success && res.hasUnacknowledged && res.investment) {
        setUnacknowledged(res.investment)
      } else {
        setUnacknowledged(null)
      }
    } catch (err) {
      console.error('Error checking unacknowledged investments', err)
    }
  }, [user])

  // Run initial data fetch
  useEffect(() => {
    if (user) {
      loadData()
      checkUnacknowledged()
    }
  }, [user, loadData, checkUnacknowledged])

  useEffect(() => {
    if (canWithdraw) setShowWithdrawWarning(false)
  }, [canWithdraw])

  // Poll for unacknowledged approved investments
  useEffect(() => {
    if (!user) return
    const timer = setInterval(() => {
      // Only poll if the success overlay isn't already showing
      if (!unacknowledged) {
        checkUnacknowledged()
      }
    }, 7000)
    return () => clearInterval(timer)
  }, [user, unacknowledged, checkUnacknowledged])

  // Acknowledge approved investment & refresh dashboard stats
  const handleAcknowledge = async () => {
    if (!unacknowledged) return
    try {
      await apiPost(`/api/invest-portal/investments/${unacknowledged._id}/acknowledge`, {})
      setUnacknowledged(null)
      await loadData()
    } catch (err) {
      alert('Error acknowledging investment approval: ' + err.message)
    }
  }

  // Handle Investment Submission
  const handleInvestSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProj) return
    setInvestMessage(null)

    const amountNum = Number(investAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setInvestMessage({ type: 'error', text: 'Please enter a valid investment amount.' })
      return
    }

    if (amountNum < (selectedProj.minInvestment || 0)) {
      setInvestMessage({ 
        type: 'error', 
        text: `The minimum investment for this project is ${fmt(selectedProj.minInvestment)}.` 
      })
      return
    }

    if (!paymentRef.trim()) {
      setInvestMessage({ type: 'error', text: 'Please enter the M-Pesa transaction reference.' })
      return
    }

    setSubmittingInvest(true)
    try {
      const res = await apiPost('/api/invest-portal/investments', {
        projectId: selectedProj.id,
        amount: amountNum,
        paymentReference: paymentRef.trim()
      })
      if (res.success) {
        setInvestMessage({ 
          type: 'success', 
          text: 'Payment reference submitted successfully! Once verified, your portfolio will update.' 
        })
        setInvestAmount('')
        setPaymentRef('')
        // Refresh project data and stats
        await loadData()
        // Close modal after brief delay
        setTimeout(() => {
          setSelectedProj(null)
          setInvestMessage(null)
        }, 3000)
      } else {
        setInvestMessage({ type: 'error', text: res.error || 'Failed to submit investment.' })
      }
    } catch (err) {
      setInvestMessage({ type: 'error', text: err.message || 'An error occurred during submission.' })
    } finally {
      setSubmittingInvest(false)
    }
  }

  // If loading authentication state, show a clean spinner
  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bone">
        <div className="w-10 h-10 border-2 border-olive border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Investor Dashboard — Let Investments</title>
      </Head>

      {/* ── 1. SUCCESS OVERLAY SCREEN ── */}
      {unacknowledged && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-paper border border-line rounded-lg p-8 max-w-lg w-full text-center shadow-lift relative overflow-hidden flex flex-col items-center">

            {/* Animated Check Icon */}
            <div className="w-16 h-16 bg-olive/10 border border-olive/30 rounded-full flex items-center justify-center text-olive-deep mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl font-heading text-ink leading-tight mb-2">
              Investment activated
            </h2>
            <p className="text-olive-deep font-semibold text-xs tracking-label uppercase">
              Payment confirmed
            </p>

            <div className="w-full bg-bone border border-line rounded-md p-5 my-6 space-y-3 text-left">
              <div className="flex justify-between items-center text-sm border-b border-line pb-2.5">
                <span className="text-ink-muted">Project name</span>
                <span className="font-semibold text-ink text-right max-w-[200px] truncate">{unacknowledged.projectId?.title || 'Active Project'}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-line pb-2.5">
                <span className="text-ink-muted">Invested amount</span>
                <span className="font-heading text-olive-deep text-lg">{fmt(unacknowledged.amount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-line pb-2.5">
                <span className="text-ink-muted">M-Pesa reference</span>
                <span className="font-mono text-ink font-semibold bg-ink/5 px-2 py-0.5 rounded">{unacknowledged.paymentReference}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">Payout activation</span>
                <span className="font-semibold text-olive-deep">Immediate ROI</span>
              </div>
            </div>

            <p className="text-sm text-ink-soft leading-relaxed mb-6">
              Your funds are now active inside the project. Your account balance, active capital, and daily payout margins have been updated automatically.
            </p>

            <button
              onClick={handleAcknowledge}
              className="btn-primary w-full"
            >
              Go back to dashboard
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN DASHBOARD CONTAINER ── */}
      <div className="min-h-screen bg-bone text-ink-soft">

        {/* Navigation Bar */}
        <nav className="sticky top-0 z-40 border-b border-paper/10 bg-ink px-4 py-3 text-paper">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-paper text-lg font-heading text-ink">L</div>
            <div>
              <p className="font-heading leading-none">Let Investments</p>
              <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-label text-paper/50">Investor Portal</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 text-xs font-medium">
            <a href="#overview" className="rounded-md bg-paper/10 px-3 py-2 text-paper hover:bg-paper/15">Overview</a>
            <a href="#analytics" className="rounded-md px-3 py-2 text-paper/70 hover:bg-paper/10 hover:text-paper">Analytics</a>
            <a href="#opportunities" className="rounded-md px-3 py-2 text-paper/70 hover:bg-paper/10 hover:text-paper">Opportunities</a>
            <a href="#support" className="rounded-md px-3 py-2 text-paper/70 hover:bg-paper/10 hover:text-paper">Support</a>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-paper/70 md:block">{user?.email}</span>
            <button onClick={signOut} className="rounded-md bg-paper/10 px-4 py-2 text-sm font-medium transition hover:bg-paper/20">
              Sign out
            </button>
          </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div id="overview" className="bg-ink pb-16 pt-10 text-paper">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div>
              <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-label text-paper/60">
                <span className="inline-block w-7 h-px bg-clay"></span>
                Investor Command Center
              </div>
              <h1 className="mt-3 text-3xl font-heading leading-tight md:text-5xl">
                {user?.displayName || userProfile?.name || 'Investor'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-paper/70">
                Track portfolio value, active capital, daily return activity, and available opportunities from one dashboard.
              </p>
              <div className="mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-paper/10 bg-paper/5 p-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-label text-paper/50">Portfolio Value</p>
                  <p className="mt-2 text-2xl font-heading">{fmt(totalPortfolioValue)}</p>
                </div>
                <div className="rounded-md border border-paper/10 bg-paper/5 p-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-label text-paper/50">Annualized Profit</p>
                  <p className="mt-2 text-2xl font-heading text-clay">{fmt(annualizedProfit)}</p>
                </div>
                <div className="rounded-md border border-paper/10 bg-paper/5 p-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-label text-paper/50">Funding Avg.</p>
                  <p className="mt-2 text-2xl font-heading">{averageFunding}%</p>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-paper/10 bg-paper/5 p-5">
              <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-paper/10 text-xl font-heading text-paper">
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs leading-none text-paper/50">Investor status</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-label text-clay">Active Investor</p>
                <p className="mt-1 text-xs text-paper/60">{user?.email}</p>
              </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <a href="#opportunities" className="rounded-md bg-paper px-4 py-3 text-center font-medium text-ink hover:bg-bone transition-colors">Invest now</a>
                <button
                  onClick={() => {
                    if (canWithdraw) {
                      setShowWithdrawWarning(false)
                      setShowWithdraw(true)
                    } else {
                      setShowWithdrawWarning(true)
                    }
                  }}
                  className="rounded-md border border-paper/20 px-4 py-3 font-medium text-paper hover:bg-paper/10 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="mx-auto max-w-7xl px-4 -mt-8 pb-12 space-y-8">
          
          {/* STATS DECK */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            
            {/* Balance Card */}
            <div className="bg-paper rounded-lg shadow-card border border-line p-6 flex flex-col justify-between transition hover:shadow-lift">
              <div>
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-label">Available Balance</p>
                <p className="text-3xl font-heading text-ink mt-2">{fmt(stats.balance)}</p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    if (canWithdraw) {
                      setShowWithdrawWarning(false)
                      setShowWithdraw(true)
                    } else {
                      setShowWithdrawWarning(true)
                    }
                  }}
                  className={`flex-1 font-semibold py-2.5 px-4 rounded-md text-center text-xs tracking-wide uppercase transition-colors ${
                    canWithdraw
                      ? 'bg-ink hover:bg-olive-deep text-paper'
                      : 'bg-bone text-ink-muted hover:bg-line'
                  }`}
                >
                  Withdraw Funds
                </button>
              </div>
              {showWithdrawWarning && !canWithdraw && (
                <p className="mt-3 rounded-md border border-clay/20 bg-clay/10 px-3 py-2 text-xs font-semibold text-clay-deep">
                  You can't withdraw anything because your available balance is $0.00.
                </p>
              )}
            </div>

            {/* Daily Profit Card */}
            <div className="bg-paper rounded-lg shadow-card border border-line p-6 flex flex-col justify-between transition hover:shadow-lift border-l-2 border-l-olive">
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-ink-muted uppercase tracking-label">Daily Profit ROI</p>
                  <span className="text-olive-deep bg-olive/10 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 uppercase tracking-wide">
                    ▲ Live Rate
                  </span>
                </div>
                <p className="text-3xl font-heading text-olive-deep mt-2">{fmt(stats.dailyProfit)}</p>
              </div>
              <div className="mt-6">
                <p className="text-xs text-ink-soft leading-relaxed">
                  Automatically accumulated payout paid into your profile balances based on active project stakes.
                </p>
              </div>
            </div>

            {/* Total Invested Card */}
            <div className="bg-paper rounded-lg shadow-card border border-line p-6 flex flex-col justify-between transition hover:shadow-lift border-l-2 border-l-ink">
              <div>
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-label">Total Active Capital</p>
                <p className="text-3xl font-heading text-ink mt-2">{fmt(stats.totalInvested)}</p>
              </div>
              <div className="mt-6">
                <p className="text-xs text-ink-soft leading-relaxed">
                  Total capital currently locked in projects generating live daily ROI.
                </p>
              </div>
            </div>

            <div className="bg-paper rounded-lg shadow-card border border-line p-6 flex flex-col justify-between transition hover:shadow-lift border-l-2 border-l-clay">
              <div>
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-label">Active Opportunities</p>
                <p className="text-3xl font-heading text-ink mt-2">{activeProjects}</p>
              </div>
              <div className="mt-6">
                <p className="text-xs text-ink-soft leading-relaxed">
                  Available investment projects in the current client portal flow.
                </p>
              </div>
            </div>

          </div>

          <section id="analytics" className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_0.8fr]">
            <FinancialLineChart invested={stats.totalInvested} balance={stats.balance} dailyProfit={stats.dailyProfit} />
            <AllocationPanel projects={projects} />
          </section>

          <section className="grid grid-cols-1 gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-lg border border-line bg-paper p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-label text-olive-deep">Structured dashboard flow</p>
              <h2 className="mt-2 text-2xl font-heading text-ink">Investment lifecycle</h2>
              <div className="mt-6 space-y-5">
                <FlowStep number="1" title="Review" text="Compare project yield, minimum capital, funding progress, and location." active />
                <FlowStep number="2" title="Commit" text="Submit capital amount and payment reference through the secure investment modal." active={Number(stats.totalInvested || 0) > 0} />
                <FlowStep number="3" title="Admin approval" text="Operations verifies the payment and activates the investment." active={Number(stats.dailyProfit || 0) > 0} />
                <FlowStep number="4" title="Track returns" text="Monitor daily profit, active capital, and withdrawal instructions in this portal." active={canWithdraw} />
              </div>
            </div>
            <div className="rounded-lg border border-line bg-paper p-6 shadow-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-label text-ink-muted">Client and admin interaction</p>
                  <h2 className="mt-2 text-2xl font-heading text-ink">What happens next</h2>
                </div>
                <span className="w-fit rounded-md bg-ink/5 px-3 py-1 text-xs font-semibold uppercase tracking-label text-ink">Live portal</span>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-md bg-bone p-4">
                  <p className="text-sm font-heading text-ink">Capital call</p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">Investors submit references and admins validate activity from the queue.</p>
                </div>
                <div className="rounded-md bg-bone p-4">
                  <p className="text-sm font-heading text-ink">Portfolio update</p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">Approved activity updates balance, invested capital, and daily ROI metrics.</p>
                </div>
                <div className="rounded-md bg-bone p-4">
                  <p className="text-sm font-heading text-ink">Support path</p>
                  <p className="mt-2 text-xs leading-relaxed text-ink-soft">Withdrawal guidance and support channels stay visible inside the flow.</p>
                </div>
              </div>
            </div>
          </section>

          {/* PROJECTS CATALOG SECTION */}
          <section id="opportunities" className="space-y-6">
            <div>
              <h2 className="text-2xl font-heading text-ink">Available projects</h2>
              <p className="text-sm text-ink-soft">Choose a project below to view ROI payouts and register an investment.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-2 border-olive border-t-transparent rounded-full animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-paper rounded-lg border border-dashed border-line">
                <p className="text-ink-muted font-semibold">No active projects available for investment right now.</p>
                <p className="text-xs text-ink-muted mt-1">Please check back later or contact support.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(p => (
                  <div key={p.id} className="bg-paper rounded-lg shadow-card border border-line overflow-hidden hover:-translate-y-0.5 hover:shadow-lift transition-all duration-300 flex flex-col">

                    {/* Project Header Image */}
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-44 object-cover border-b border-line" />
                    ) : (
                      <div className="w-full h-44 bg-bone border-b border-line flex items-center justify-center text-ink/20">
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-ink-muted text-[10px] font-semibold uppercase tracking-label">
                            {p.category || 'Investment'}
                          </span>
                          <span className="text-olive-deep font-semibold text-xs uppercase">
                            {fmt(p.dailyEarnings)}/day Payout
                          </span>
                        </div>
                        <h3 className="font-heading text-lg text-ink mt-2 line-clamp-1">{p.title}</h3>
                        {p.location && (
                          <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {p.location}
                          </p>
                        )}
                        <p className="text-xs text-ink-soft mt-2 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-line">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-ink-muted">Min Investment</span>
                          <span className="font-semibold text-ink">{fmt(p.minInvestment)}</span>
                        </div>

                        {p.status !== 'completed' && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-ink-muted">
                              <span>Funding Status</span>
                              <span>{p.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-bone rounded-full h-1.5 overflow-hidden">
                              <div className="bg-olive h-1.5 rounded-full transition-all duration-300" style={{ width: `${p.progress || 0}%` }} />
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => setSelectedProj(p)}
                          className="w-full bg-ink hover:bg-olive-deep text-paper font-semibold py-2.5 rounded-md text-center text-xs tracking-wide uppercase transition-colors mt-2"
                        >
                          Invest Now
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Info Grid */}
          <div id="support" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Info */}
            <div className="bg-paper rounded-lg shadow-card border border-line p-6 space-y-4">
              <h3 className="font-heading text-lg text-ink">Account credentials</h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between border-b border-line pb-2">
                  <span className="text-ink-muted">Account Type</span>
                  <span className="font-semibold text-ink capitalize">{userProfile?.role || 'Investor'}</span>
                </div>
                <div className="flex justify-between border-b border-line pb-2">
                  <span className="text-ink-muted">Email Address</span>
                  <span className="font-medium text-ink-soft">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Member Since</span>
                  <span className="font-medium text-ink-soft">
                    {user?.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contacts */}
            <div className="bg-paper rounded-lg shadow-card border border-line p-6 space-y-4">
              <h3 className="font-heading text-lg text-ink">Investor support</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                If you have questions about payment validation, project returns, or account modifications, please reach out to our desk.
              </p>
              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <a href="mailto:support@letinvestments.com" className="p-3 bg-bone border border-line text-ink rounded-md font-semibold hover:bg-line/50 transition-colors">
                  Email Support
                </a>
                <Link href="/contact" className="p-3 bg-ink text-paper rounded-md font-semibold hover:bg-olive-deep transition-colors">
                  Support Chat
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. INVEST NOW MODAL (MPESA SIMULATION) ── */}
      {selectedProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-paper rounded-lg shadow-lift border border-line max-w-lg w-full p-6 space-y-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-heading text-ink leading-tight">Confirm & invest</h3>
                <p className="text-xs text-ink-soft mt-1">Submit M-Pesa transaction reference for approval</p>
              </div>
              <button
                onClick={() => { setSelectedProj(null); setInvestMessage(null); setInvestAmount(''); setPaymentRef('') }}
                className="text-ink-muted hover:text-ink transition p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Project Quick ROI Summary */}
            <div className="bg-bone border border-line rounded-md p-4 space-y-2">
              <p className="text-xs font-semibold text-ink-muted uppercase tracking-label">Project</p>
              <p className="font-heading text-ink text-base">{selectedProj.title}</p>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-ink-soft">Daily Return ROI</span>
                <span className="font-semibold text-olive-deep">{fmt(selectedProj.dailyEarnings)}/day</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-ink-soft">Min Capital Required</span>
                <span className="font-semibold text-ink">{fmt(selectedProj.minInvestment)}</span>
              </div>
            </div>

            {/* M-Pesa Payment Card Instruction */}
            <div className="bg-ink text-paper rounded-md p-5 space-y-4 relative overflow-hidden">
              <div className="absolute right-2 -bottom-2 opacity-[0.07] pointer-events-none">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                </svg>
              </div>
              <p className="text-clay font-semibold text-xs uppercase tracking-label leading-none">M-Pesa Payment Instructions</p>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="block text-[10px] text-paper/50 uppercase font-semibold tracking-label">Lipa Na M-Pesa Paybill</span>
                  <span className="font-mono font-bold text-lg tracking-wider text-paper">{settings.paybill || '174379'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-paper/50 uppercase font-semibold tracking-label">Account Number</span>
                  <span className="font-mono font-bold text-sm tracking-wider text-clay">{settings.accountNumber || 'LET-INVEST'}</span>
                </div>
              </div>
              <p className="text-[10px] text-paper/60 leading-normal italic">
                * Please complete the transaction on your M-Pesa line. Send the exact amount, then enter the amount and transaction ID code below.
              </p>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleInvestSubmit} className="space-y-4">

              {investMessage && (
                <div className={`p-3.5 rounded-md text-xs font-semibold border ${
                  investMessage.type === 'success'
                    ? 'bg-olive/10 border-olive/30 text-olive-deep'
                    : 'bg-clay/10 border-clay/30 text-clay-deep'
                }`}>
                  {investMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase tracking-label mb-1">Investment Amount ($)</label>
                  <input
                    type="number"
                    value={investAmount}
                    onChange={e => setInvestAmount(e.target.value)}
                    placeholder={`Min. ${selectedProj.minInvestment || 0}`}
                    className="input-field text-sm font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-muted uppercase tracking-label mb-1">M-Pesa Reference Code</label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    placeholder="e.g. QX82F1S8D0"
                    className="input-field text-sm font-mono font-semibold uppercase tracking-wider"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingInvest}
                  className="btn-primary flex-1 disabled:opacity-60 text-xs tracking-wide uppercase"
                >
                  {submittingInvest ? (
                    <>
                      <div className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : 'Confirm Payment Reference'}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedProj(null); setInvestMessage(null); setInvestAmount(''); setPaymentRef('') }}
                  className="btn-outline text-xs uppercase tracking-wide"
                >
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ── 3. WITHDRAWAL INSTRUCTIONS MODAL ── */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
          <div className="bg-paper rounded-lg shadow-lift border border-line max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-heading text-ink leading-tight">Withdrawal instructions</h3>
                <p className="text-xs text-ink-soft mt-1">Review guidelines to request withdrawal payout</p>
              </div>
              <button
                onClick={() => setShowWithdraw(false)}
                className="text-ink-muted hover:text-ink transition p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Instruction content from admin settings */}
            <div className="bg-bone border border-line rounded-md p-5 text-sm text-ink-soft leading-relaxed whitespace-pre-line">
              {settings.withdrawalInstructions || 'Please contact the support team or email support@letinvestments.com to initiate your withdrawal.'}
            </div>

            {/* Modal actions */}
            <button
              onClick={() => setShowWithdraw(false)}
              className="btn-primary w-full text-xs tracking-wide uppercase"
            >
              Understand & close
            </button>

          </div>
        </div>
      )}
    </>
  )
}
