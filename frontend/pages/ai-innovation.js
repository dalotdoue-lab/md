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
        title="AI & Innovation at Let Investments"
        subtitle="We are pioneering the application of artificial intelligence in investment management, engineering, and smart agriculture to deliver unprecedented value for our clients."
        ctaText="Book AI Consultation"
        ctaLink="/contact"
        secondaryCtaText="View Our Products"
        secondaryCtaLink="/products"
        backgroundColor="bg-gradient-to-br from-let-blue via-let-accent to-let-blue"
      />

      {/* AI Highlights - Alternating */}
      <section className="section-padding bg-white">
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
      <section className="section-padding bg-let-light">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-let-blue mb-4">AI Capabilities</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The core technology capabilities powering our AI-driven services.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="card group">
                <div className="w-12 h-12 bg-gradient-to-br from-let-blue to-let-accent rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-heading font-bold text-let-blue mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Innovation Timeline */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-let-blue mb-4">Our Innovation Journey</h2>
            <p className="text-xl text-gray-600">Six years of pushing AI boundaries in African financial services.</p>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-let-blue/20"></div>
            <div className="space-y-8">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-6 pl-16 relative">
                  <div className="absolute left-6 top-2 w-4 h-4 rounded-full bg-let-blue border-4 border-white shadow-md"></div>
                  <div className="card flex-1">
                    <div className="text-let-green font-bold text-sm mb-1">{item.year}</div>
                    <h3 className="text-lg font-heading font-bold text-let-blue mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-let-blue via-let-accent to-let-green py-20">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-heading font-bold text-white mb-6">Ready to Embrace AI?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-xl mx-auto">
            Let our AI experts design a custom solution for your business needs.
          </p>
          <Link href="/contact" className="bg-white text-let-blue hover:bg-let-light font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-flex items-center">
            Book a Free Consultation
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </Layout>
  )
}
