const mapPinIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const globeIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const RegionalWatch = ({ regions = [], articles = [] }) => {
  const getRegionInfo = (regionName) => {
    const info = {
      'East Africa': {
        color: 'bg-green-600',
        icon: mapPinIcon,
        description: 'Kenya, Tanzania, Uganda',
        focus: 'Telecom, Banking, Consumer'
      },
      'West Africa': {
        color: 'bg-yellow-600',
        icon: mapPinIcon,
        description: 'Nigeria, Ghana, Senegal',
        focus: 'Banking, Energy, Manufacturing'
      },
      'South Africa': {
        color: 'bg-blue-600',
        icon: mapPinIcon,
        description: 'South Africa, Namibia, Botswana',
        focus: 'Mining, Telecom, Retail'
      },
      'North Africa': {
        color: 'bg-purple-600',
        icon: mapPinIcon,
        description: 'Egypt, Morocco, Tunisia',
        focus: 'Banking, Infrastructure, Telecom'
      },
      'Global': {
        color: 'bg-gray-600',
        icon: globeIcon,
        description: 'US, Europe, Asia',
        focus: 'Tech, Energy, Consumer'
      }
    }
    return info[regionName] || { color: 'bg-gray-600', icon: mapPinIcon, description: regionName, focus: 'Various' }
  }

  // Get articles by region
  const getArticlesByRegion = (region) => {
    return articles.filter(a => a.region === region || a.region === 'Global').slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {regions.map((region) => {
        const info = getRegionInfo(region)
        const regionArticles = getArticlesByRegion(region)
        
        return (
          <div key={region} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className={`${info.color} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white opacity-90">{info.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{region}</h3>
                    <p className="text-white/80 text-sm">{info.description}</p>
                  </div>
                </div>
                <div className="text-right text-white/90">
                  <p className="text-xs uppercase tracking-wide">Focus Sectors</p>
                  <p className="text-sm font-semibold">{info.focus}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {regionArticles.length > 0 ? (
                <div className="space-y-4">
                  {regionArticles.map((article) => (
                    <div key={article.id} className="border-l-4 border-let-blue pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-let-green">
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">
                          {article.published_at ? new Date(article.published_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <h4 className="font-semibold text-let-blue hover:text-let-accent transition-colors cursor-pointer">
                        {article.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {article.content?.substring(0, 120)}...
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent updates for this region.</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RegionalWatch



