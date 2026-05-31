import Link from 'next/link'

const MarketInsightCard = ({ article, variant = 'default' }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'Market Analysis': 'bg-blue-100 text-blue-800',
      'Regional Watch': 'bg-green-100 text-green-800',
      'Company Spotlight': 'bg-purple-100 text-purple-800',
      'Investment Education': 'bg-yellow-100 text-yellow-800',
      'Market Trends': 'bg-let-blue/10 text-let-blue'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getRegionBadge = (region) => {
    if (!region || region === 'Global') return null
    return (
      <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
        {region}
      </span>
    )
  }

  // Featured variant - larger card
  if (variant === 'featured') {
    return (
      <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div className="md:flex">
          <div className="md:w-1/3 bg-let-blue/10 flex items-center justify-center">
            <svg className="w-24 h-24 text-let-blue/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="p-6 md:w-2/3">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getCategoryColor(article.category)}`}>
                {article.category}
              </span>
              {article.is_featured && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 font-semibold rounded">
                  Featured
                </span>
              )}
            </div>
            <h3 className="text-xl font-heading font-bold text-let-blue mb-2 hover:text-let-accent transition-colors">
              <Link href={`/market-insights#${article.id}`}>
                {article.title}
              </Link>
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-3">
              {article.content?.substring(0, 200)}...
            </p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{article.author}</span>
              <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}</span>
            </div>
          </div>
        </div>
      </article>
    )
  }

  // Compact variant - for sidebar or list
  if (variant === 'compact') {
    return (
      <article className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-let-blue mb-2 line-clamp-2 hover:text-let-accent transition-colors">
          <Link href={`/market-insights#${article.id}`}>
            {article.title}
          </Link>
        </h4>
        <p className="text-xs text-gray-500 line-clamp-2">
          {article.content?.substring(0, 100)}...
        </p>
      </article>
    )
  }

  // Default variant - standard card
  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-40 bg-let-blue/10 flex items-center justify-center">
        <svg className="w-16 h-16 text-let-blue/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
          {article.is_featured && (
            <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 font-semibold rounded">
              Featured
            </span>
          )}
        </div>
        <h3 className="text-lg font-heading font-bold text-let-blue mb-2 hover:text-let-accent transition-colors line-clamp-2">
          <Link href={`/market-insights#${article.id}`}>
            {article.title}
          </Link>
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {article.content?.substring(0, 150)}...
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            <span>{article.author}</span>
            {getRegionBadge(article.region)}
          </div>
          <span>{article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}</span>
        </div>
      </div>
    </article>
  )
}

export default MarketInsightCard



