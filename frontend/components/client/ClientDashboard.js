import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { apiGet, apiPost } from '../../lib/api'
import WalletCard from '../wallet/WalletCard'

export default function ClientDashboard() {
  const router = useRouter()
  const [wallet, setWallet] = useState(null)
  const [projects, setProjects] = useState([])
  const [myInvestments, setMyInvestments] = useState([])
  const [systemSettings, setSystemSettings] = useState({
    systemDown: false,
    systemMessage: '',
    mpesaPaybill: '',
    mpesaAccountNumber: '',
    mpesaAccountName: '',
    mpesaNumber: '',
    mpesaName: ''
  })
  const [loading, setLoading] = useState(true)

  // Project investment state
  const [selectedProject, setSelectedProject] = useState(null)
  const [investAmount, setInvestAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('wallet')
  const [phone, setPhone] = useState('')
  const [investing, setInvesting] = useState(false)
  const [investError, setInvestError] = useState('')

  // Polling state
  const [pollingRef, setPollingRef] = useState(null)
  const [pollingProjectTitle, setPollingProjectTitle] = useState('')
  const [pollingAmount, setPollingAmount] = useState('')
  const [checkingPoll, setCheckingPoll] = useState(false)
  const pollIntervalRef = useRef(null)

  // Fetch all dashboard data
  const loadDashboardData = async () => {
    try {
      const [walletRes, systemRes, projectsRes, investmentsRes] = await Promise.all([
        apiGet('/api/wallet').catch(() => null),
        apiGet('/api/system/settings').catch(() => null),
        apiGet('/api/catalog/projects').catch(() => null),
        apiGet('/api/invest/my-investments').catch(() => null)
      ])

      if (walletRes?.success) setWallet(walletRes.wallet)
      if (systemRes?.success) setSystemSettings(systemRes)
      if (projectsRes?.success || projectsRes?.data) {
        const rawProj = projectsRes.success ? projectsRes.projects : projectsRes.data
        setProjects(rawProj || [])
      }
      if (investmentsRes?.success) setMyInvestments(investmentsRes.investments)
    } catch (err) {
      console.error('Error loading client dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Poll for M-Pesa investment status if active
  useEffect(() => {
    if (pollingRef) {
      pollIntervalRef.current = setInterval(() => {
        checkPollStatus(pollingRef)
      }, 3000)
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [pollingRef])

  const checkPollStatus = async (reference) => {
    if (checkingPoll) return
    setCheckingPoll(true)
    try {
      const res = await apiGet(`/api/wallet/status/${reference}`)
      if (res.success && res.transaction) {
        if (res.transaction.status === 'completed') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
          setPollingRef(null)
          router.push(`/invest/success?project=${encodeURIComponent(pollingProjectTitle)}&amount=${pollingAmount}`)
        } else if (res.transaction.status === 'failed') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
          setPollingRef(null)
          alert('Investment payment failed. Please try again.')
        }
      }
    } catch (err) {
      console.error('Error polling transaction status:', err)
    } finally {
      setCheckingPoll(false)
    }
  }

  const handleInvestSubmit = async (e) => {
    e.preventDefault()
    setInvestError('')
    
    const amount = parseFloat(investAmount)
    if (!amount || amount <= 0) {
      setInvestError('Please enter a valid investment amount.')
      return
    }

    if (paymentMethod === 'wallet' && wallet && parseFloat(wallet.balance) < amount) {
      setInvestError('Insufficient wallet balance.')
      return
    }

    if (paymentMethod === 'mpesa' && !phone) {
      setInvestError('Phone number is required for M-Pesa payments.')
      return
    }

    setInvesting(true)
    try {
      const res = await apiPost('/api/invest/project', {
        projectId: selectedProject._id,
        amount,
        paymentMethod,
        phone: paymentMethod === 'mpesa' ? phone : undefined
      })

      if (res.success) {
        if (res.status === 'pending') {
          // Trigger STK push polling
          setPollingRef(res.reference)
          setPollingProjectTitle(selectedProject.title)
          setPollingAmount(amount.toString())
          setSelectedProject(null)
        } else {
          // Instantly completed from wallet balance
          setSelectedProject(null)
          router.push(`/invest/success?project=${encodeURIComponent(selectedProject.title)}&amount=${amount}`)
        }
      }
    } catch (err) {
      setInvestError(err.message || 'Investment failed. Please try again.')
    } finally {
      setInvesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* System Down Message */}
      {systemSettings.systemDown && (
        <div className="bg-rose-950/40 border border-rose-800/80 text-rose-200 p-5 rounded-2xl flex items-start gap-4 shadow-xl backdrop-blur-md animate-pulse">
          <span className="text-2xl mt-0.5">⚠️</span>
          <div>
            <h4 className="font-bold text-rose-100">System Down for Maintenance</h4>
            <p className="text-sm mt-1 text-rose-300/95 leading-relaxed">{systemSettings.systemMessage}</p>
          </div>
        </div>
      )}

      {/* Hero & Wallet row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[30%] h-[100%] bg-emerald-500/5 rounded-full blur-[80px]"></div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
              Grow Your Wealth
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              Secure institutional-grade asset investments with fixed yields. Access projects powered by Kingstone smart capital.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3.5 py-1.5 rounded-full font-semibold">
                🔒 256-bit Encrypted
              </span>
              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs px-3.5 py-1.5 rounded-full font-semibold">
                📈 5.0% Compound Yield
              </span>
            </div>
          </div>
        </div>

        <div>
          {/* Render real WalletCard */}
          <WalletCard 
            wallet={wallet} 
            systemDown={systemSettings.systemDown} 
            onUpdate={(w) => setWallet(w)} 
          />
        </div>
      </div>

      {/* Catalog Projects */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Available Projects</h2>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            {projects.length} opportunities
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center text-slate-400">
            No investment opportunities available at the moment. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div 
                key={project._id} 
                className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden relative bg-slate-950">
                  {project.image ? (
                    <img 
                      src={project.image} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-950">
                      <span className="text-4xl">🏗️</span>
                    </div>
                  )}
                  <span className="absolute top-4 left-4 bg-emerald-500 text-slate-950 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                    {project.category || 'Investment'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition">
                      {project.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
                      📍 {project.location || 'Global'}
                    </p>
                    <p className="text-slate-400 text-sm mt-3.5 line-clamp-2 leading-relaxed">
                      {project.description || 'Secure institutional-grade construction asset investment with high compound growth.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Project Value</p>
                        <p className="text-base font-bold text-slate-200 mt-0.5">
                          ${Number(project.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Growth Rate</p>
                        <p className="text-base font-bold text-emerald-400 mt-0.5">5% p.a.</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProject(project)
                        setInvestAmount('')
                        setInvestError('')
                        setPhone('')
                      }}
                      disabled={systemSettings.systemDown}
                      className="w-full bg-slate-800 border border-slate-700 text-slate-100 hover:bg-emerald-500 hover:text-slate-950 hover:border-transparent transition-all duration-300 py-2.5 px-4 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Invest Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Investments */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">My Active Portfolio</h2>

        {myInvestments.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center text-slate-500">
            You haven't made any investments yet. Choose a project above to start growing your assets.
          </div>
        ) : (
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Project Name</th>
                    <th className="py-4 px-6">Reference</th>
                    <th className="py-4 px-6">Capital Invested</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6">Invested Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 text-sm">
                  {myInvestments.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-900/30 transition">
                      <td className="py-4 px-6 font-semibold text-slate-100">{inv.projectTitle}</td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">{inv.reference}</td>
                      <td className="py-4 px-6 font-semibold text-emerald-400">
                        ${Number(inv.amount || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          inv.status === 'active' 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                            : inv.status === 'failed'
                            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                            : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                        }`}>
                          {inv.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {new Date(inv.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Investment Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/20">
              <h3 className="text-xl font-bold text-slate-100">Invest in Opportunity</h3>
              <button 
                onClick={() => setSelectedProject(null)}
                className="text-slate-400 hover:text-slate-100 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInvestSubmit} className="p-6 space-y-6">
              {/* Project Card Preview */}
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80">
                <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded uppercase">
                  {selectedProject.category || 'Real Estate'}
                </span>
                <h4 className="text-lg font-bold text-slate-100 mt-1">{selectedProject.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">📍 {selectedProject.location || 'Global'}</p>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Investment Capital (USD)
                </label>
                <input
                  type="number"
                  min="10"
                  step="0.01"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  placeholder="Enter amount (e.g. 500)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">Minimum contribution: $10. Fixed rate: 5% yearly compound.</p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                    paymentMethod === 'wallet' 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="wallet"
                      checked={paymentMethod === 'wallet'}
                      onChange={() => setPaymentMethod('wallet')}
                      className="sr-only"
                    />
                    <span className="text-xl mb-1">💼</span>
                    <span className="text-sm font-semibold text-slate-200">Wallet</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Bal: ${wallet ? Number(wallet.balance).toLocaleString() : '0'}
                    </span>
                  </label>

                  <label className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                    paymentMethod === 'mpesa' 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mpesa"
                      checked={paymentMethod === 'mpesa'}
                      onChange={() => setPaymentMethod('mpesa')}
                      className="sr-only"
                    />
                    <span className="text-xl mb-1">📱</span>
                    <span className="text-sm font-semibold text-slate-200">M-Pesa</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">STK Push</span>
                  </label>
                </div>
              </div>

              {/* M-Pesa details / Phone */}
              {paymentMethod === 'mpesa' && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254712345678"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-emerald-500 transition duration-200 text-sm"
                      required
                    />
                  </div>

                  <div className="p-3 bg-blue-950/20 border border-blue-800/40 text-blue-200 text-xs rounded-2xl leading-relaxed shadow-sm">
                    <div className="font-semibold text-blue-300 mb-1 flex items-center gap-1">
                      <span>💡</span> Paybill Details
                    </div>
                    <div>Paybill Number: <span className="font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded select-all">{systemSettings.mpesaPaybill || systemSettings.mpesaNumber || '400200'}</span></div>
                    <div className="mt-0.5">Account Number: <span className="font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded select-all">{systemSettings.mpesaAccountNumber || 'KINGSTONE'}</span></div>
                    <div className="mt-0.5">Account Name: <span className="font-semibold">{systemSettings.mpesaAccountName || systemSettings.mpesaName || 'Kingstone Investments'}</span></div>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {investError && (
                <div className="bg-rose-950/50 border border-rose-800/60 text-rose-200 px-4 py-3 rounded-2xl text-xs flex items-start gap-2 animate-fadeIn">
                  <span className="mt-0.5">⚠️</span>
                  <span>{investError}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={investing}
                className="w-full bg-emerald-500 text-slate-950 font-bold py-3.5 px-4 rounded-2xl hover:bg-emerald-400 transition duration-200 shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {investing ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  `Confirm Investment of $${investAmount || '0'}`
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Polling Spinner Overlay */}
      {pollingRef && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6 animate-fadeIn">
            {/* Spinning Glow Circle */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
              <span className="text-3xl">📱</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-100">Awaiting M-Pesa Authorization</h3>
              <p className="text-slate-400 text-sm">
                We've sent an M-Pesa STK push request to your phone. Please check your screen and enter your PIN.
              </p>
            </div>

            {/* Live details check */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-left space-y-3 font-medium text-sm text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Project:</span>
                <span className="text-slate-100 font-semibold">{pollingProjectTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Capital:</span>
                <span className="text-emerald-400 font-semibold">${pollingAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reference:</span>
                <span className="font-mono text-xs text-slate-400">{pollingRef}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-yellow-500 text-xs">
                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping"></span>
                <span>Verifying payment with Safaricom network...</span>
              </div>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
              This window will automatically direct you to your investment success confirmation once the payment completes.
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  )
}
