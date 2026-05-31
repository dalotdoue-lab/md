import { useState } from 'react'

const InvestorForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    investmentType: '',
    investmentAmount: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    console.log('=== INVESTOR FORM SUBMIT ===')
    console.log('Form data:', formData)
    console.log('Sending request to /api/investors')
    
    try {
      const response = await fetch('/api/investors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          company: formData.company || undefined,
          investment_interest: formData.investmentType,
          message: formData.message || undefined
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      // Safe JSON parsing
      let data = null
      try {
        data = await response.json()
        console.log('Response data:', JSON.stringify(data, null, 2))
      } catch (e) {
        console.error('Invalid JSON response')
      }

      if (!response.ok) {
        throw new Error(data?.message || data?.error || 'Submission failed')
      }

      console.log('Investor form submitted successfully')
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        investmentType: '',
        investmentAmount: '',
        message: ''
      })
    } catch (error) {
      console.error('!!! INVESTOR FORM ERROR !!!')
      console.error('Error:', error.message)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const investmentTypes = [
    { value: '', label: 'Select investment interest' },
    { value: 'equity', label: 'Equity Investment' },
    { value: 'debt', label: 'Debt Investment' },
    { value: 'venture', label: 'Venture Capital' },
    { value: 'strategic', label: 'Strategic Partnership' },
    { value: 'other', label: 'Other' },
  ]

  const investmentAmounts = [
    { value: '', label: 'Select investment range' },
    { value: 'under100k', label: 'Under $100,000' },
    { value: '100k-500k', label: '$100,000 - $500,000' },
    { value: '500k-1m', label: '$500,000 - $1,000,000' },
    { value: '1m-5m', label: '$1,000,000 - $5,000,000' },
    { value: '5m+', label: '$5,000,000+' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="label">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="John Doe"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="email" className="label">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field"
            placeholder="john@example.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="phone" className="label">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input-field"
            placeholder="+1 (555) 123-4567"
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="company" className="label">Company / Organization</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="input-field"
            placeholder="Company Name"
            autoComplete="organization"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="investmentType" className="label">Investment Interest *</label>
          <select
            id="investmentType"
            name="investmentType"
            value={formData.investmentType}
            onChange={handleChange}
            required
            className="input-field"
          >
            {investmentTypes.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="investmentAmount" className="label">Investment Amount *</label>
          <select
            id="investmentAmount"
            name="investmentAmount"
            value={formData.investmentAmount}
            onChange={handleChange}
            required
            className="input-field"
          >
            {investmentAmounts.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="label">Additional Information</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="input-field resize-none"
          placeholder="Tell us more about your investment goals and how you'd like to be involved..."
        />
      </div>

      {submitStatus === 'success' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Thank you for your interest! Our investor relations team will contact you within 2-3 business days.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          There was an error submitting your inquiry. Please try again.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full md:w-auto"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
      </button>
    </form>
  )
}

export default InvestorForm



