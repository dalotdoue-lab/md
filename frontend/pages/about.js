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
        eyebrow="About Let Investments"
        title="Building Africa's investment future"
        subtitle="Since 2009, Let Investments has combined financial expertise, engineering innovation, and applied technology to create lasting value for our clients and communities."
        ctaText="Our services"
        ctaLink="/services"
        secondaryCtaText="Meet the team"
        secondaryCtaLink="#team"
      />

      {/* Mission & Vision */}
      <section className="section-padding bg-paper">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card border-l-2 border-olive">
              <div className="w-12 h-12 bg-olive/10 rounded-md flex items-center justify-center mb-5 text-olive-deep">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading text-ink mb-3">Our mission</h3>
              <p className="text-ink-soft leading-relaxed">
                To empower individuals, businesses, and institutions across Africa with world-class investment management, engineering excellence, and technology innovation — creating sustainable wealth and lasting impact.
              </p>
            </div>
            <div className="card border-l-2 border-clay">
              <div className="w-12 h-12 bg-clay/10 rounded-md flex items-center justify-center mb-5 text-clay-deep">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading text-ink mb-3">Our vision</h3>
              <p className="text-ink-soft leading-relaxed">
                To be Africa's most trusted and innovative investment company — recognized for exceptional returns, technological leadership, and transformative impact on communities across the continent and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="section-padding bg-bone">
        <div className="container-custom">
          <div className="max-w-3xl mb-16">
            <div className="eyebrow mb-5">Our Story</div>
            <p className="font-heading text-2xl md:text-3xl text-ink leading-snug">
              Founded in 2009 by David Mwangi, Let Investments began as a boutique real estate
              firm in Nairobi — a one-man operation built on the belief that African investors
              deserved better. Today it manages over $50M in assets and delivers engineering and
              technology work across the continent.
            </p>
          </div>
          {/* Timeline */}
          <div className="border-l border-line ml-2 md:ml-0">
            <div className="space-y-10">
              {milestones.map((m, i) => (
                <div key={i} className="relative pl-8">
                  <span className="absolute left-0 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-clay ring-4 ring-bone"></span>
                  <div className="font-heading text-xl text-ink mb-1">{m.year}</div>
                  <p className="text-ink-soft leading-relaxed max-w-xl">{m.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="section-padding bg-paper">
        <div className="container-custom">
          <div className="max-w-2xl mb-14">
            <div className="eyebrow mb-5">Leadership</div>
            <h2 className="text-4xl md:text-5xl font-heading text-ink mb-4 leading-tight">Meet the people behind the work</h2>
            <p className="text-lg text-ink-soft leading-relaxed">
              A team of experts united by a passion for innovation and a commitment to client success.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div key={i} className="card">
                <div className="w-16 h-16 rounded-full bg-ink flex items-center justify-center text-paper text-2xl font-heading mb-5">
                  {member.initial}
                </div>
                <h3 className="text-xl font-heading text-ink mb-1">{member.name}</h3>
                <p className="text-xs font-semibold uppercase tracking-label text-clay mb-4">{member.title}</p>
                <p className="text-ink-soft text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-ink">
        <div className="container-custom">
          <div className="max-w-2xl mb-14">
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-label text-paper/60 mb-5">
              <span className="inline-block w-7 h-px bg-clay"></span>
              What We Stand For
            </div>
            <h2 className="text-4xl md:text-5xl font-heading text-paper leading-tight">Our core values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-paper/10 border border-paper/10 rounded-lg overflow-hidden">
            {values.map((v, i) => (
              <div key={i} className="bg-ink p-8 hover:bg-olive-deep/40 transition-colors duration-300">
                <div className="text-clay mb-4">
                  {v.icon}
                </div>
                <h3 className="text-xl font-heading text-paper mb-2">{v.title}</h3>
                <p className="text-paper/70 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-paper">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 divide-line md:divide-x">
            {[
              { value: '500+', label: 'Clients Worldwide' },
              { value: '$50M+', label: 'Assets Under Management' },
              { value: '80+', label: 'Projects Completed' },
              { value: '12', label: 'African Countries' },
            ].map((stat, i) => (
              <div key={i} className="text-center md:px-4">
                <div className="text-4xl md:text-5xl font-heading text-ink mb-2">{stat.value}</div>
                <div className="text-xs font-semibold uppercase tracking-label text-ink-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
