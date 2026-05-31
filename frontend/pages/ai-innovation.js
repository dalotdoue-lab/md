import Layout from '../components/common/Layout'
import HeroSection from '../components/common/HeroSection'
import AIHighlight from '../components/common/AIHighlight'
import Link from 'next/link'

const timeline = [
  { year: '2018', title: 'Data Science Team Founded', description: 'Assembled a world-class team of data scientists and ML engineers.' },
  { year: '2019', title: 'First AI Investment Model', description: 'Launched v1 of our portfolio risk-scoring AI with 87% prediction accuracy.' },
  { year: '2020', title: 'AI Platform Beta Release', description: 'Released the AI analytics platform to select clients with real-time market signals.' },
  { year: '2022', title: 'Agricultural AI Integration', description: 'Extended AI capabilities to smart irrigation and crop yield prediction models.' },
  { year: '2023', title: 'Platform v3 Launch', description: 'Full public platform launch with NLP market sentiment analysis and automated rebalancing.' },
  { year: '2024', title: 'AI Consulting Division', description: 'Opened AI consulting services to external enterprises seeking digital transformation.' },
]

const features = [
  { title: 'Real-Time Signal Processing', description: 'Process 10,000+ market signals per second for instant investment insights.' },
  { title: 'NLP Market Sentiment', description: 'Natural language processing of news, social media, and financial reports.' },
  { title: 'Risk Scoring Engine', description: 'Automated risk assessment for each asset and portfolio configuration.' },
  { title: 'Crop Yield Prediction', description: 'ML models predicting agricultural yields from satellite and sensor data.' },
  { title: 'Automated Rebalancing', description: 'Intelligent portfolio rebalancing triggered by market conditions and targets.' },
  { title: 'Compliance Automation', description: 'AI-powered regulatory compliance monitoring and report generation.' },
]

export default function AIInnovation() {
  return (
    <Layout>
      <HeroSection
        eyebrow="AI & Innovation"
        title="Applied intelligence, real outcomes"
        subtitle="We bring artificial intelligence to investment management, engineering, and smart agriculture — building tools that deliver measurable value for our clients."
        ctaText="Book a consultation"
        ctaLink="/contact"
        secondaryCtaText="View our products"
        secondaryCtaLink="/products"
      />

      {/* AI Highlights - Alternating */}
      <section className="section-padding bg-paper">
        <div className="container-custom space-y-24">
          <AIHighlight
            title="Intelligent Portfolio Management"
            description="Our AI investment engine continuously analyzes global market data, economic indicators, and alternative data sources to make smarter, faster, and more accurate investment decisions on your behalf."
            features={[
              'Real-time market sentiment analysis from 500+ sources',
              'Automated portfolio risk scoring and alerting',
              'Predictive return modeling with 92% backtested accuracy',
              'One-click portfolio rebalancing recommendations',
            ]}
            ctaText="Learn About Investment Management"
            ctaLink="/services"
            reversed={false}
          />
          <AIHighlight
            title="Smart Agricultural Intelligence"
            description="Our agricultural AI platform fuses satellite imagery, IoT soil sensors, and historical weather data to generate precise irrigation schedules and yield forecasts, transforming how African farms operate."
            features={[
              'Satellite-based NDVI crop health monitoring',
              'AI-driven irrigation scheduling to cut water waste 40%',
              'Pest and disease early warning system',
              'Yield prediction accurate to within 5% variance',
            ]}
            ctaText="Explore Smart Irrigation"
            ctaLink="/products"
            reversed={true}
          />
          <AIHighlight
            title="Enterprise AI Transformation"
            description="We bring the same AI tools that power our own operations to your enterprise. Our consulting team designs, builds, and deploys custom AI solutions that automate workflows, unlock insights, and create competitive advantage."
            features={[
              'Custom ML model development and deployment',
              'Process automation using RPA and AI agents',
              'Business intelligence dashboards and reporting',
              'AI strategy development and change management',
            ]}
            ctaText="Book a Consultation"
            ctaLink="/contact"
            reversed={false}
          />
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding bg-bone">
        <div className="container-custom">
          <div className="max-w-2xl mb-14">
            <div className="eyebrow mb-5">Capabilities</div>
            <h2 className="text-4xl md:text-5xl font-heading text-ink mb-4 leading-tight">What powers our platform</h2>
            <p className="text-lg text-ink-soft leading-relaxed">
              The core technology capabilities behind our AI-driven services.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card">
                <div className="text-clay mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-heading text-ink mb-2">{f.title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Timeline */}
      <section className="section-padding bg-paper">
        <div className="container-custom max-w-3xl mx-auto">
          <div className="mb-14">
            <div className="eyebrow mb-5">Our Journey</div>
            <h2 className="text-4xl md:text-5xl font-heading text-ink mb-4 leading-tight">Six years of pushing boundaries</h2>
            <p className="text-lg text-ink-soft leading-relaxed">In AI for African financial services.</p>
          </div>
          <div className="border-l border-line">
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <div key={i} className="relative pl-8">
                  <span className="absolute left-0 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-clay ring-4 ring-paper"></span>
                  <div className="text-xs font-semibold uppercase tracking-label text-clay mb-1.5">{item.year}</div>
                  <h3 className="text-lg font-heading text-ink mb-1.5">{item.title}</h3>
                  <p className="text-ink-soft text-sm leading-relaxed max-w-xl">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading text-paper mb-6 leading-tight">Ready to put AI to work?</h2>
            <p className="text-lg text-paper/70 mb-10 max-w-xl mx-auto leading-relaxed">
              Our team will design a custom solution for your business.
            </p>
            <Link href="/contact" className="bg-paper text-ink hover:bg-bone font-medium px-7 py-3.5 rounded-md transition-colors inline-flex items-center justify-center">
              Book a consultation
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
