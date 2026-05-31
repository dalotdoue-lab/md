import { useState, useEffect, useRef } from 'react'
import { apiGet, apiPost } from '../../lib/api'

const fallbackPaymentDetails = {
  paybill: '400200',
  accountNumber: 'KINGSTONE',
  accountName: 'Kingstone Investments'
}

const paymentMethods = [
  {
    value: 'mpesa',
    title: 'M-Pesa Paybill',
    subtitle: 'Best for Kenya payments'
  },
  {
    value: 'bank',
    title: 'Bank Transfer',
    subtitle: 'Submit for admin review'
  }
]

const DepositModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('')
  const [provider, setProvider] = useState('mpesa')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [transactionData, setTransactionData] = useState(null)
  const [isPending, setIsPending] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [copiedField, setCopiedField] = useState('')
  const [paymentDetails, setPaymentDetails] = useState(fallbackPaymentDetails)
  const pollIntervalRef = useRef(null)

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiGet('/api/system/settings')
        if (data?.success) {
          setPaymentDetails({
            paybill: data.mpesaPaybill || data.mpesaNumber || fallbackPaymentDetails.paybill,
            accountNumber: data.mpesaAccountNumber || fallbackPaymentDetails.accountNumber,
            accountName: data.mpesaAccountName || data.mpesaName || fallbackPaymentDetails.accountName
          })
        }
      } catch (err) {
        console.error('Error fetching system settings:', err)
      }
    }

    if (isOpen) fetchSettings()
  }, [isOpen])

  useEffect(() => {
    if (!isPending || !transactionData?.transaction?.reference) return undefined

    const refCode = transactionData.transaction.reference
    pollIntervalRef.current = setInterval(() => {
      checkTransactionStatus(refCode)
    }, 3000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [isPending, transactionData?.transaction?.reference])

  const formatAmount = (value) => {
    const numeric = Number(value || 0)
    return numeric.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })
  }

  const checkTransactionStatus = async (reference) => {
    if (checkingStatus) return

    setCheckingStatus(true)
    try {
      const data = await apiGet(`/api/wallet/status/${reference}`)

      if (data.success && data.transaction) {
        const tx = data.transaction

        if (tx.status === 'completed') {
          setIsPending(false)
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)

          const walletData = await apiGet('/api/wallet')
          if (walletData.success && onSuccess) onSuccess(walletData.wallet)

          setTransactionData((current) => ({
            ...(current || {}),
            transaction: tx,
            message: 'Payment confirmed. Your wallet balance has been updated.'
          }))
        } else if (tx.status === 'failed') {
          setIsPending(false)
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
          setError('Payment was rejected or failed. Please try again.')
          setSuccess(false)
        }
      }
    } catch (err) {
      console.error('Error checking transaction status:', err.message)
    } finally {
      setCheckingStatus(false)
    }
  }

  const copyToClipboard = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(label)
      window.setTimeout(() => setCopiedField(''), 1800)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const depositAmount = parseFloat(amount)

    if (!depositAmount || depositAmount <= 0) {
      setError('Please enter a valid amount.')
      return
    }

    if (depositAmount < 10) {
      setError('Minimum deposit amount is $10.')
      return
    }

    setIsLoading(true)

    try {
      const data = await apiPost('/api/wallet/deposit', {
        amount: depositAmount,
        provider,
        phone: phone || undefined,
        description: `Deposit request via ${provider}`
      })

      const normalizedData = {
        message: data.message || 'Deposit request submitted. Admin will approve it after payment is confirmed.',
        data: data.data,
        transaction: {
          reference: data.data?.reference || data.reference,
          status: 'pending'
        }
      }

      setTransactionData(normalizedData)
      setIsPending(true)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
      setSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setPhone('')
    setError('')
    setSuccess(false)
    setTransactionData(null)
    setIsPending(false)
    setCopiedField('')
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    onClose()
  }

  const handleDone = async () => {
    try {
      const data = await apiGet('/api/wallet')
      if (data.success && onSuccess) onSuccess(data.wallet)
    } catch (err) {
      console.error('Error refreshing wallet:', err)
    }
    handleClose()
  }

  if (!isOpen) return null

  const paymentRows = [
    ['Paybill', paymentDetails.paybill],
    ['Account number', paymentDetails.accountNumber],
    ['Account name', paymentDetails.accountName]
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <button
          type="button"
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          aria-label="Close deposit dialog"
          onClick={handleClose}
        />

        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="bg-slate-950 px-6 py-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Wallet funding</p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight">Deposit funds</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Send payment using the details below, then submit the deposit request for approval.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-slate-50 p-6">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2m0-8c1.657 0 3 .672 3 1.5M12 8V6m0 10v2m0-2c-1.657 0-3-.672-3-1.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">M-Pesa details</p>
                    <p className="text-xs text-slate-500">Editable by admin in settings</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {paymentRows.map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <span className="min-w-0 break-words font-mono text-sm font-bold text-slate-950">{value}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(label, value)}
                          className="shrink-0 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                        >
                          {copiedField === label ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
                Use the exact account number above so the admin can match your payment to your wallet request.
              </div>
            </div>

            <div className="p-6">
              {!success ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Amount (USD)</label>
                    <div className="mt-2 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100">
                      <input
                        type="number"
                        min="10"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full border-0 p-0 text-2xl font-bold text-slate-950 outline-none placeholder:text-slate-300 focus:ring-0"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Minimum deposit: $10</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700">Payment method</label>
                    <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.value}
                          className={`cursor-pointer rounded-xl border p-4 transition ${
                            provider === method.value
                              ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="provider"
                            value={method.value}
                            checked={provider === method.value}
                            onChange={(e) => setProvider(e.target.value)}
                            className="sr-only"
                          />
                          <span className="block text-sm font-bold text-slate-900">{method.title}</span>
                          <span className="mt-1 block text-xs text-slate-500">{method.subtitle}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {provider === 'mpesa' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">M-Pesa phone number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254712345678"
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                      <p className="mt-1 text-xs text-slate-500">Optional, but useful for payment matching.</p>
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      `Submit deposit request ${amount ? formatAmount(amount) : ''}`
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-5 text-center">
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isPending ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isPending ? (
                      <svg className="h-8 w-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-slate-950">
                      {isPending ? 'Deposit request submitted' : 'Deposit confirmed'}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {transactionData?.message || 'Your deposit is being processed.'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                      <span className="text-sm text-slate-500">Reference</span>
                      <span className="text-right font-mono text-xs font-bold text-slate-950">{transactionData?.transaction?.reference}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-200 py-3">
                      <span className="text-sm text-slate-500">Amount</span>
                      <span className="font-bold text-slate-950">{formatAmount(amount)}</span>
                    </div>
                    <div className="flex justify-between gap-4 pt-3">
                      <span className="text-sm text-slate-500">Status</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isPending ? 'PENDING APPROVAL' : 'COMPLETED'}
                      </span>
                    </div>
                  </div>

                  {isPending && (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
                      This will update automatically if the admin approves while this window is open.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleDone}
                    className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepositModal
