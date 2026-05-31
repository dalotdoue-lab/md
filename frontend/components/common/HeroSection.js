import Link from 'next/link'

const HeroSection = ({ 
  title, 
  subtitle, 
  ctaText, 
  ctaLink, 
  secondaryCtaText, 
  secondaryCtaLink,
  backgroundImage,
  backgroundColor = 'bg-let-blue'
}) => {
  return (
    <section className={`relative ${backgroundColor} overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Background Image Overlay */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-let-blue/80"></div>
        </div>
      )}

      <div className="relative container-custom py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            {ctaText && (
              <Link href={ctaLink || '#'} className="btn-primary text-center">
                {ctaText}
              </Link>
            )}
            {secondaryCtaText && (
              <Link href={secondaryCtaLink || '#'} className="btn-outline border-white text-white hover:bg-white hover:text-let-blue text-center">
                {secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 md:h-24" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path 
            fill="#FFFFFF" 
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          ></path>
        </svg>
      </div>
    </section>
  )
}

export default HeroSection



