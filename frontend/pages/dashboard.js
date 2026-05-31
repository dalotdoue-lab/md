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
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${
        active ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-500'
      }`}>
        {number}
      </div>
      <div>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{text}</p>
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
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">Portfolio value trend</p>
          <h3 className="text-lg font-black text-slate-900">Capital growth projection</h3>
        </div>
        <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">6 months</span>
      </div>
      <svg className="h-56 w-full" viewBox="0 0 480 210" role="img" aria-label="Projected portfolio value line chart">
        <path d="M24 44h430M24 88h430M24 132h430M24 176h430" stroke="#e2e8f0" strokeDasharray="4 6" />
        <polygon points={area} fill="#0f766e" opacity="0.12" />
        <polyline points={coords.join(' ')} fill="none" stroke="#0f766e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" />
        {coords.map((point) => {
          const [x, y] = point.split(',')
          return <circle key={point} cx={x} cy={y} r="5" fill="#0f766e" stroke="#fff" strokeWidth="3" />
        })}
        {['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map((label, index) => (
          <text key={label} x={24 + index * 86} y="205" textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="700">{label}</text>
        ))}
      </svg>
    </div>
  )
}

function AllocationPanel({ projects }) {
  const visibleProjects = projects.slice(0, 4)
  const totalValue = visibleProjects.reduce((sum, project) => sum + Number(project.price || project.minInvestment || 0), 0) || 1

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400">Capital allocation</p>
        <h3 className="text-lg font-black text-slate-900">Available opportunities</h3>
      </div>
      <div className="space-y-4">
        {visibleProjects.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-400">
            No project allocation data yet.
          </p>
        ) : visibleProjects.map((project, index) => {
          const value = Number(project.price || project.minInvestment || 0)
          const width = pct((value / totalValue) * 100)
          const colors = ['bg-let-blue', 'bg-emerald-500', 'bg-amber-500', 'bg-slate-500']
          return (
            <div key={project.id || project._id || project.title}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-bold text-slate-700">{project.title}</span>
                <span className="font-black text-slate-900">{compactFmt(value)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
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
      <div className="flex items-center justify-center min-h-screen bg-let-light">
        <div className="w-12 h-12 border-4 border-let-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Investor Dashboard — Let Investments</title>
      </Head>

      {/* ── 1. SUCCESS OVERLAY SCREEN (GLASSMORPHISM AESTHETICS) ── */}
      {unacknowledged && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D3B66]/80 backdrop-blur-lg p-6 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-8 max-w-lg w-full text-center text-white shadow-2xl relative overflow-hidden flex flex-col items-center">
            
            {/* Visual background lights */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-emerald-500/25 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-500/25 rounded-full blur-2xl pointer-events-none" />
            
            {/* Animated Check Icon */}
            <div className="w-20 h-20 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl font-heading font-black tracking-tight mb-2">
              Investment Activated!
            </h2>
            <p className="text-emerald-300 font-semibold text-lg tracking-wide uppercase">
              Payment Confirmed
            </p>

            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 my-6 space-y-3 text-left">
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2.5">
                <span className="text-white/60">Project Name</span>
                <span className="font-semibold text-right max-w-[200px] truncate">{unacknowledged.projectId?.title || 'Active Project'}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2.5">
                <span className="text-white/60">Invested Amount</span>
                <span className="font-bold text-emerald-400 text-lg">{fmt(unacknowledged.amount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-white/10 pb-2.5">
                <span className="text-white/60">M-Pesa Reference</span>
                <span className="font-mono text-blue-300 font-semibold bg-white/10 px-2 py-0.5 rounded">{unacknowledged.paymentReference}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60">Payout Activation</span>
                <span className="font-semibold text-emerald-400">Immediate ROI</span>
              </div>
            </div>

            <p className="text-sm text-white/70 leading-relaxed mb-6">
              Your funds are successfully active inside the project. Your account balance, active capital, and daily payout margins have been updated automatically.
            </p>

            <button
              onClick={handleAcknowledge}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all duration-200"
            >
              Go Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN DASHBOARD CONTAINER ── */}
      <div className="min-h-screen bg-let-light text-gray-850">
        
        {/* Navigation Bar */}
        <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#102033] px-4 py-3 text-white shadow-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-300 text-lg font-black text-[#102033]">L</div>
            <div>
              <p className="font-semibold leading-none">Let Investments</p>
              <p className="mt-0.5 text-xs font-medium tracking-wide text-blue-200">Investor Portal</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <a href="#overview" className="rounded-lg bg-white/10 px-3 py-2 text-blue-50 hover:bg-white/15">Overview</a>
            <a href="#analytics" className="rounded-lg px-3 py-2 text-blue-100 hover:bg-white/10">Analytics</a>
            <a href="#opportunities" className="rounded-lg px-3 py-2 text-blue-100 hover:bg-white/10">Opportunities</a>
            <a href="#support" className="rounded-lg px-3 py-2 text-blue-100 hover:bg-white/10">Support</a>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-blue-100 md:block">{user?.email}</span>
            <button onClick={signOut} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition hover:bg-white/20">
              Sign Out
            </button>
          </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div id="overview" className="bg-[#102033] pb-16 pt-8 text-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Investor command center</p>
              <h1 className="mt-2 text-3xl font-black leading-tight md:text-5xl">
                {user?.displayName || userProfile?.name || 'Investor'}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-blue-100">
                Track portfolio value, active capital, daily return activity, and available opportunities from one structured dashboard.
              </p>
              <div className="mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Portfolio Value</p>
                  <p className="mt-2 text-2xl font-black">{fmt(totalPortfolioValue)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Annualized Profit</p>
                  <p className="mt-2 text-2xl font-black text-emerald-300">{fmt(annualizedProfit)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-200">Funding Avg.</p>
                  <p className="mt-2 text-2xl font-black">{averageFunding}%</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 p-5">
              <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 text-xl font-bold text-white">
                {(user?.displayName || user?.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs leading-none text-blue-200">Investor status</p>
                <p className="mt-1 text-sm font-bold uppercase tracking-wider text-emerald-300">Active Investor</p>
                <p className="mt-1 text-xs text-blue-200">{user?.email}</p>
              </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <a href="#opportunities" className="rounded-lg bg-emerald-400 px-4 py-3 text-center font-black text-[#102033]">Invest Now</a>
                <button
                  onClick={() => {
                    if (canWithdraw) {
                      setShowWithdrawWarning(false)
                      setShowWithdraw(true)
                    } else {
                      setShowWithdrawWarning(true)
                    }
                  }}
                  className="rounded-lg border border-white/15 px-4 py-3 font-black text-white hover:bg-white/10"
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Balance</p>
                <p className="text-3xl font-black text-let-blue mt-2">{fmt(stats.balance)}</p>
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
                  className={`flex-1 font-bold py-2.5 px-4 rounded-xl text-center text-xs tracking-wider uppercase transition ${
                    canWithdraw
                      ? 'bg-let-blue hover:bg-let-blue/90 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  Withdraw Funds
                </button>
              </div>
              {showWithdrawWarning && !canWithdraw && (
                <p className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  You can't withdraw anything because your available balance is $0.00.
                </p>
              )}
            </div>

            {/* Daily Profit Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 flex flex-col justify-between hover:shadow-md transition border-l-4 border-l-emerald-500">
              <div>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Profit ROI</p>
                  <span className="text-emerald-500 bg-emerald-50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    ▲ Live Rate
                  </span>
                </div>
                <p className="text-3xl font-black text-emerald-600 mt-2">{fmt(stats.dailyProfit)}</p>
              </div>
              <div className="mt-6">
                <p className="text-xs text-gray-500 leading-tight">
                  Automatically accumulated payout paid into your profile balances based on active project stakes.
                </p>
              </div>
            </div>

            {/* Total Invested Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 flex flex-col justify-between hover:shadow-md transition border-l-4 border-l-blue-500">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Active Capital</p>
                <p className="text-3xl font-black text-gray-800 mt-2">{fmt(stats.totalInvested)}</p>
              </div>
              <div className="mt-6">
                <p className="text-xs text-gray-500 leading-tight">
                  Total capital currently locked in projects generating live daily ROI.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 flex flex-col justify-between hover:shadow-md transition border-l-4 border-l-amber-500">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Opportunities</p>
                <p className="text-3xl font-black text-gray-800 mt-2">{activeProjects}</p>
              </div>
              <div className="mt-6">
                <p className="text-xs text-gray-500 leading-tight">
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
            <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Structured dashboard flow</p>
              <h2 className="mt-2 text-2xl font-black text-let-blue">Investment lifecycle</h2>
              <div className="mt-6 space-y-5">
                <FlowStep number="1" title="Review" text="Compare project yield, minimum capital, funding progress, and location." active />
                <FlowStep number="2" title="Commit" text="Submit capital amount and payment reference through the secure investment modal." active={Number(stats.totalInvested || 0) > 0} />
                <FlowStep number="3" title="Admin approval" text="Operations verifies the payment and activates the investment." active={Number(stats.dailyProfit || 0) > 0} />
                <FlowStep number="4" title="Track returns" text="Monitor daily profit, active capital, and withdrawal instructions in this portal." active={canWithdraw} />
              </div>
            </div>
            <div className="rounded-2xl border border-gray-150 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">Client and admin interaction</p>
                  <h2 className="mt-2 text-2xl font-black text-let-blue">What happens next</h2>
                </div>
                <span className="w-fit rounded-lg bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-let-blue">Live portal</span>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-900">Capital call</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">Investors submit references and admins validate activity from the queue.</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-900">Portfolio update</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">Approved activity updates balance, invested capital, and daily ROI metrics.</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-900">Support path</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">Withdrawal guidance and support channels stay visible inside the flow.</p>
                </div>
              </div>
            </div>
          </section>

          {/* PROJECTS CATALOG SECTION */}
          <section id="opportunities" className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-let-blue tracking-tight">Available Projects</h2>
              <p className="text-sm text-gray-500">Choose a project below to view ROI payouts and register an investment.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-let-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-400 font-semibold">No active projects available for investment right now.</p>
                <p className="text-xs text-gray-400 mt-1">Please check back later or contact support.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-150 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col">
                    
                    {/* Project Header Image */}
                    {p.image ? (
                      <img src={p.image} alt={p.title} className="w-full h-44 object-cover border-b border-gray-100" />
                    ) : (
                      <div className="w-full h-44 bg-let-blue/15 border-b border-gray-100 flex items-center justify-center text-let-blue/30">
                        <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="bg-blue-50 text-let-blue text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {p.category || 'Investment'}
                          </span>
                          <span className="text-emerald-500 font-bold text-xs uppercase">
                            {fmt(p.dailyEarnings)}/day Payout
                          </span>
                        </div>
                        <h3 className="font-heading font-bold text-lg text-gray-900 mt-2 line-clamp-1">{p.title}</h3>
                        {p.location && (
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {p.location}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">{p.description}</p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-400">Min Investment</span>
                          <span className="font-semibold text-gray-700">{fmt(p.minInvestment)}</span>
                        </div>

                        {p.status !== 'completed' && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-gray-400">
                              <span>Funding Status</span>
                              <span>{p.progress || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-let-blue h-1.5 rounded-full transition-all duration-300" style={{ width: `${p.progress || 0}%` }} />
                            </div>
                          </div>
                        )}

                        <button 
                          onClick={() => setSelectedProj(p)}
                          className="w-full bg-let-blue hover:bg-let-blue/90 text-white font-bold py-2.5 rounded-xl text-center text-xs tracking-wider uppercase transition mt-2"
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-4">
              <h3 className="font-heading font-bold text-lg text-let-blue">Account Credentials</h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Account Type</span>
                  <span className="font-bold text-let-blue capitalize">{userProfile?.role || 'Investor'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-400">Email Address</span>
                  <span className="font-medium text-gray-700">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="font-medium text-gray-700">
                    {user?.metadata?.creationTime
                      ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contacts */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 space-y-4">
              <h3 className="font-heading font-bold text-lg text-let-blue">Investor Support</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                If you have questions about payment validation, project returns, or account modifications, please reach out to our desk.
              </p>
              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <a href="mailto:support@letinvestments.com" className="p-3 bg-blue-50 text-let-blue rounded-xl font-bold hover:shadow-sm transition">
                  Email Support
                </a>
                <Link href="/contact" className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-bold hover:shadow-sm transition">
                  Support Chat
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. INVEST NOW MODAL (MPESA SIMULATION) ── */}
      {selectedProj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D3B66]/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-lg w-full p-6 space-y-5 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-let-blue leading-tight">Confirm & Invest</h3>
                <p className="text-xs text-gray-500 mt-1">Submit M-Pesa transaction reference for approval</p>
              </div>
              <button 
                onClick={() => { setSelectedProj(null); setInvestMessage(null); setInvestAmount(''); setPaymentRef('') }} 
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Project Quick ROI Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Project</p>
              <p className="font-bold text-gray-800 text-base">{selectedProj.title}</p>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-gray-500">Daily Return ROI:</span>
                <span className="font-bold text-emerald-600">{fmt(selectedProj.dailyEarnings)}/day</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Min Capital Required:</span>
                <span className="font-semibold text-gray-700">{fmt(selectedProj.minInvestment)}</span>
              </div>
            </div>

            {/* M-Pesa Payment Card Instruction */}
            <div className="bg-[#1C2C5B] text-white rounded-2xl p-5 space-y-4 relative overflow-hidden">
              <div className="absolute right-2 -bottom-2 opacity-5 pointer-events-none">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                </svg>
              </div>
              <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest leading-none">M-Pesa Payment Instructions</p>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="block text-[10px] text-white/50 uppercase font-semibold">Lipa Na M-Pesa Paybill</span>
                  <span className="font-mono font-black text-lg tracking-wider text-white">{settings.paybill || '174379'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-white/50 uppercase font-semibold">Account Number</span>
                  <span className="font-mono font-black text-sm tracking-wider text-emerald-300">{settings.accountNumber || 'LET-INVEST'}</span>
                </div>
              </div>
              <p className="text-[10px] text-white/60 leading-normal italic">
                * Please complete the transaction on your M-Pesa line. Send the exact amount, then enter the amount and transaction ID code below.
              </p>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleInvestSubmit} className="space-y-4">
              
              {investMessage && (
                <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
                  investMessage.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {investMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Investment Amount ($)</label>
                  <input 
                    type="number" 
                    value={investAmount} 
                    onChange={e => setInvestAmount(e.target.value)} 
                    placeholder={`Min. ${selectedProj.minInvestment || 0}`}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-let-blue font-bold text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">M-Pesa Reference Code</label>
                  <input 
                    type="text" 
                    value={paymentRef} 
                    onChange={e => setPaymentRef(e.target.value)} 
                    placeholder="e.g. QX82F1S8D0"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-let-blue font-mono font-bold uppercase tracking-wider text-let-blue"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="submit" 
                  disabled={submittingInvest} 
                  className="bg-let-blue hover:bg-let-blue/90 disabled:opacity-60 text-white font-bold py-3 px-6 rounded-xl flex-1 text-xs tracking-wider uppercase transition flex items-center justify-center gap-2"
                >
                  {submittingInvest ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : 'Confirm Payment Reference'}
                </button>
                <button 
                  type="button" 
                  onClick={() => { setSelectedProj(null); setInvestMessage(null); setInvestAmount(''); setPaymentRef('') }} 
                  className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D3B66]/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-let-blue leading-none">Withdrawal Instructions</h3>
                <p className="text-xs text-gray-500 mt-1">Review guidelines to request withdrawal payout</p>
              </div>
              <button 
                onClick={() => setShowWithdraw(false)} 
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Instruction content from admin settings */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-line">
              {settings.withdrawalInstructions || 'Please contact the support team or email support@letinvestments.com to initiate your withdrawal.'}
            </div>

            {/* Modal actions */}
            <button 
              onClick={() => setShowWithdraw(false)} 
              className="w-full bg-let-blue hover:bg-let-blue/90 text-white font-bold py-3 px-6 rounded-xl text-center text-xs tracking-wider uppercase transition"
            >
              Understand & Close
            </button>

          </div>
        </div>
      )}
    </>
  )
}
