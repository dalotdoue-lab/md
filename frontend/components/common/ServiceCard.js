import Link from 'next/link'

const ServiceCard = ({ 
  title, 
  description, 
  icon, 
  link = '#',
  featured = false
}) => {
  return (
    <div className={`card h-full ${featured ? 'ring-2 ring-let-green' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center 
          ${featured ? 'bg-let-green' : 'bg-let-blue'} text-white`}>
          {icon || (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
        </div>
      </div>
      <h3 className="text-xl font-heading font-bold text-let-blue mb-3">
        {title}
      </h3>
      <p className="text-gray-600 mb-4 leading-relaxed">
        {description}
      </p>
      <Link href={link} className="inline-flex items-center text-let-green font-semibold hover:underline">
        Learn More
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  )
}

export default ServiceCard



