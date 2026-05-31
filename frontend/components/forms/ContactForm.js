import { useState } from 'react'
import { buildApiUrl } from '../../lib/apiUrl'

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
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

    try {
      const response = await fetch(buildApiUrl('/api/submissions/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Failed to send')
      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      console.error('ContactForm submit error:', err)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

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
          />
        </div>
        <div>
          <label htmlFor="subject" className="label">Subject *</label>
          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="input-field"
          >
            <option value="">Select a subject</option>
            <option value="general">General Inquiry</option>
            <option value="services">Services</option>
            <option value="projects">Projects</option>
            <option value="investors">Investor Relations</option>
            <option value="careers">Careers</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="label">Message *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="input-field resize-none"
          placeholder="How can we help you?"
        />
      </div>

      {submitStatus === 'success' && (
        <div className="bg-olive/10 border border-olive/30 text-olive-deep px-4 py-3 rounded-md text-sm">
          Thank you — your message has been sent. We'll get back to you soon.
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="bg-clay/10 border border-clay/30 text-clay-deep px-4 py-3 rounded-md text-sm">
          Something went wrong. Please try again or contact us directly.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full md:w-auto"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}

export default ContactForm



