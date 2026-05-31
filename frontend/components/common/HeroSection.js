import Link from 'next/link'

const HeroSection = ({ 
  title, 
  subtitle, 
  ctaText, 
  ctaLink, 
  secondaryCtaText, 
  secondaryCtaLink,
  backgroundImage,
  backgroundColor = 'bg-ink',
  eyebrow,
}) => {
  return (
    <section className={`relative ${backgroundColor} overflow-hidden`}>
      {/* Background Image Overlay */}
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-ink/80"></div>
        </div>
      )}

      <div className="relative container-custom py-24 md:py-32">
        <div className="max-w-3xl">
          {eyebrow && (
            <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-label text-paper/60 mb-6">
              <span className="inline-block w-7 h-px bg-clay"></span>
              {eyebrow}
            </div>
          )}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading text-paper mb-6 leading-[1.08]">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-paper/70 mb-8 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4">
            {ctaText && (
              <Link href={ctaLink || '#'} className="bg-paper text-ink px-6 py-3 rounded-md font-medium hover:bg-bone transition-colors text-center inline-flex items-center justify-center">
                {ctaText}
              </Link>
            )}
            {secondaryCtaText && (
              <Link href={secondaryCtaLink || '#'} className="border border-paper/30 text-paper px-6 py-3 rounded-md font-medium hover:bg-paper/10 transition-colors text-center inline-flex items-center justify-center">
                {secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection



