import { useState } from 'react'
import Layout from '../components/common/Layout'
import Link from 'next/link'

const serviceOptions = [
  { id: 'investment', label: 'Investment Management', basePrice: 1000 },
  { id: 'engineering', label: 'Engineering Solutions', basePrice: 5000 },
  { id: 'irrigation', label: 'Smart Irrigation', basePrice: 2500 },
  { id: 'ai', label: 'AI Consulting', basePrice: 3000 },
  { id: 'tracking', label: 'Project Tracking Portal', basePrice: 500 },
  { id: 'market', label: 'Market Insights Reports', basePrice: 200 },
]

export default function Quote() {
  const [step, setStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState([])
  const [projectDetails, setProjectDetails] = useState({
    name: '', company: '', email: '', phone: '', budget: '', timeline: '', description: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const toggleService = (id) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const estimatedCost = selectedServices.reduce((total, id) => {
    const service = serviceOptions.find(s => s.id === id)
    return total + (service?.basePrice || 0)
  }, 0)

  const handleDetailsChange = (e) => {
    setProjectDetails({ ...projectDetails, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const steps = [
    { number: 1, label: 'Select Services' },
    { number: 2, label: 'Project Details' },
    { number: 3, label: 'Review & Submit' },
  ]

  return (
    <Layout>
      {/* Header */}
      <div className="bg-ink py-20">
        <div className="container-custom max-w-2xl">
          <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-label text-paper/60 mb-5">
            <span className="inline-block w-7 h-px bg-clay"></span>
            Request a Quote
          </div>
          <h1 className="text-4xl md:text-5xl font-heading text-paper mb-4 leading-tight">Tell us what you're building</h1>
          <p className="text-lg text-paper/70 leading-relaxed">Get a customized proposal from our team within 24 hours.</p>
        </div>
      </div>

      <section className="section-padding bg-bone">
        <div className="container-custom max-w-3xl mx-auto">
          {submitted ? (
            <div className="card text-center py-16">
              <div className="text-olive mb-6 flex justify-center">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-heading text-ink mb-4">Quote request submitted</h2>
              <p className="text-ink-soft mb-8 text-lg leading-relaxed">
                Thank you, {projectDetails.name}. Our team will review your requirements and reach out within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/" className="btn-primary">Back to home</Link>
                <Link href="/contact" className="btn-outline">Contact us</Link>
              </div>
            </div>
          ) : (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-center mb-10">
                {steps.map((s, i) => (
                  <div key={s.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-heading text-sm transition-colors duration-300 ${
                        step >= s.number ? 'bg-ink text-paper' : 'bg-bone text-ink-muted border border-line'
                      }`}>
                        {step > s.number ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : s.number}
                      </div>
                      <span className={`text-xs mt-1.5 font-medium hidden sm:block ${step >= s.number ? 'text-ink' : 'text-ink-muted'}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-16 sm:w-24 h-px mx-2 transition-colors duration-300 ${step > s.number ? 'bg-ink' : 'bg-line'}`}></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="card">
                {/* Step 1: Select Services */}
                {step === 1 && (
                  <div>
                    <h2 className="text-2xl font-heading text-ink mb-2">Select services</h2>
                    <p className="text-ink-soft mb-6">Choose all the services you're interested in — you can select multiple.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {serviceOptions.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          className={`p-4 rounded-md border text-left transition-colors duration-200 ${
                            selectedServices.includes(service.id)
                              ? 'border-olive bg-olive/5'
                              : 'border-line hover:border-olive/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                              selectedServices.includes(service.id) ? 'bg-olive border-olive' : 'border-line'
                            }`}>
                              {selectedServices.includes(service.id) && (
                                <svg className="w-3 h-3 text-paper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-ink">{service.label}</div>
                              <div className="text-sm text-ink-muted">Starting from ${service.basePrice.toLocaleString()}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedServices.length > 0 && (
                      <div className="bg-bone border border-line rounded-md p-4 mb-6 flex justify-between items-center gap-3">
                        <span className="text-ink-soft text-sm">{selectedServices.length} service(s) selected</span>
                        <span className="font-heading text-ink text-lg">
                          Est. from ${estimatedCost.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => setStep(2)}
                        disabled={selectedServices.length === 0}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Project Details */}
                {step === 2 && (
                  <form onSubmit={(e) => { e.preventDefault(); setStep(3) }}>
                    <h2 className="text-2xl font-heading text-ink mb-2">Project details</h2>
                    <p className="text-ink-soft mb-6">Tell us more about your project so we can provide an accurate quote.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="label">Full Name *</label>
                        <input type="text" name="name" value={projectDetails.name} onChange={handleDetailsChange} required className="input-field" placeholder="John Kamau" />
                      </div>
                      <div>
                        <label className="label">Company</label>
                        <input type="text" name="company" value={projectDetails.company} onChange={handleDetailsChange} className="input-field" placeholder="Acme Corp" />
                      </div>
                      <div>
                        <label className="label">Email Address *</label>
                        <input type="email" name="email" value={projectDetails.email} onChange={handleDetailsChange} required className="input-field" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="label">Phone Number</label>
                        <input type="tel" name="phone" value={projectDetails.phone} onChange={handleDetailsChange} className="input-field" placeholder="+254 700 000 000" />
                      </div>
                      <div>
                        <label className="label">Budget Range</label>
                        <select name="budget" value={projectDetails.budget} onChange={handleDetailsChange} className="input-field">
                          <option value="">Select budget range</option>
                          <option value="under-10k">Under $10,000</option>
                          <option value="10k-50k">$10,000 – $50,000</option>
                          <option value="50k-200k">$50,000 – $200,000</option>
                          <option value="200k-plus">$200,000+</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Project Timeline</label>
                        <select name="timeline" value={projectDetails.timeline} onChange={handleDetailsChange} className="input-field">
                          <option value="">Select timeline</option>
                          <option value="asap">As soon as possible</option>
                          <option value="1-3months">1 – 3 months</option>
                          <option value="3-6months">3 – 6 months</option>
                          <option value="6-12months">6 – 12 months</option>
                          <option value="12months+">More than 12 months</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-6">
                      <label className="label">Project Description *</label>
                      <textarea name="description" value={projectDetails.description} onChange={handleDetailsChange} required rows={4} className="input-field resize-none" placeholder="Describe your project requirements, goals, and any specific needs..." />
                    </div>

                    <div className="flex justify-between">
                      <button type="button" onClick={() => setStep(1)} className="btn-ghost">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button type="submit" className="btn-primary">
                        Review Quote
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div>
                    <h2 className="text-2xl font-heading text-ink mb-2">Review your request</h2>
                    <p className="text-ink-soft mb-6">Please confirm your details before submitting.</p>

                    <div className="space-y-4 mb-8">
                      <div className="bg-bone border border-line rounded-md p-4">
                        <h3 className="font-heading text-ink mb-3">Selected services</h3>
                        <div className="space-y-2">
                          {selectedServices.map(id => {
                            const service = serviceOptions.find(s => s.id === id)
                            return (
                              <div key={id} className="flex justify-between text-sm">
                                <span className="text-ink-soft">{service?.label}</span>
                                <span className="font-semibold text-ink">from ${service?.basePrice.toLocaleString()}</span>
                              </div>
                            )
                          })}
                          <div className="border-t border-line pt-2 mt-2 flex justify-between items-baseline">
                            <span className="text-ink font-semibold">Total estimate</span>
                            <span className="font-heading text-ink text-lg">from ${estimatedCost.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-bone border border-line rounded-md p-4">
                        <h3 className="font-heading text-ink mb-3">Contact information</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-ink-muted">Name</div><div className="font-medium text-ink">{projectDetails.name}</div>
                          <div className="text-ink-muted">Email</div><div className="font-medium text-ink">{projectDetails.email}</div>
                          {projectDetails.company && <><div className="text-ink-muted">Company</div><div className="font-medium text-ink">{projectDetails.company}</div></>}
                          {projectDetails.budget && <><div className="text-ink-muted">Budget</div><div className="font-medium text-ink">{projectDetails.budget}</div></>}
                          {projectDetails.timeline && <><div className="text-ink-muted">Timeline</div><div className="font-medium text-ink">{projectDetails.timeline}</div></>}
                        </div>
                        {projectDetails.description && (
                          <div className="mt-3 pt-3 border-t border-line">
                            <div className="text-ink-muted text-sm mb-1">Description</div>
                            <p className="text-sm text-ink-soft leading-relaxed">{projectDetails.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button onClick={() => setStep(2)} className="btn-ghost">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button onClick={handleSubmit} className="btn-secondary">
                        Submit Quote Request
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  )
}
