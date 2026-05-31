import { useState, useEffect } from 'react'
import Layout from '../components/common/Layout'
import HeroSection from '../components/common/HeroSection'
import ProjectCard from '../components/common/ProjectCard'
import { buildApiUrl } from '../lib/apiUrl'

const staticProjects = [
  {
    _id: 's1',
    title: 'Nairobi Smart Irrigation Network',
    description: 'IoT-based irrigation across 2,000 acres in central Kenya, reducing water usage by 40% and increasing yield by 25%.',
    category: 'Agriculture',
    status: 'in_progress',
    progress: 72,
  },
  {
    _id: 's2',
    title: 'Green Energy Investment Fund',
    description: 'Structured investment portfolio in renewable energy projects across East Africa with $12M under management.',
    category: 'Investment',
    status: 'completed',
    progress: 100,
  },
  {
    _id: 's3',
    title: 'AI Market Analytics Platform',
    description: 'Proprietary machine learning platform predicting market movements and optimizing portfolio allocation in real time.',
    category: 'Technology',
    status: 'in_progress',
    progress: 55,
  },
  {
    _id: 's4',
    title: 'Lagos Commercial Complex',
    description: 'A 15-story mixed-use commercial and residential development in Victoria Island, Lagos, valued at $8M.',
    category: 'Engineering',
    status: 'completed',
    progress: 100,
  },
  {
    _id: 's5',
    title: 'Mombasa Port Expansion',
    description: 'Structural engineering consultancy for the Mombasa port berth expansion project supporting East Africa trade.',
    category: 'Engineering',
    status: 'in_progress',
    progress: 38,
  },
  {
    _id: 's6',
    title: 'AgriTech Investment Portfolio',
    description: 'A diversified portfolio of investments in 12 African agritech startups with combined valuation of $25M.',
    category: 'Investment',
    status: 'completed',
    progress: 100,
  },
  {
    _id: 's7',
    title: 'Smart Water Management System',
    description: 'Automated water distribution management across three counties in Ghana, serving 80,000+ residents.',
    category: 'Agriculture',
    status: 'in_progress',
    progress: 60,
  },
  {
    _id: 's8',
    title: 'Predictive Maintenance AI Tool',
    description: 'AI system for industrial equipment predictive maintenance, reducing downtime by 35% for manufacturing clients.',
    category: 'Technology',
    status: 'completed',
    progress: 100,
  },
  {
    _id: 's9',
    title: 'Accra Solar Farm Infrastructure',
    description: 'Civil engineering design and oversight for a 50MW solar farm project in the Greater Accra Region.',
    category: 'Engineering',
    status: 'planning',
    progress: 15,
  },
]

const categories = ['All', 'Engineering', 'Investment', 'Technology', 'Agriculture']

export default function Projects() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [projects, setProjects] = useState(staticProjects)

  useEffect(() => {
    fetch(buildApiUrl('/api/catalog/projects'))
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const list = data?.data
        if (Array.isArray(list) && list.length > 0) setProjects(list)
      })
      .catch(() => {})
  }, [])

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.category === activeFilter)

  const countFor = cat => cat === 'All'
    ? projects.length
    : projects.filter(p => p.category === cat).length

  return (
    <Layout>
      <HeroSection
        eyebrow="Portfolio"
        title="The work, across every sector"
        subtitle="Completed and ongoing projects spanning engineering, investment, technology, and agriculture."
        ctaText="Start a project"
        ctaLink="/quote"
        secondaryCtaText="Contact us"
        secondaryCtaLink="/contact"
      />

      <section className="section-padding bg-paper">
        <div className="container-custom">
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-12 border-b border-line pb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 inline-flex items-center gap-2 ${
                  activeFilter === cat
                    ? 'bg-ink text-paper'
                    : 'text-ink-soft hover:bg-ink/5'
                }`}
              >
                {cat}
                <span className={`text-xs ${activeFilter === cat ? 'text-paper/60' : 'text-ink-muted'}`}>
                  {countFor(cat)}
                </span>
              </button>
            ))}
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(project => (
              <ProjectCard
                key={project._id || project.title}
                title={project.title}
                description={project.description}
                category={project.category}
                image={project.image}
                status={project.status}
                progress={project.progress}
                link={project.link || '#'}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-ink-muted text-lg">No projects found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink py-20">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 divide-paper/10 md:divide-x">
            {[
              { value: '80+', label: 'Projects Completed' },
              { value: '12', label: 'African Countries' },
              { value: '$50M+', label: 'Project Value' },
              { value: '98%', label: 'On-Time Delivery' },
            ].map((stat, i) => (
              <div key={i} className="text-center md:px-4">
                <div className="text-4xl md:text-5xl font-heading text-paper mb-2">{stat.value}</div>
                <div className="text-xs font-semibold uppercase tracking-label text-paper/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
