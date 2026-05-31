import Head from 'next/head'

const SEOHead = ({ 
  title = 'Let Investments',
  description = 'Professional investment and engineering solutions for sustainable growth',
  image = '/images/og-image.jpg',
  url = 'https://letinvestments.com'
}) => {
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="keywords" content="investment, engineering, sustainable, innovation, AI, smart solutions" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
    </Head>
  )
}

export default SEOHead



