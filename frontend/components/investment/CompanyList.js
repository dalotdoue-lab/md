import { useState, useEffect } from 'react'
import Link from 'next/link'

const CompanyList = ({ companies, onSelectCompany, selectedCompany }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return 'N/A'
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    return formatPrice(marketCap)
  }

  // Handle both string and object formats for sector/region
  const getSectorName = (company) => {
    if (!company.sector) return 'Unknown'
    return typeof company.sector === 'string' ? company.sector : (company.sector.name || 'Unknown')
  }

  const getRegionName = (company) => {
    if (!company.region) return 'Unknown'
    return typeof company.region === 'string' ? company.region : (company.region.name || 'Unknown')
  }

  const getRegionColor = (region) => {
    const colors = {
      'East Africa': 'bg-green-100 text-green-800',
      'West Africa': 'bg-yellow-100 text-yellow-800',
      'South Africa': 'bg-blue-100 text-blue-800',
      'North Africa': 'bg-purple-100 text-purple-800',
      'Global Markets': 'bg-gray-100 text-gray-800'
    }
    return colors[region] || 'bg-gray-100 text-gray-800'
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No companies found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {companies.map((company) => {
        const sectorName = getSectorName(company)
        const regionName = getRegionName(company)
        
        return (
          <div
            key={company.id}
            onClick={() => onSelectCompany(company)}
            className={`bg-white rounded-xl p-6 cursor-pointer transition-all duration-200 border-2 
              ${selectedCompany?.id === company.id 
                ? 'border-let-blue shadow-lg' 
                : 'border-transparent shadow-md hover:shadow-lg hover:border-let-blue/30'
              }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-let-blue">
                    {company.name}
                  </h3>
                  <span className="px-2 py-1 bg-let-blue/10 text-let-blue text-xs font-semibold rounded">
                    {company.ticker}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-let-light text-let-blue text-xs font-medium rounded">
                    {sectorName}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRegionColor(regionName)}`}>
                    {regionName}
                  </span>
                  <span className="px-2 py-1 text-gray-600 text-xs font-medium bg-gray-100 rounded">
                    {company.country}
                  </span>
                </div>
                {company.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {company.description}
                  </p>
                )}
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Market Cap: {formatMarketCap(company.marketCap || company.market_cap)}</span>
                  <span>P/E: {company.peRatio || company.pe_ratio || 'N/A'}</span>
                  <span>Div Yield: {company.dividendYield || company.dividend_yield ? `${company.dividendYield || company.dividend_yield}%` : 'N/A'}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-let-blue">
                  {formatPrice(company.currentPrice || company.current_price)}
                </div>
                <div className="text-xs text-gray-500">per share</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CompanyList



