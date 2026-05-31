import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Layout from '../components/common/Layout'
import ServiceCard from '../components/common/ServiceCard'
import ProjectCard from '../components/common/ProjectCard'
import AIHighlight from '../components/common/AIHighlight'
import { buildApiUrl } from '../lib/apiUrl'

const stats = [
  { label: 'Clients Served', value: 500, suffix: '+' },
  { label: 'Assets Managed', value: 50, prefix: '$', suffix: 'M+' },
  { label: 'Years Experience', value: 15, suffix: '+' },
  { label: 'Client Satisfaction', value: 98, suffix: '%' },
]

const services = [
  {
    title: 'Investment Management',
    description: 'Strategic portfolio management tailored to your financial goals with proven returns and risk mitigation.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    link: '/services',
    featured: true,
  },
  {
    title: 'Engineering Solutions',
    description: 'End-to-end civil and structural engineering projects delivered with precision and innovation.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    link: '/services',
  },
  {
    title: 'Smart Irrigation',
    description: 'IoT-powered irrigation systems that optimize water use and maximize agricultural yield.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    link: '/products',
  },
  {
    title: 'AI Consulting',
    description: 'Leverage cutting-edge AI and machine learning to transform your business operations and decision-making.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    link: '/ai-innovation',
  },
  {
    title: 'Project Tracking',
    description: 'Real-time project monitoring dashboard with milestone tracking, invoicing, and progress reports.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    link: '/tracking',
  },
  {
    title: 'Market Insights',
    description: 'Deep market analysis, regional economic trends, and data-driven investment intelligence reports.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    link: '/blog',
  },
]

// Fallback content shown only if the API is unreachable. The real
// "featured" projects are managed by the admin in MongoDB and fetched
// from /api/catalog/projects at runtime.
const fallbackFeaturedProjects = [
  {
    title: 'Nairobi Smart Irrigation Network',
    description: 'Deploying IoT-based irrigation across 2,000 acres of farmland in central Kenya, reducing water usage by 40%.',
    category: 'Agriculture',
    status: 'in_progress',
    progress: 72,
  },
  {
    title: 'Green Energy Investment Fund',
    description: 'Structured investment portfolio in renewable energy projects across East Africa with $12M under management.',
    category: 'Investment',
    status: 'completed',
    progress: 100,
  },
  {
    title: 'AI Market Analytics Platform',
    description: 'Proprietary platform using machine learning to predict market movements and optimize portfolio allocation.',
    category: 'Technology',
    status: 'in_progress',
    progress: 55,
  },
]

const testimonials = [
  {
    name: 'Sarah Kamau',
    role: 'CEO, AgriVentures Ltd.',
    content: 'Let Investments transformed our agricultural operations with their smart irrigation solutions. We saw a 40% reduction in water costs and a 25% increase in yield within the first season.',
    rating: 5,
  },
  {
    name: 'James Okonkwo',
    role: 'Private Investor',
    content: 'The portfolio management team has consistently outperformed market benchmarks. My investments have grown by 18% year-over-year. Truly exceptional service and transparency.',
    rating: 5,
  },
  {
    name: 'Dr. Amara Diallo',
    role: 'Director, TechBridge Africa',
    content: 'Their AI consulting team helped us implement predictive analytics that cut operational costs by 30%. The ROI was realized in under 6 months. Highly recommended.',
    rating: 5,
  },
]

