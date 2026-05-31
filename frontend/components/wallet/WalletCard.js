import { useState, useEffect } from 'react'
import { apiGet } from '../../lib/api'
import DepositModal from './DepositModal'
import WithdrawModal from './WithdrawModal'

const WalletCard = ({ wallet: initialWallet, onUpdate, isLoading: initialLoading, systemDown = false }) => {
  const [wallet, setWallet] = useState(initialWallet || {})
  const [isLoading, setIsLoading] = useState(initialLoading !== undefined ? initialLoading : true)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showWithdrawWarning, setShowWithdrawWarning] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Update wallet when props change
  useEffect(() => {
    if (initialWallet) {
      setWallet(initialWallet)
    }
    if (initialLoading !== undefined) {
      setIsLoading(initialLoading)
    }
  }, [initialWallet, initialLoading])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet?.currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0)
  }

  // Fetch latest wallet data
  const refreshWallet = async () => {
    if (systemDown) return
    setRefreshing(true)
    try {
      const data = await apiGet('/api/wallet')
      if (data?.success) {
        setWallet(data.wallet)
        if (onUpdate) {
          onUpdate(data.wallet)
        }
      }
    } catch (error) {
      console.error('Failed to refresh wallet:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleDepositSuccess = (newWalletData) => {
    if (newWalletData) {
      setWallet(newWalletData)
      if (onUpdate) {
        onUpdate(newWalletData)
      }
    }
    setShowDepositModal(false)
  }

  const handleWithdrawSuccess = (newWalletData) => {
    if (newWalletData) {
      setWallet(newWalletData)
      if (onUpdate) {
        onUpdate(newWalletData)
      }
    }
    setShowWithdrawModal(false)
  }

  const hasPendingBalance = wallet?.pendingBalance > 0
  const canWithdraw = Number(wallet?.balance || 0) > 0

  useEffect(() => {
    if (canWithdraw) setShowWithdrawWarning(false)
  }, [canWithdraw])

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Wallet Balance</h3>
            <p className="text-sm text-gray-500">Available funds for investment</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshWallet}
              disabled={refreshing || systemDown}
              className="w-10 h-10 rounded-xl bg-let-blue/10 flex items-center justify-center hover:bg-let-blue/20 transition-colors disabled:opacity-50"
              title="Refresh balance"
            >
              <svg 
                className={`w-5 h-5 text-let-blue ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <div className="w-12 h-12 rounded-xl bg-let-blue/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-let-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="mb-2">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-3xl font-bold text-let-blue">
            {isLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              formatCurrency(wallet?.balance)
            )}
          </p>
        </div>

        {/* Pending Balance */}
        {hasPendingBalance && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-lg font-semibold text-yellow-800">
                  {formatCurrency(wallet?.pendingBalance)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Awaiting payment confirmation
            </p>
          </div>
        )}

        {/* Total Balance (if pending exists) */}
        {hasPendingBalance && (
          <div className="mb-4 pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">Total (including pending)</p>
            <p className="text-xl font-semibold text-gray-700">
              {formatCurrency((wallet?.balance || 0) + (wallet?.pendingBalance || 0))}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setShowDepositModal(true)}
            disabled={isLoading || systemDown}
            className="flex-1 bg-let-blue text-white py-2.5 px-4 rounded-lg font-medium hover:bg-let-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Deposit
          </button>
          <button
            onClick={() => {
              if (canWithdraw) {
                setShowWithdrawWarning(false)
                setShowWithdrawModal(true)
              } else {
                setShowWithdrawWarning(true)
              }
            }}
            disabled={isLoading || systemDown}
            className="flex-1 bg-let-green text-white py-2.5 px-4 rounded-lg font-medium hover:bg-let-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw
          </button>
        </div>

        {showWithdrawWarning && !isLoading && !canWithdraw && (
          <div className="mt-3 rounded-lg border border-red-100 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-700">
              You can't withdraw anything because your available balance is $0.00.
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure wallet - M-Pesa ready</span>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={handleDepositSuccess}
        currentBalance={wallet?.balance || 0}
        pendingBalance={wallet?.pendingBalance || 0}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={handleWithdrawSuccess}
        currentBalance={wallet?.balance || 0}
      />
    </>
  )
}

export default WalletCard



