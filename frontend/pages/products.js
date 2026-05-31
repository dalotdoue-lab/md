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
        title="Smart Irrigation Products"
        subtitle="IoT-powered hardware and AI-driven software solutions to maximize your farm's water efficiency and yield."
        ctaText="Request a Demo"
        ctaLink="/contact"
        secondaryCtaText="Get a Quote"
        secondaryCtaLink="/quote"
      />

      <section className="section-padding bg-white">
        <div className="container-custom">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-let-green text-white shadow-md'
                    : 'bg-let-light text-gray-700 hover:bg-let-green/10'
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
                className="card cursor-pointer group hover:-translate-y-1 transition-all duration-300"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="h-44 bg-gradient-to-br from-let-blue/10 to-let-green/10 rounded-xl mb-4 flex items-center justify-center group-hover:from-let-blue/20 group-hover:to-let-green/20 transition-all duration-300">
                  <svg className="w-16 h-16 text-let-blue/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                  </svg>
                </div>
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block px-3 py-1 bg-let-green/10 text-let-green text-xs font-semibold rounded-full">
                    {product.category}
                  </span>
                  <span className="font-bold text-let-blue text-lg">{product.price}</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-let-blue mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{product.description}</p>
                <button className="btn-outline w-full text-sm py-2">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-3 py-1 bg-let-green/10 text-let-green text-xs font-semibold rounded-full mb-2">
                  {selectedProduct.category}
                </span>
                <h2 className="text-2xl font-heading font-bold text-let-blue">{selectedProduct.name}</h2>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-40 bg-gradient-to-br from-let-blue/10 to-let-green/10 rounded-xl flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-let-blue/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">{selectedProduct.description}</p>
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-3xl font-heading font-bold text-let-blue">{selectedProduct.price}</span>
              <div className="flex gap-3">
                <Link href="/contact" className="btn-outline text-sm py-2 px-4">
                  Request Demo
                </Link>
                <Link href="/quote" className="btn-secondary text-sm py-2 px-4">
                  Get Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <section className="bg-let-green py-16">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">Need a Custom Solution?</h2>
          <p className="text-white/80 mb-8 text-lg max-w-xl mx-auto">
            We design bespoke irrigation systems for farms of all sizes. Contact us to discuss your specific requirements.
          </p>
          <Link href="/contact" className="bg-white text-let-green hover:bg-let-light font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 inline-flex items-center">
            Contact Our Team
          </Link>
        </div>
      </section>
    </Layout>
  )
}
