import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function InvestSuccess() {
  const router = useRouter()
  const { project, amount } = router.query

  const initialAmount = parseFloat(amount) || 1000 // Default fallback if no param
  const projectTitle = project || 'Kingstone Growth Fund'

  const [liveValue, setLiveValue] = useState(initialAmount)

  useEffect(() => {
    if (!initialAmount) return

    // Annual rate of 5%
    const annualRate = 0.05
    // Number of 50ms intervals in a year (365 days)
    const secondsInYear = 365 * 24 * 60 * 60
    const intervalsPerSecond = 20 // 50ms intervals
    const totalIntervalsInYear = secondsInYear * intervalsPerSecond

    // Growth factor per 50ms interval (compounded)
    const growthFactor = Math.pow(1 + annualRate, 1 / totalIntervalsInYear)

    let currentVal = initialAmount

    const interval = setInterval(() => {
      currentVal = currentVal * growthFactor
      setLiveValue(currentVal)
    }, 50)

    return () => clearInterval(interval)
  }, [initialAmount])

  // Splitting liveValue into dollars/cents and micro-cents for a cool rolling effect
  const formattedVal = liveValue.toFixed(8)
  const mainPart = formattedVal.slice(0, -6) // e.g., "$1,000.00"
  const microPart = formattedVal.slice(-6)   // e.g., "012345"

  return (
    <>
      <Head>
        <title>Investment Successful — Kingstone Investments</title>
        <meta name="description" content="Your asset investment has been successfully processed." />
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Animated Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="w-full max-w-xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500 to-teal-400"></div>

          {/* Success Icon */}
          <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping opacity-60"></div>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl font-bold shadow-lg shadow-emerald-500/10">
              ✓
            </div>
          </div>

          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            Investment Confirmed!
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
            Your capital is now active and generating yields. A detailed receipt and contract have been sent to your email.
          </p>

          {/* Investment Details */}
          <div className="mt-8 bg-slate-950/50 rounded-2xl p-5 border border-slate-800/60 text-left space-y-3.5 max-w-md mx-auto">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Asset Class / Project:</span>
              <span className="text-slate-200 font-semibold">{projectTitle}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Yield Allocation:</span>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded text-xs">
                5.0% Fixed APR
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-800/60">
              <span className="text-slate-500">Initial Amount:</span>
              <span className="text-slate-300 font-mono">${(initialAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Growth Tracker */}
          <div className="mt-8 py-6 px-4 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl max-w-md mx-auto relative overflow-hidden">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">
              Live Asset Portfolio Tracker
            </p>
            <div className="flex items-baseline justify-center font-mono">
              <span className="text-3xl sm:text-4xl font-bold text-slate-100">{mainPart}</span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400/90">{microPart}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2.5 text-xs text-emerald-400/80">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span>Accumulating real-time yields</span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="mt-8 pt-4 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Link 
              href="/dashboard" 
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3.5 px-6 rounded-2xl transition duration-200 shadow-md text-sm"
            >
              Go to Dashboard
            </Link>
            <Link 
              href="/" 
              className="flex-1 bg-slate-800 border border-slate-700/60 hover:bg-slate-700/80 text-slate-200 font-bold py-3.5 px-6 rounded-2xl transition duration-200 text-sm"
            >
              Homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
