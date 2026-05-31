import Link from 'next/link'

const AIHighlight = ({
  title,
  description,
  features = [],
  image,
  ctaText = 'Learn More',
  ctaLink = '/ai-innovation',
  reversed = false
}) => {
  return (
    <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12`}>
      {/* Image Section */}
      <div className="w-full lg:w-1/2">
        <div className="relative bg-paper border border-line rounded-lg overflow-hidden h-80 lg:h-96 flex items-center justify-center shadow-card">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-5 bg-ink/5 border border-line rounded-md flex items-center justify-center">
                <svg className="w-10 h-10 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="eyebrow before:hidden justify-center">AI Innovation</p>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full lg:w-1/2">
        <div className="eyebrow mb-5">AI &amp; Innovation</div>

        <h3 className="text-3xl md:text-4xl font-heading text-ink mb-4">
          {title}
        </h3>

        <p className="text-ink-soft text-lg mb-6 leading-relaxed">
          {description}
        </p>

        {features.length > 0 && (
          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-5 h-5 text-olive mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-ink-soft">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <Link href={ctaLink} className="btn-primary inline-flex items-center">
          {ctaText}
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default AIHighlight