function AnimatedCounter({ value, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          let start = 0
          const duration = 2000
          const step = (value / duration) * 16
          const timer = setInterval(() => {
            start += step
            if (start >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  )
}

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState(fallbackFeaturedProjects)

  useEffect(() => {
    fetch(buildApiUrl('/api/catalog/projects'))
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(body => {
        const items = (body?.data || [])
          .filter(p => p.featured)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        if (items.length > 0) setFeaturedProjects(items)
      })
      .catch(() => {
        // keep fallback content silently
      })
  }, [])

  return (
    <Layout fullWidth>
      {/* Hero Section */}
      <section className="relative bg-ink overflow-hidden">
        <div className="relative container-custom py-28 md:py-36 lg:py-44">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-label text-paper/60 mb-8">
              <span className="inline-block w-7 h-px bg-clay"></span>
              Trusted Investment Partner Since 2009
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading text-paper mb-8 leading-[1.04]">
              Grow your future with{' '}
              <em className="text-clay not-italic font-normal italic">smart investments</em>
            </h1>
            <p className="text-lg md:text-xl text-paper/70 mb-10 leading-relaxed max-w-2xl">
              We combine engineering expertise, financial acumen, and applied AI to deliver
              exceptional returns and sustainable growth for our clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/get-started" className="bg-paper text-ink px-7 py-3.5 rounded-md font-medium hover:bg-bone transition-colors inline-flex items-center justify-center">
                Get started today
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/about" className="border border-paper/30 text-paper hover:bg-paper/10 transition-colors px-7 py-3.5 rounded-md font-medium inline-flex items-center justify-center">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-paper py-14 border-b border-line">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8 divide-line lg:divide-x">
            {stats.map((stat, i) => (
              <div key={i} className="text-center lg:px-4">
                <div className="text-4xl md:text-5xl font-heading text-ink mb-2">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                </div>
                <div className="text-xs font-semibold uppercase tracking-label text-ink-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-let-light">
        <div className="container-custom">
          <div className="max-w-2xl mb-14">
            <div className="eyebrow mb-5">What We Offer</div>
            <h2 className="text-4xl md:text-5xl font-heading text-ink mb-4 leading-tight">
              Our core services
            </h2>
            <p className="text-lg text-ink-soft leading-relaxed">
              Comprehensive solutions across investment, engineering, technology, and agriculture.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <ServiceCard key={i} {...service} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/services" className="btn-outline">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section-padding bg-paper">
        <div className="container-custom">
          <div className="max-w-2xl mb-14">
            <div className="eyebrow mb-5">Portfolio Highlights</div>
            <h2 className="text-4xl md:text-5xl font-heading text-ink mb-4 leading-tight">
              Featured projects
            </h2>
            <p className="text-lg text-ink-soft leading-relaxed">
              Explore our most impactful work delivering real results across diverse sectors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project, i) => (
              <ProjectCard key={project._id || i} {...project} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/projects" className="btn-primary">
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* AI Highlight */}
      <section className="section-padding bg-let-light">
        <div className="container-custom">
          <div className="max-w-2xl mb-14">
            <div className="eyebrow mb-5">Technology Edge</div>
            <h2 className="text-4xl md:text-5xl font-heading text-ink leading-tight">
              AI-powered innovation
            </h2>
          </div>
          <AIHighlight
            title="Intelligent Investment Decisions"
            description="Our proprietary AI models analyze thousands of market data points in real time to guide smarter investment decisions, reduce risk, and maximize returns for our clients."
            features={[
              'Real-time market sentiment analysis',
              'Portfolio risk scoring and rebalancing alerts',
              'Predictive yield forecasting for agricultural investments',
              'Automated compliance and reporting',
            ]}
            ctaText="Explore AI Innovation"
            ctaLink="/ai-innovation"
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-paper">
        <div className="container-custom">
          <div className="max-w-2xl mb-14">
            <div className="eyebrow mb-5">Client Stories</div>
            <h2 className="text-4xl md:text-5xl font-heading text-ink leading-tight">
              What our clients say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="card flex flex-col">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, si) => (
                    <svg key={si} className="w-4 h-4 text-clay" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-heading text-lg text-ink leading-relaxed flex-1 mb-6">"{t.content}"</p>
                <div className="flex items-center pt-5 border-t border-line">
                  <div className="w-10 h-10 bg-ink rounded-full flex items-center justify-center text-paper font-heading mr-3">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-ink">{t.name}</div>
                    <div className="text-sm text-ink-muted">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-ink py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading text-paper mb-6 leading-tight">
              Ready to invest in your future?
            </h2>
            <p className="text-lg text-paper/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join over 500 clients who trust Let Investments to grow their wealth and deliver
              results that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-started" className="bg-paper text-ink hover:bg-bone font-medium px-7 py-3.5 rounded-md transition-colors inline-flex items-center justify-center">
                Start investing today
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/contact" className="border border-paper/30 text-paper hover:bg-paper/10 font-medium px-7 py-3.5 rounded-md transition-colors inline-flex items-center justify-center">
                Talk to an advisor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
