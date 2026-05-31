import { useState, useEffect } from 'react';

const InvestmentFlow = ({
  sectors,
  regions,
  companies,
  selectedSector,
  selectedRegion,
  selectedCompany,
  onSectorChange,
  onRegionChange,
  onSelectCompany,
  userId
}) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [userBalance, setUserBalance] = useState(0);

  // Format currency
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Fetch real wallet balance
  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet');
      const data = await res.json();
      if (data.success && data.wallet) {
        setUserBalance(data.wallet.availableBalance || 0);
      } else {
        setUserBalance(0);
      }
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  // Calculate number of shares
  const calculateShares = () => {
    if (!selectedCompany || !investmentAmount) return 0;
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) return 0;
    const price = selectedCompany.current_price || selectedCompany.currentPrice;
    if (!price || price <= 0) return 0;
    return Math.floor(amount / price);
  };

  const handleInvest = async () => {
    if (!selectedCompany || !investmentAmount) {
      setError('Please select a company and enter an amount');
      return;
    }

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amount > userBalance) {
      setError('Insufficient balance');
      return;
    }

    const price = selectedCompany.current_price || selectedCompany.currentPrice;
    if (!price || price <= 0) {
      setError('This company does not have a valid share price yet');
      return;
    }

    if (amount < price) {
      setError(`Minimum investment is ${formatCurrency(price)}`);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/investments/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId: selectedCompany.id, amount })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Investment failed');

      setSuccess(`Investment of ${formatCurrency(amount)} in ${selectedCompany.name} successful!`);
      setInvestmentAmount('');
      // Refresh wallet balance
      await fetchWallet();
    } catch (err) {
      setError(err.message || 'Investment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPrice = selectedCompany?.current_price || selectedCompany?.currentPrice || 0;
  const shares = calculateShares();
  const totalCost = shares * currentPrice;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-heading font-bold text-let-blue mb-6">
        Step 5: Confirm Investment
      </h3>

      {/* Step 1-4 Summary */}
      <div className="mb-6 p-4 bg-let-light rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Sector:</span>
            <span className="ml-2 font-semibold text-let-blue">{selectedSector || 'Not selected'}</span>
          </div>
          <div>
            <span className="text-gray-500">Region:</span>
            <span className="ml-2 font-semibold text-let-blue">{selectedRegion || 'Not selected'}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-gray-500">Company:</span>
            <span className="ml-2 font-semibold text-let-blue">
              {selectedCompany ? `${selectedCompany.name} (${selectedCompany.symbol})` : 'Not selected'}
            </span>
          </div>
        </div>
      </div>

      {selectedCompany && (
        <>
          {/* Current Price & Balance */}
          <div className="mb-6 p-4 bg-let-blue/5 rounded-lg border border-let-blue/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Current Price</p>
                <p className="text-2xl font-bold text-let-blue">
                  {currentPrice > 0 ? formatCurrency(currentPrice) : 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-xl font-bold text-let-green">{formatCurrency(userBalance)}</p>
              </div>
            </div>
          </div>

          {/* Investment Amount Input */}
          <div className="mb-6">
            <label className="label">Investment Amount (USD)</label>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              placeholder={`Enter amount (Min: ${formatCurrency(currentPrice)})`}
              className="input-field"
              min={currentPrice}
              step={currentPrice}
            />
          </div>

          {/* Investment Summary */}
          {shares > 0 && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-3">Investment Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Shares to Purchase:</span>
                  <span className="font-bold text-green-800">{shares} shares</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per Share:</span>
                  <span className="font-semibold">{currentPrice > 0 ? formatCurrency(currentPrice) : 'N/A'}</span>
                </div>
                <div className="flex justify-between border-t border-green-200 pt-2">
                  <span className="text-gray-600 font-semibold">Total Cost:</span>
                  <span className="font-bold text-green-800">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span className="font-semibold">Remaining Balance:</span>
                  <span className="font-bold">{formatCurrency(userBalance - totalCost)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Invest Button */}
          <button
            onClick={handleInvest}
            disabled={shares <= 0 || isLoading}
            className={`w-full btn-primary py-4 text-lg ${shares <= 0 || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : `Invest ${formatCurrency(totalCost)}`}
          </button>
        </>
      )}
    </div>
  );
};

export default InvestmentFlow;