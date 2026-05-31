import Layout from '../components/common/Layout'
import ContactForm from '../components/forms/ContactForm'

const contactInfo = [
  {
    title: 'Head Office',
    detail: 'Upper Hill, Nairobi, Kenya\nPO Box 12345-00100',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Phone',
    detail: '+254 700 123 456\n+254 733 987 654',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    title: 'Email',
    detail: 'info@letinvestments.com\nsupport@letinvestments.com',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

const officeHours = [
  { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM EAT' },
  { day: 'Saturday', hours: '9:00 AM – 2:00 PM EAT' },
  { day: 'Sunday & Holidays', hours: 'Closed' },
]

export default function Contact() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-ink py-20">
        <div className="container-custom">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-label text-paper/60 mb-6">
              <span className="inline-block w-7 h-px bg-clay"></span>
              Get in Touch
            </div>
            <h1 className="text-4xl md:text-5xl font-heading text-paper mb-4 leading-tight">
              Let's talk
            </h1>
            <p className="text-lg text-paper/70 leading-relaxed">
              Have a question, or ready to start your investment journey? Our team is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="section-padding bg-bone">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-2xl font-heading text-ink mb-6">Send us a message</h2>
                <ContactForm />
              </div>
            </div>

            {/* Info Cards */}
            <div className="space-y-6">
              {contactInfo.map((info, i) => (
                <div key={i} className="card">
                  <div className="flex items-start gap-4">
                    <div className="text-clay flex-shrink-0 mt-0.5">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-heading text-ink mb-1">{info.title}</h3>
                      <p className="text-ink-soft text-sm whitespace-pre-line leading-relaxed">{info.detail}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Office Hours */}
              <div className="card">
                <h3 className="font-heading text-ink mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-clay" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Office hours
                </h3>
                <div className="space-y-2.5">
                  {officeHours.map((h, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-ink-soft">{h.day}</span>
                      <span className={`font-semibold ${h.hours === 'Closed' ? 'text-clay-deep' : 'text-ink'}`}>
                        {h.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mt-10">
            <div className="w-full h-72 bg-paper rounded-lg flex items-center justify-center border border-line">
              <div className="text-center">
                <svg className="w-14 h-14 text-ink/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="font-heading text-ink-soft text-lg">Upper Hill, Nairobi</p>
                <p className="text-ink-muted text-sm">Kenya</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
