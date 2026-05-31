import { useEffect, useRef, useState } from 'react'
import Layout from '../components/common/Layout'
import HeroSection from '../components/common/HeroSection'
import InvestorForm from '../components/forms/InvestorForm'

const pillars = [
  {
    title: 'Consistent Returns',
    description: 'Our diversified portfolios have delivered 14-18% average annual returns over the past 5 years, consistently outperforming the market.',
    color: 'text-emerald-600 bg-emerald-50',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: 'Transparent Reporting',
    description: 'Real-time dashboards, monthly statements, and quarterly audited reports give you complete visibility into your investments at all times.',
    color: 'text-blue-600 bg-blue-50',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Expert Management',
    description: 'Our CFA-certified portfolio managers and AI-driven analytics work together to optimize your portfolio around the clock.',
    color: 'text-amber-600 bg-amber-50',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
]

const financials = [
  { label: 'Assets Under Management', value: 50, suffix: 'M+', prefix: '$' },
  { label: 'Average Annual Return', value: 16, suffix: '%' },
  { label: 'Active Investors', value: 500, suffix: '+' },
  { label: 'Years of Performance', value: 15, suffix: '+' },
]

const investmentSteps = [
  { step: '01', title: 'Register & KYC', description: 'Create your account and complete our simple Know Your Customer verification process online.' },
  { step: '02', title: 'Risk Assessment', description: 'Complete our risk profile questionnaire so we can recommend the right investment strategy for you.' },
  { step: '03', title: 'Choose Your Plan', description: 'Select from our Growth, Balanced, or Conservative portfolio plans, or opt for a custom managed portfolio.' },
  { step: '04', title: 'Fund & Invest', description: 'Deposit funds via bank transfer or mobile money. Your portfolio begins working for you immediately.' },
  { step: '05', title: 'Monitor & Grow', description: 'Track performance in real time on your dashboard. Withdraw, top up, or rebalance anytime.' },
]

function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const animated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true
        let start = 0
        const step = (value / 2000) * 16
        const timer = setInterval(() => {
          start += step
          if (start >= value) { setCount(value); clearInterval(timer) }
          else setCount(Math.floor(start))
        }, 16)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref}>{prefix}{count}{suffix}</span>
}

export default function Investors() {
  return (
    <Layout>
      <HeroSection
        title="Invest with Confidence"
        subtitle="Join 500+ investors who trust Let Investments to grow their wealth with proven strategies, cutting-edge AI, and complete transparency."
        ctaText="Start Investing"
        ctaLink="/get-started"
        secondaryCtaText="View Our Process"
        secondaryCtaLink="#process"
      />

      {/* Why Invest */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-let-blue mb-4">Why Invest With Us?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three pillars that set Let Investments apart from the rest.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((p, i) => (
              <div key={i} className="card text-center group hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 ${p.color}`}>
                  {p.icon}
                </div>
                <h3 className="text-xl font-heading font-bold text-let-blue mb-3">{p.title}</h3>
                <p className="text-gray-600 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Financial Highlights */}
      <section className="section-padding bg-let-blue">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-white mb-4">Financial Highlights</h2>
            <p className="text-xl text-gray-300 max-w-xl mx-auto">
              Numbers that tell our story of consistent, proven performance.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {financials.map((f, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-6 hover:bg-white/20 transition-colors duration-300">
                <div className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-2">
                  <AnimatedNumber value={f.value} prefix={f.prefix || ''} suffix={f.suffix || ''} />
                </div>
                <div className="text-gray-300 font-medium text-sm">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Process */}
      <section id="process" className="section-padding bg-let-light">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-let-blue mb-4">How to Get Started</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From sign-up to your first return in five simple steps.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {investmentSteps.map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-12 h-12 flex-shrink-0 bg-let-blue rounded-full flex items-center justify-center text-white font-bold font-heading text-sm">
                  {step.step}
                </div>
                <div className="card flex-1">
                  <h3 className="text-lg font-heading font-bold text-let-blue mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investor Form */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-heading font-bold text-let-blue mb-4">Register Your Interest</h2>
            <p className="text-xl text-gray-600">
              Tell us about your investment goals and our team will reach out within 24 hours.
            </p>
          </div>
          <div className="card">
            <InvestorForm />
          </div>
        </div>
      </section>
    </Layout>
  )
}
