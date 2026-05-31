import { useState } from 'react'
import Layout from '../components/common/Layout'
import HeroSection from '../components/common/HeroSection'
import Link from 'next/link'

const products = [
  { id: 1, name: 'AquaSense Pro', category: 'Sensors', price: '$249', description: 'High-precision soil moisture and temperature sensor with 3-year battery life and wireless data transmission.' },
  { id: 2, name: 'FlowControl Hub', category: 'Controllers', price: '$599', description: 'Central irrigation controller supporting up to 32 zones with AI-driven scheduling and mobile app control.' },
  { id: 3, name: 'RainGuard AI', category: 'Software', price: '$49/mo', description: 'Cloud-based irrigation management platform with weather integration, analytics dashboard, and automated alerts.' },
  { id: 4, name: 'Drip Master Kit', category: 'Hardware', price: '$399', description: 'Complete drip irrigation starter kit for up to 1 acre, including pipes, emitters, and pressure regulators.' },
  { id: 5, name: 'SoilMap Analyzer', category: 'Sensors', price: '$179', description: 'Multi-depth soil analysis probe measuring moisture, pH, nitrogen, and phosphorus levels in real time.' },
  { id: 6, name: 'CropWatch Satellite', category: 'Software', price: '$99/mo', description: 'Weekly satellite-derived NDVI crop health reports with change detection and yield prediction modeling.' },
]

const categories = ['All', 'Sensors', 'Controllers', 'Hardware', 'Software']

export default function Products() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory)

  return (
    <Layout>
      <HeroSection
        eyebrow="Products"
        title="Smart irrigation, end to end"
        subtitle="IoT-powered hardware and AI-driven software to maximize your farm's water efficiency and yield."
        ctaText="Request a demo"
        ctaLink="/contact"
        secondaryCtaText="Get a quote"
        secondaryCtaLink="/quote"
      />

      <section className="section-padding bg-paper">
        <div className="container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-12 border-b border-line pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  activeCategory === cat
                    ? 'bg-ink text-paper'
                    : 'text-ink-soft hover:bg-ink/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="card cursor-pointer hover:-translate-y-0.5 hover:shadow-lift transition-all duration-300"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="h-44 bg-bone rounded-md mb-5 flex items-center justify-center">
                  <svg className="w-14 h-14 text-ink/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                  </svg>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-semibold uppercase tracking-label text-ink-muted">
                    {product.category}
                  </span>
                  <span className="font-heading text-ink text-lg">{product.price}</span>
                </div>
                <h3 className="text-xl font-heading text-ink mb-2">{product.name}</h3>
                <p className="text-ink-soft text-sm leading-relaxed mb-5">{product.description}</p>
                <span className="text-sm font-medium text-olive-deep inline-flex items-center">
                  View details
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-paper rounded-lg max-w-lg w-full p-8 shadow-lift border border-line"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="block text-xs font-semibold uppercase tracking-label text-ink-muted mb-2">
                  {selectedProduct.category}
                </span>
                <h2 className="text-2xl font-heading text-ink">{selectedProduct.name}</h2>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-ink/5 rounded-md">
                <svg className="w-6 h-6 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-40 bg-bone rounded-md flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-ink/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <p className="text-ink-soft leading-relaxed mb-6">{selectedProduct.description}</p>
            <div className="flex items-center justify-between border-t border-line pt-5">
              <span className="text-3xl font-heading text-ink">{selectedProduct.price}</span>
              <div className="flex gap-3">
                <Link href="/contact" className="btn-outline text-sm py-2 px-4">
                  Request demo
                </Link>
                <Link href="/quote" className="btn-secondary text-sm py-2 px-4">
                  Get quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="bg-ink py-24">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading text-paper mb-6 leading-tight">Need a custom solution?</h2>
            <p className="text-lg text-paper/70 mb-10 max-w-xl mx-auto leading-relaxed">
              We design bespoke irrigation systems for farms of all sizes. Tell us what you're working with.
            </p>
            <Link href="/contact" className="bg-paper text-ink hover:bg-bone font-medium px-7 py-3.5 rounded-md transition-colors inline-flex items-center justify-center">
              Contact our team
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  )
}
