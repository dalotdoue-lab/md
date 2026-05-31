import { useState } from 'react'
import Link from 'next/link'
import Layout from '../components/common/Layout'
import HeroSection from '../components/common/HeroSection'

const posts = [
  {
    id: 1,
    title: 'The Rise of AI in African Investment Management',
    excerpt: 'How machine learning is transforming portfolio management across the continent, enabling retail investors to access institutional-grade analytics.',
    category: 'AI & Technology',
    author: 'Grace Achieng',
    date: 'May 2, 2026',
    readTime: '8 min read',
    featured: true,
  },
  {
    id: 2,
    title: 'Smart Irrigation: Solving Africa\'s Water Crisis One Farm at a Time',
    excerpt: 'IoT-powered water management systems are revolutionizing African agriculture, reducing waste by up to 40% while boosting yields significantly.',
    category: 'Agriculture',
    author: 'Peter Osei',
    date: 'April 25, 2026',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 3,
    title: '5 Investment Strategies for Navigating a High-Inflation Environment',
    excerpt: 'When inflation runs hot, traditional portfolios suffer. Here are five proven strategies to protect and grow your wealth in inflationary periods.',
    category: 'Investment',
    author: 'Amina Hassan',
    date: 'April 18, 2026',
    readTime: '7 min read',
    featured: false,
  },
  {
    id: 4,
    title: 'Engineering Sustainable Infrastructure for Africa\'s Urban Future',
    excerpt: 'As African cities grow rapidly, sustainable engineering practices are essential to building infrastructure that will last for generations.',
    category: 'Engineering',
    author: 'Peter Osei',
    date: 'April 10, 2026',
    readTime: '5 min read',
    featured: false,
  },
  {
    id: 5,
    title: 'Understanding ESG Investing: A Guide for African Investors',
    excerpt: 'Environmental, Social, and Governance criteria are reshaping global investment frameworks. Here is how to incorporate ESG into your portfolio.',
    category: 'Investment',
    author: 'Amina Hassan',
    date: 'March 28, 2026',
    readTime: '9 min read',
    featured: false,
  },
  {
    id: 6,
    title: 'How Predictive Analytics is Changing Crop Yield Forecasting',
    excerpt: 'Combining satellite imagery, soil sensors, and AI models, we can now predict crop yields with unprecedented accuracy months in advance.',
    category: 'AI & Technology',
    author: 'Grace Achieng',
    date: 'March 15, 2026',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 7,
    title: 'Market Watch: East African Investment Climate Q2 2026',
    excerpt: 'Our quarterly deep dive into the East African investment landscape, covering key economic indicators, sector trends, and emerging opportunities.',
    category: 'Market Insights',
    author: 'David Mwangi',
    date: 'March 5, 2026',
    readTime: '12 min read',
    featured: false,
  },
]

const categories = ['All', 'Investment', 'AI & Technology', 'Agriculture', 'Engineering', 'Market Insights']

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')

  const featuredPost = posts.find(p => p.featured)
  const regularPosts = posts.filter(p => !p.featured)

  const filteredPosts = activeCategory === 'All'
    ? regularPosts
    : regularPosts.filter(p => p.category === activeCategory)

  return (
    <Layout>
      <HeroSection
        eyebrow="Journal"
        title="Insights & market intelligence"
        subtitle="Analysis, investment strategy, and technology notes from the Let Investments team."
        ctaText="Subscribe"
        ctaLink="/contact"
      />

      <section className="section-padding bg-paper">
        <div className="container-custom">
          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-16">
              <div className="eyebrow mb-6">Featured</div>
              <div className="bg-ink rounded-lg p-8 md:p-12 text-paper">
                <div className="max-w-3xl">
                  <span className="block text-xs font-semibold uppercase tracking-label text-clay mb-5">
                    {featuredPost.category}
                  </span>
                  <h2 className="text-3xl md:text-4xl font-heading mb-4 leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-paper/70 text-lg mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-paper/50 mb-8">
                    <span>{featuredPost.author}</span>
                    <span>•</span>
                    <span>{featuredPost.date}</span>
                    <span>•</span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <Link href={`/blog/${featuredPost.id}`} className="bg-paper text-ink hover:bg-bone font-medium px-6 py-3 rounded-md transition-colors inline-flex items-center justify-center">
                    Read full article
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-10 border-b border-line pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                  activeCategory === cat
                    ? 'bg-ink text-paper'
                    : 'text-ink-soft hover:bg-ink/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredPosts.map((post) => (
              <article key={post.id} className="card flex flex-col group cursor-pointer">
                <div className="h-40 bg-bone rounded-md mb-5 flex items-center justify-center">
                  <svg className="w-12 h-12 text-ink/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="block text-xs font-semibold uppercase tracking-label text-clay mb-3">
                  {post.category}
                </span>
                <h3 className="text-lg font-heading text-ink mb-2 leading-snug group-hover:text-olive-deep transition-colors duration-200">
                  {post.title}
                </h3>
                <p className="text-ink-soft text-sm leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-ink-muted pt-4 border-t border-line">
                  <span>{post.author}</span>
                  <span>{post.readTime}</span>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <button className="w-10 h-10 rounded-md bg-ink text-paper font-medium">1</button>
            <button className="w-10 h-10 rounded-md text-ink-soft hover:bg-ink/5 font-medium">2</button>
            <button className="w-10 h-10 rounded-md text-ink-soft hover:bg-ink/5 font-medium">3</button>
            <button className="w-10 h-10 rounded-md text-ink-soft hover:bg-ink/5 font-medium">
              <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </Layout>
  )
}
