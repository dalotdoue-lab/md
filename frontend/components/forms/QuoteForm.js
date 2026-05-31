import { useState } from 'react'
import { buildApiUrl } from '../../lib/apiUrl'

const QuoteForm = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Service Selection
    services: [],
    // Step 2: Project Info
    projectName: '',
    projectType: '',
    budget: '',
    timeline: '',
    description: '',
    // Step 3: Contact Info
    name: '',
    email: '',
    phone: '',
    company: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [estimatedCost, setEstimatedCost] = useState(0)

  const serviceOptions = [
    { id: 'investment', name: 'Investment Management', price: 5000 },
    { id: 'engineering', name: 'Engineering Solutions', price: 10000 },
    { id: 'ai', name: 'AI Consulting', price: 7500 },
    { id: 'irrigation', name: 'Smart Irrigation', price: 5000 },
    { id: 'automation', name: 'Building Automation', price: 8000 },
    { id: 'tracking', name: 'Project Tracking', price: 3000 },
  ]

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const services = prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId]
      return { ...prev, services }
    })
  }

  const calculateEstimate = () => {
    const total = formData.services.reduce((sum, id) => {
      const service = serviceOptions.find(s => s.id === id)
      return sum + (service ? service.price : 0)
    }, 0)
    setEstimatedCost(total)
  }

  const nextStep = () => {
    if (step === 1 && formData.services.length === 0) {
      alert('Please select at least one service')
      return
    }
    calculateEstimate()
    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        services: formData.services,
        description: formData.description,
        estimatedBudget: formData.budget,
      }
      const response = await fetch(buildApiUrl('/api/submissions/quotes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Failed to submit')
      setSubmitStatus('success')
    } catch (err) {
      console.error('QuoteForm submit error:', err)
      alert('Failed to submit quote. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= s ? 'bg-let-blue text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 sm:w-24 h-1 mx-2 ${step > s ? 'bg-let-blue' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>

      {submitStatus === 'success' ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-let-blue mb-4">Quote Request Submitted!</h3>
          <p className="text-gray-600 mb-6">We'll review your requirements and get back to you within 24-48 hours.</p>
          <button onClick={() => { setSubmitStatus(null); setStep(1); setFormData({ ...formData, services: [] }) }} className="btn-primary">
            Submit Another Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-bold text-let-blue mb-6">Select Services</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {serviceOptions.map((service) => (
                  <label
                    key={service.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.services.includes(service.id)
                        ? 'border-let-blue bg-blue-50'
                        : 'border-gray-200 hover:border-let-blue'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service.id)}
                      onChange={() => handleServiceToggle(service.id)}
                      className="w-5 h-5 text-let-blue"
                    />
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900">{service.name}</span>
                      <span className="block text-sm text-gray-500">Starting at ${service.price.toLocaleString()}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Project Info */}
          {step === 2 && (
            <div>
              <h3 className="text-xl font-bold text-let-blue mb-6">Project Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Project Name</label>
                  <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} className="input-field" placeholder="My Project" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Project Type</label>
                    <select name="projectType" value={formData.projectType} onChange={handleChange} className="input-field">
                      <option value="">Select type</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                      <option value="institutional">Institutional</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Budget Range</label>
                    <select name="budget" value={formData.budget} onChange={handleChange} className="input-field">
                      <option value="">Select budget</option>
                      <option value="under10k">Under $10,000</option>
                      <option value="10k-50k">$10,000 - $50,000</option>
                      <option value="50k-100k">$50,000 - $100,000</option>
                      <option value="100k+">$100,000+</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Timeline</label>
                  <select name="timeline" value={formData.timeline} onChange={handleChange} className="input-field">
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="1-3months">1-3 Months</option>
                    <option value="3-6months">3-6 Months</option>
                    <option value="6months+">6+ Months</option>
                  </select>
                </div>
                <div>
                  <label className="label">Project Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="input-field resize-none" placeholder="Describe your project requirements..." />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-bold text-let-blue mb-6">Contact Information</h3>
              
              {/* Estimated Cost Display */}
              <div className="bg-let-light rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Cost Range:</span>
                  <span className="text-2xl font-bold text-let-blue">
                    ${(estimatedCost * 0.8).toLocaleString()} - ${(estimatedCost * 1.2).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">*Final quote may vary based on detailed requirements</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div>
                    <label className="label">Company Name</label>
                    <input type="text" name="company" value={formData.company} onChange={handleChange} className="input-field" placeholder="Your Company" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="btn-outline">
                Back
              </button>
            ) : (
              <div></div>
            )}
            {step < 3 ? (
              <button type="button" onClick={nextStep} className="btn-primary">
                Continue
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

export default QuoteForm



