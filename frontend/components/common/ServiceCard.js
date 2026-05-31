import Link from 'next/link'

const ServiceCard = ({ 
  title, 
  description, 
  icon, 
  link = '#',
  featured = false
}) => {
  return (
    <div className={`card group h-full flex flex-col ${featured ? 'border-clay/40' : ''}`}>
      <div className="flex items-start justify-between mb-5">
        <div className={`w-12 h-12 rounded-md flex items-center justify-center border
          ${featured ? 'bg-clay/10 border-clay/30 text-clay-deep' : 'bg-ink/5 border-line text-ink'}`}>
          {icon || (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </div>
        {featured && (
          <span className="eyebrow before:hidden text-clay-deep">Featured</span>
        )}
      </div>
      <h3 className="text-xl font-heading text-ink mb-2.5">
        {title}
      </h3>
      <p className="text-ink-soft mb-5 leading-relaxed flex-1">
        {description}
      </p>
      <Link href={link} className="inline-flex items-center text-sm font-semibold text-ink hover:text-clay-deep transition-colors">
        Learn more
        <svg className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  )
}

export default ServiceCard



