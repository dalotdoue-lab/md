import { useState } from 'react'
import Link from 'next/link'
import Layout from '../components/common/Layout'
import HeroSection from '../components/common/HeroSection'

const services = [
  {
    title: 'Investment Management',
    description: 'Our expert portfolio managers craft personalized investment strategies aligned with your risk tolerance and financial objectives. We leverage proprietary analytics and global market intelligence to consistently outperform benchmarks.',
    features: ['Portfolio construction & rebalancing', 'Risk management & hedging', 'Alternative investments', 'ESG-focused options'],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    color: 'let-blue',
  },
  {
    title: 'Engineering Solutions',
    description: 'From concept to completion, our engineering division delivers civil, structural, and infrastructure projects with world-class precision. We have successfully completed 80+ projects across Africa.',
    features: ['Structural engineering', 'Civil infrastructure', 'Project management', 'Quality assurance & compliance'],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'let-accent',
  },
  {
    title: 'Smart Irrigation Systems',
    description: 'Our IoT-powered irrigation solutions revolutionize agricultural water management. Using sensors, AI, and automated controls, we reduce water usage by up to 40% while maximizing crop yields.',
    features: ['Soil moisture monitoring', 'Automated scheduling', 'Remote mobile control', 'Yield analytics dashboard'],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    color: 'let-green',
  },
  {
    title: 'AI Consulting',
    description: 'We help businesses harness the power of artificial intelligence and machine learning to automate processes, gain insights, and make smarter decisions faster than ever before.',
    features: ['Machine learning model development', 'Predictive analytics', 'Process automation', 'AI strategy & roadmap'],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'let-blue',
  },
  {
    title: 'Project Tracking Portal',
    description: 'Our digital tracking platform gives clients real-time visibility into project milestones, budgets, invoices, and deliverables. Stay informed without the administrative overhead.',
    features: ['Real-time milestone tracking', 'Budget vs. actuals reporting', 'Digital invoice management', 'Document storage & sharing'],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    color: 'let-accent',
  },
  {
    title: 'Market Insights',
    description: 'Our research team publishes in-depth market analyses, economic reports, and sector-specific insights to keep our clients ahead of trends and emerging opportunities.',
    features: ['Weekly market briefs', 'Regional economic watch', 'Sector deep dives', 'Customized research reports'],
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      </svg>
    ),
    color: 'let-green',
  },
]

const process = [
  {
    step: '01',
    title: 'Discovery & Consultation',
    description: 'We begin with an in-depth consultation to understand your goals, risk tolerance, timeline, and current financial position.',
  },
  {
    step: '02',
    title: 'Strategy Development',
    description: 'Our team crafts a customized strategy—investment plan, engineering proposal, or technology roadmap—tailored specifically to your needs.',
  },
  {
    step: '03',
    title: 'Implementation',
    description: 'We execute with precision, keeping you informed at every stage with transparent reporting and proactive communication.',
  },
  {
    step: '04',
    title: 'Ongoing Monitoring & Optimization',
    description: 'We continuously monitor performance, adapt to changing conditions, and optimize to ensure you\'re always on track to meet your goals.',
  },
]

const faqs = [
  {
    question: 'What is the minimum investment amount?',
    answer: 'Our standard managed portfolios start from $10,000 USD. We also offer micro-investment options starting from $1,000 for clients just beginning their investment journey.',
  },
  {
    question: 'How do you manage investment risk?',
    answer: 'We use a multi-layered risk management approach combining diversification, hedging strategies, real-time monitoring, and our proprietary AI risk-scoring system that flags portfolio anomalies before they become problems.',
  },
  {
    question: 'How long do engineering projects typically take?',
    answer: 'Project timelines vary by scope and complexity. Small infrastructure projects typically run 3-6 months, while large civil engineering contracts may span 1-3 years. All timelines are specified in the project proposal and tracked through our digital portal.',
  },
  {
    question: 'Do you serve clients outside Africa?',
    answer: 'Yes. While our primary focus is African markets, we serve diaspora clients globally and have partnerships that allow us to manage investments in international markets including the US, UK, and UAE.',
  },
  {
    question: 'How can I monitor my investment performance?',
    answer: 'All clients have access to our real-time dashboard where you can view portfolio performance, transaction history, documents, and reports 24/7. We also send monthly performance summaries and quarterly detailed reports.',
  },
]

export default function Services() {
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <Layout>
      <HeroSection
        title="Comprehensive Solutions for Growth"
        subtitle="From investment management to AI consulting and smart agriculture, we deliver integrated solutions that create real, measurable value."
        ctaText="Get a Quote"
        ctaLink="/quote"
        secondaryCtaText="Talk to Us"
        secondaryCtaLink="/contact"
      />

      {/* Services Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-let-blue mb-4">What We Do</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Six core service areas, all backed by expert teams and cutting-edge technology.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div key={i} className="card group">
                <div className={`w-16 h-16 rounded-2xl bg-${service.color}/10 flex items-center justify-center mb-5 text-${service.color} group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-heading font-bold text-let-blue mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-5 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((f, fi) => (
                    <li key={fi} className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-let-green mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-let-light">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-let-blue mb-4">How We Work</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A proven four-step process designed for clarity, efficiency, and results.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, i) => (
              <div key={i} className="card text-center group">
                <div className="text-5xl font-heading font-extrabold text-let-blue/10 mb-4 group-hover:text-let-green/20 transition-colors duration-300">
                  {step.step}
                </div>
                <h3 className="text-xl font-heading font-bold text-let-blue mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-let-blue mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to your most common questions.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-let-light transition-colors duration-200"
                >
                  <span className="font-semibold text-let-blue text-lg">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-let-blue transition-transform duration-300 flex-shrink-0 ml-4 ${openFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-let-blue to-let-accent py-20">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-heading font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Request a free quote or schedule a consultation with one of our experts today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="bg-white text-let-blue hover:bg-let-light font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300">
              Request a Quote
            </Link>
            <Link href="/contact" className="border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-flex items-center justify-center">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
