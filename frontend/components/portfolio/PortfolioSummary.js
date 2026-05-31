const PortfolioSummary = ({ 
  virtualBalance = 10000,
  totalInvested = 0,
  currentValue = 0,
  totalGainLoss = 0,
  totalGainLossPercent = 0
}) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const isPositive = totalGainLoss >= 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Virtual Balance */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-let-blue">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Virtual Balance</p>
            <p className="text-2xl font-bold text-let-blue mt-1">
              {formatCurrency(virtualBalance)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-let-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Available for investment</p>
      </div>

      {/* Total Invested */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-let-green">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Invested</p>
            <p className="text-2xl font-bold text-let-blue mt-1">
              {formatCurrency(totalInvested)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-let-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Portfolio value</p>
      </div>

      {/* Current Value */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-let-accent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Current Value</p>
            <p className="text-2xl font-bold text-let-blue mt-1">
              {formatCurrency(currentValue)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-let-accent/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-let-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">At current market prices</p>
      </div>

      {/* Gain/Loss */}
      <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${isPositive ? 'border-green-500' : 'border-red-500'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Gain/Loss</p>
            <p className={`text-2xl font-bold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatCurrency(totalGainLoss)}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPositive ? 'bg-green-50' : 'bg-red-50'}`}>
            {isPositive ? (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
          </div>
        </div>
        <p className={`text-xs mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{totalGainLossPercent}% all time
        </p>
      </div>
    </div>
  )
}

export default PortfolioSummary



