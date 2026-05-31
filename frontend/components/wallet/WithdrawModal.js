import { useState, useEffect, useRef } from 'react'
import { apiGet, apiPost } from '../../lib/api'

const WithdrawModal = ({ isOpen, onClose, onSuccess, currentBalance = 0 }) => {
  const safeBalance = Number(currentBalance || 0);
  const [amount, setAmount] = useState('')
  const [provider, setProvider] = useState('bank')
  const [accountNumber, setAccountNumber] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [transactionData, setTransactionData] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const pollIntervalRef = useRef(null)


  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  // Start polling when withdrawal is pending
  useEffect(() => {
    if (isPending && transactionData?.transaction?.id) {
      pollIntervalRef.current = setInterval(() => {
        checkTransactionStatus(transactionData.transaction.id)
      }, 3000)

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
        }
      }
    }
  }, [isPending, transactionData?.transaction?.id])

  const checkTransactionStatus = async (transactionId) => {
    try {
      console.log('Checking withdrawal transaction status for:', transactionId)
      const data = await apiGet('/api/wallet/transactions?status=pending')
      
      if (data.success && data.transactions) {
        const tx = data.transactions.find(t => t.id === transactionId)
        if (tx) {
          if (tx.status === 'completed') {
            setIsPending(false)
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current)
            }
            
            // Fetch updated wallet
            const walletData = await apiGet('/api/wallet')
            
            if (walletData.success && onSuccess) {
              onSuccess(walletData.wallet)
            }
            
            setTransactionData({
              ...transactionData,
              transaction: tx,
              message: 'Withdrawal confirmed! Funds have been transferred.'
            })
          } else if (tx.status === 'failed') {
            setIsPending(false)
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current)
            }
            setError('Withdrawal failed. Please try again.')
            setSuccess(false)
          }
        }
      }
    } catch (err) {
      console.error('Error checking transaction status:', err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const withdrawAmount = parseFloat(amount)

    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (withdrawAmount < 10) {
      setError('Minimum withdrawal amount is $10')
      return
    }

    if (withdrawAmount > safeBalance) {
      setError('Insufficient balance')
      return
    }

    setIsLoading(true)

    try {
      const data = await apiPost('/api/wallet/withdraw', {
        amount: withdrawAmount,
        provider,
        accountNumber: accountNumber || undefined,
        bankCode: bankCode || undefined,
        phone: phone || undefined
      })

      setTransactionData(data)
      setSuccess(true)
      
      if (data.transaction?.status === 'pending') {
        setIsPending(true)
      } else {
        setIsPending(false)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setAccountNumber('')
    setBankCode('')
    setPhone('')
    setError('')
    setSuccess(false)
    setTransactionData(null)
    setIsPending(false)
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }
    onClose()
  }

  const handleDone = () => {
    if (transactionData?.transaction?.status === 'completed') {
      const refreshAndClose = async () => {
        try {
          const data = await apiGet('/api/wallet')
          if (data.success && onSuccess) {
            onSuccess(data.wallet)
          }
        } catch (err) {
          console.error('Error refreshing wallet:', err)
        }
        handleClose()
      }
      refreshAndClose()
    } else {
      handleClose()
    }
  }

  const handleQuickAmount = (value) => {
    setAmount(value.toString())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md w-full">
          {/* Header */}
          <div className="bg-let-green px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Withdraw Funds</h3>
              <button 
                onClick={handleClose}
                className="text-white hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Current Balance Display */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Available Balance</span>
                <span className="text-lg font-bold text-let-blue">
                  $${safeBalance.toFixed(2)}
                </span>

              </div>
            </div>

            {safeBalance <= 0 ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">
                    You can't withdraw anything because your available balance is $0.00.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full bg-let-green text-white py-3 px-4 rounded-lg font-medium hover:bg-let-green/90 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : !success ? (
              <form onSubmit={handleSubmit}>
                {/* Quick Amount Buttons */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((pct) => {
                      const value = Math.floor(safeBalance * (pct / 100))

                      return (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handleQuickAmount(value)}
                          disabled={value < 10}
                          className="py-1.5 px-2 text-sm border border-gray-300 rounded-lg hover:bg-let-green/5 hover:border-let-green disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pct}%
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="0.01"
                    max={safeBalance}

                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-let-green focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum: $10</p>
                </div>

                {/* Provider Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`border rounded-lg p-3 cursor-pointer transition-colors ${provider === 'bank' ? 'border-let-green bg-let-green/5' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="provider"
                        value="bank"
                        checked={provider === 'bank'}
                        onChange={(e) => setProvider(e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-lg mb-1">🏦</div>
                        <div className="text-sm font-medium">Bank Transfer</div>
                        <div className="text-xs text-gray-500">1-3 days</div>
                      </div>
                    </label>
                    <label className={`border rounded-lg p-3 cursor-pointer transition-colors ${provider === 'mpesa' ? 'border-let-green bg-let-green/5' : 'border-gray-300'}`}>
                      <input
                        type="radio"
                        name="provider"
                        value="mpesa"
                        checked={provider === 'mpesa'}
                        onChange={(e) => setProvider(e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <div className="text-lg mb-1">📱</div>
                        <div className="text-sm font-medium">M-Pesa</div>
                        <div className="text-xs text-gray-500">Instant</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Bank Details */}
                {provider === 'bank' && (
                  <div className="mb-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter account number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-let-green focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Code (SWIFT/ABA)
                      </label>
                      <input
                        type="text"
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        placeholder="e.g., CHASEUS33"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-let-green focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* Phone for M-Pesa */}
                {provider === 'mpesa' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254712345678"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-let-green focus:border-transparent"
                    />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-let-green text-white py-3 px-4 rounded-lg font-medium hover:bg-let-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Withdraw $${amount || '0'}`
                  )}
                </button>
              </form>
            ) : (
              // Success State
              <div className="text-center">
                {/* Pending Animation */}
                {isPending ? (
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-yellow-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {isPending 
                    ? 'Withdrawal Request Submitted' 
                    : transactionData?.transaction?.status === 'completed'
                    ? 'Withdrawal Complete!'
                    : 'Withdrawal Request Submitted'}
                </h4>
                
                <p className="text-gray-600 mb-4">
                  {transactionData?.message || transactionData?.instructions || 'Your withdrawal is being processed.'}
                </p>

                {/* Pending Status Indicator */}
                {isPending && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-yellow-700">Processing withdrawal...</span>
                    </div>
                    <p className="text-xs text-yellow-600">
                      Your balance will be updated once the withdrawal is confirmed.
                      <br />This typically takes 1-3 business days.
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Reference:</span>
                    <span className="font-mono text-sm">{transactionData?.transaction?.reference}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Amount:</span>
                <span className="font-semibold">${Number(amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      transactionData?.transaction?.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : isPending
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isPending ? 'PENDING' : transactionData?.transaction?.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {isPending && (
                  <p className="text-xs text-gray-500 mb-4">
                    This window will auto-update when withdrawal is processed.
                  </p>
                )}

                <button
                  onClick={handleDone}
                  className="w-full bg-let-green text-white py-3 px-4 rounded-lg font-medium hover:bg-let-green/90 transition-colors"
                >
                  {isPending ? 'Close & Continue' : 'Done'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WithdrawModal



