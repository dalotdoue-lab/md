import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function InvestSuccess() {
  const router = useRouter()
  const { project, amount } = router.query

  const initialAmount = parseFloat(amount) || 1000 // Default fallback if no param
  const projectTitle = project || 'Let Growth Fund'

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
        <title>Investment Successful — Let Investments</title>
        <meta name="description" content="Your asset investment has been successfully processed." />
      </Head>

      <div className="min-h-screen bg-bone text-ink-soft flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-xl bg-paper border border-line rounded-lg p-8 text-center shadow-card">
          {/* Success Icon */}
          <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 bg-olive/10 rounded-full animate-ping opacity-60"></div>
            <div className="w-14 h-14 rounded-full bg-olive/10 border border-olive/30 flex items-center justify-center text-olive-deep">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-heading text-ink leading-tight">
            Investment confirmed
          </h1>
          <p className="text-ink-soft text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Your capital is now active and generating yields. A detailed receipt and contract have been sent to your email.
          </p>

          {/* Investment Details */}
          <div className="mt-8 bg-bone rounded-md p-5 border border-line text-left space-y-3.5 max-w-md mx-auto">
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-muted">Asset class / project</span>
              <span className="text-ink font-semibold">{projectTitle}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-muted">Yield allocation</span>
              <span className="text-olive-deep font-semibold bg-olive/10 border border-olive/20 px-2 py-0.5 rounded text-xs">
                5.0% Fixed APR
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-3 border-t border-line">
              <span className="text-ink-muted">Initial amount</span>
              <span className="text-ink font-mono">${(initialAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Growth Tracker */}
          <div className="mt-8 py-6 px-4 bg-ink rounded-lg max-w-md mx-auto relative overflow-hidden">
            <p className="text-[10px] text-paper/50 font-semibold uppercase tracking-label mb-1.5">
              Live portfolio tracker
            </p>
            <div className="flex items-baseline justify-center font-mono">
              <span className="text-3xl sm:text-4xl font-bold text-paper">{mainPart}</span>
              <span className="text-xl sm:text-2xl font-bold text-clay">{microPart}</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-2.5 text-xs text-paper/60">
              <span className="w-1.5 h-1.5 bg-clay rounded-full animate-pulse"></span>
              <span>Accumulating real-time yields</span>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="mt-8 pt-4 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Link
              href="/dashboard"
              className="flex-1 btn-primary text-sm"
            >
              Go to dashboard
            </Link>
            <Link
              href="/"
              className="flex-1 btn-outline text-sm"
            >
              Homepage
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
