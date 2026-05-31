import Link from 'next/link'
import Layout from '../components/common/Layout'
import HeroSection from '../components/common/HeroSection'

const team = [
  {
    name: 'David Mwangi',
    title: 'CEO & Founder',
    bio: 'David brings 20+ years of financial markets experience from Wall Street and Nairobi. He founded Let Investments with a vision to democratize access to institutional-quality investment management across Africa.',
    initial: 'D',
  },
  {
    name: 'Amina Hassan',
    title: 'Chief Investment Officer',
    bio: 'With a background in quantitative finance from Oxford, Amina leads our investment strategy team and oversees $50M+ in managed assets with a track record of consistent above-market returns.',
    initial: 'A',
  },
  {
    name: 'Peter Osei',
    title: 'Head of Engineering',
    bio: 'Peter leads our civil and structural engineering division, having delivered over 80 infrastructure projects across East and West Africa with a focus on sustainable and innovative construction methods.',
    initial: 'P',
  },
  {
    name: 'Grace Achieng',
    title: 'AI & Technology Director',
    bio: 'Grace holds a PhD in Machine Learning from MIT. She spearheads our AI innovation initiatives, building proprietary tools that give our clients a competitive edge in investment decision-making.',
    initial: 'G',
  },
]

const values = [
  {
    title: 'Integrity',
    description: 'We operate with complete transparency. Every investment decision, every fee, every return is clearly communicated to our clients.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Innovation',
    description: 'We constantly push boundaries, leveraging AI, IoT, and data science to stay ahead of the market and deliver superior outcomes.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Excellence',
    description: 'We hold ourselves to the highest standards in every project, investment, and client interaction—accepting nothing less than the best.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    title: 'Sustainability',
    description: 'Our investments and projects prioritize long-term environmental and social sustainability alongside financial returns.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Partnership',
    description: "We see ourselves as long-term partners in our clients's success, not just service providers. Your goals are our goals.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Impact',
    description: 'Every project and investment is measured by the real-world impact it creates for communities, ecosystems, and economies.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const milestones = [
  { year: '2009', event: 'Founded in Nairobi, Kenya with a focus on real estate investment' },
  { year: '2012', event: 'Expanded into engineering solutions, completing first major infrastructure project' },
  { year: '2015', event: 'Launched smart agriculture division, pioneering IoT irrigation in East Africa' },
  { year: '2018', event: 'Crossed $20M in assets under management; opened Lagos office' },
  { year: '2020', event: 'Launched proprietary AI investment analytics platform' },
  { year: '2023', event: 'Surpassed $50M AUM; expanded to 500+ clients across 12 African countries' },
]

export default function About() {
  return (
    <Layout>
      <HeroSection
        title="Building Africa's Investment Future"
        subtitle="Since 2009, Let Investments has combined financial expertise, engineering innovation, and AI-powered technology to create lasting value for our clients and communities."
        ctaText="Our Services"
        ctaLink="/services"
        secondaryCtaText="Meet the Team"
        secondaryCtaLink="#team"
      />

      {/* Mission & Vision */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card border-l-4 border-let-blue">
              <div className="w-12 h-12 bg-let-blue/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-let-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-bold text-let-blue mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To empower individuals, businesses, and institutions across Africa with world-class investment management, engineering excellence, and technology innovation — creating sustainable wealth and lasting impact.
              </p>
            </div>
            <div className="card border-l-4 border-let-green">
              <div className="w-12 h-12 bg-let-green/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-let-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-bold text-let-blue mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be Africa's most trusted and innovative investment company — recognized for exceptional returns, technological leadership, and transformative impact on communities across the continent and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-padding bg-let-light">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-let-blue mb-4">Our Story</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Founded in 2009 by David Mwangi, Let Investments began as a boutique real estate investment firm in Nairobi. What started as a one-man operation guided by a belief that African investors deserved better has grown into a multi-disciplinary powerhouse managing over $50M in assets and delivering transformative engineering and technology solutions across the continent.
            </p>
          </div>
          {/* Timeline */}
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-let-blue/20 hidden md:block"></div>
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={i} className={`flex flex-col md:flex-row items-center gap-4 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`w-full md:w-5/12 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="card inline-block max-w-full">
                      <div className="text-let-green font-bold text-lg mb-1">{m.year}</div>
                      <p className="text-gray-700">{m.event}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex w-2/12 justify-center">
                    <div className="w-4 h-4 bg-let-blue rounded-full border-4 border-white shadow-md z-10"></div>
                  </div>
                  <div className="hidden md:block w-5/12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-let-blue mb-4">Meet Our Leadership</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A diverse team of experts united by a passion for innovation and a commitment to client success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div key={i} className="card text-center group">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-let-blue to-let-accent flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  {member.initial}
                </div>
                <h3 className="text-xl font-heading font-bold text-let-blue mb-1">{member.name}</h3>
                <p className="text-let-green font-semibold text-sm mb-3">{member.title}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-let-blue">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-heading font-bold text-white mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              The principles that guide every decision, every project, every investment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-6 hover:bg-white/20 transition-colors duration-300">
                <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center mb-4 text-white">
                  {v.icon}
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">{v.title}</h3>
                <p className="text-gray-300 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Clients Worldwide' },
              { value: '$50M+', label: 'Assets Under Management' },
              { value: '80+', label: 'Projects Completed' },
              { value: '12', label: 'African Countries' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl font-heading font-extrabold text-let-blue mb-2">{stat.value}</div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
