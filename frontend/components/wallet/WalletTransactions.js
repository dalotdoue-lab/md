import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '../../lib/api'

const WalletTransactions = ({ transactions: initialTransactions, isLoading: initialLoading, onWalletUpdate }) => {
  const [transactions, setTransactions] = useState(initialTransactions || [])
  const [isLoading, setIsLoading] = useState(initialLoading !== undefined ? initialLoading : true)
  const [filter, setFilter] = useState('all')
  const [confirming, setConfirming] = useState(null)
  const [lastRefresh, setLastRefresh] = useState(null)

  useEffect(() => {
    if (initialTransactions !== undefined) {
      setTransactions(initialTransactions)
    }
    if (initialLoading !== undefined) {
      setIsLoading(initialLoading)
    }
  }, [initialTransactions, initialLoading])

  const fetchTransactions = async () => {
    setIsLoading(true)
    try {
      const data = await apiGet('/api/wallet/transactions?limit=50')
      if (data?.success) {
        setTransactions(data.transactions)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh every 10 seconds if there are pending transactions
  useEffect(() => {
    const hasPending = transactions.some(t => t.status === 'pending')
    if (hasPending) {
      const interval = setInterval(() => {
        fetchTransactions()
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [transactions])

  // Initial fetch
  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleConfirmTransaction = async (transactionId) => {
    setConfirming(transactionId)
    try {
      const data = await apiPost(`/api/wallet/confirm/${transactionId}`, { status: 'completed' })
      
      if (data.success) {
        // Update wallet if callback provided
        if (onWalletUpdate && data.wallet) {
          onWalletUpdate(data.wallet)
        }
        
        // Refresh transactions
        await fetchTransactions()
      } else {
        alert(data.message || 'Failed to confirm transaction')
      }
    } catch (error) {
      console.error('Failed to confirm transaction:', error)
      alert(error.message || 'Failed to confirm transaction')
    } finally {
      setConfirming(null)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        )
      case 'WITHDRAW':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
        )
      case 'TRADE_BUY':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        )
      case 'TRADE_SELL':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        )
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status?.toUpperCase()}
      </span>
    )
  }

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true
    if (filter === 'pending') return t.status === 'pending'
    return t.type === filter
  })

  const hasPending = transactions.some(t => t.status === 'pending')

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
          {hasPending && (
            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span>
              Auto-refreshing for pending transactions
            </p>
          )}
        </div>
        <button
          onClick={fetchTransactions}
          disabled={isLoading}
          className="text-sm text-let-blue hover:text-let-blue/80 disabled:opacity-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'DEPOSIT', label: 'Deposits' },
          { key: 'WITHDRAW', label: 'Withdrawals' },
          { key: 'pending', label: 'Pending' }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-let-blue text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400">Your wallet transactions will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                transaction.status === 'pending' ? 'bg-yellow-50 border border-yellow-100' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {getTypeIcon(transaction.type)}
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.type.replace('_', ' ')}
                    {transaction.status === 'pending' && (
                      <span className="ml-2 text-xs text-yellow-600">(Pending)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    Ref: {transaction.reference}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'DEPOSIT' || transaction.type === 'TRADE_SELL'
                    ? 'text-green-600'
                    : transaction.type === 'WITHDRAW' || transaction.type === 'TRADE_BUY'
                    ? 'text-red-600'
                    : 'text-gray-900'
                }`}>
                  {transaction.type === 'DEPOSIT' || transaction.type === 'TRADE_SELL' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
                {getStatusBadge(transaction.status)}
                
                {/* Confirm Button for Demo */}
                {transaction.status === 'pending' && transaction.provider === 'demo' && (
                  <button
                    onClick={() => handleConfirmTransaction(transaction.id)}
                    disabled={confirming === transaction.id}
                    className="mt-2 w-full text-xs bg-let-blue text-white py-1 px-2 rounded hover:bg-let-blue/90 transition-colors disabled:opacity-50"
                  >
                    {confirming === transaction.id ? 'Confirming...' : 'Confirm (Demo)'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Last Refresh Time */}
      {lastRefresh && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  )
}

export default WalletTransactions



