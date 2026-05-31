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
      <section className="relative bg-let-blue overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M 5 0 L 0 0 0 5" fill="none" stroke="white" strokeWidth="0.3" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-10">
          <div className="w-full h-full bg-gradient-to-l from-let-green to-transparent"></div>
        </div>

        <div className="relative container-custom py-24 md:py-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 rounded-full mb-6">
              <span className="w-2 h-2 bg-let-green rounded-full mr-2 animate-pulse"></span>
              <span className="text-white/80 text-sm font-medium">Trusted Investment Partner Since 2009</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-white mb-6 leading-tight">
              Grow Your Future with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-let-green to-emerald-300">
                Smart Investments
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
              We combine cutting-edge AI, engineering expertise, and financial acumen to deliver exceptional returns and sustainable growth for our clients.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/get-started" className="btn-secondary text-lg px-8 py-4">
                Get Started Today
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/about" className="border-2 border-white text-white hover:bg-white hover:text-let-blue transition-all duration-300 text-lg px-8 py-4 rounded-lg font-semibold inline-flex items-center justify-center">
                Learn More
              </Link>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 md:h-20">
            <path fill="white" d="M0,40L80,45C160,50,320,60,480,58C640,56,800,44,960,38C1120,32,1280,36,1360,38L1440,40L1440,80L0,80Z" />
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="group">
                <div className="text-4xl md:text-5xl font-heading font-extrabold text-let-blue mb-2 group-hover:text-let-green transition-colors duration-300">
                  <AnimatedCounter value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix || ''} />
                </div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-let-light">
        <div className="container-custom">
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-4 py-2 bg-let-blue/10 rounded-full mb-4">
              <span className="text-let-blue font-semibold text-sm">What We Offer</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-let-blue mb-4">
              Our Core Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-4 py-2 bg-let-green/10 rounded-full mb-4">
              <span className="text-let-green font-semibold text-sm">Portfolio Highlights</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-let-blue mb-4">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-4 py-2 bg-let-blue/10 rounded-full mb-4">
              <span className="text-let-blue font-semibold text-sm">Technology Edge</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-let-blue mb-4">
              AI-Powered Innovation
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
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <div className="inline-flex items-center px-4 py-2 bg-let-green/10 rounded-full mb-4">
              <span className="text-let-green font-semibold text-sm">Client Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-let-blue mb-4">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="card flex flex-col">
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, si) => (
                    <svg key={si} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed flex-1 mb-6 italic">"{t.content}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-let-blue rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-let-blue">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-let-blue via-let-accent to-let-green py-20">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-6">
            Ready to Invest in Your Future?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join over 500 clients who trust Let Investments to grow their wealth and deliver results that matter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/get-started" className="bg-white text-let-blue hover:bg-let-light font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-flex items-center">
              Start Investing Today
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link href="/contact" className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-flex items-center justify-center">
              Talk to an Advisor
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
