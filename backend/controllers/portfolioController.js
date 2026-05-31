/**
 * Portfolio Controller - FINAL STABLE VERSION
 */

const { companies, investments } = require('../data/mockData');
const userRepository = require('../repositories/userRepository');
const walletService = require('../services/walletService');
const { serializePrisma } = require('../utils/serializePrisma');

// =====================================================
// GET PORTFOLIO
// =====================================================
exports.getPortfolio = async (req, res) => {
  try {
    const userId = req.user?.id;

    // ✅ AUTH FIX
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized"
      });
    }

    const userData = await userRepository.findById(userId);

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // ✅ SAFE WALLET CREATION
    let wallet = await walletService.findByUserId(userId);
    if (!wallet) {
      wallet = await walletService.create(userId, 'USD');
    }

    const userInvestments = Array.from(investments.values())
      .filter(inv => inv.user_id === userId);

    let totalInvested = 0;
    let currentPortfolioValue = 0;
    const holdings = [];

    for (const inv of userInvestments) {
      const company = companies.find(c => c.id === inv.company_id);
      if (!company) continue;

      const investedAmount = inv.shares * inv.buy_price;
      const currentValue = inv.shares * company.current_price;
      const gainLoss = currentValue - investedAmount;

      // ✅ SAFE DIVISION
      const gainLossPercent = investedAmount > 0
        ? (gainLoss / investedAmount) * 100
        : 0;

      totalInvested += investedAmount;
      currentPortfolioValue += currentValue;

      holdings.push({
        id: inv.id,
        company: {
          id: company.id,
          name: company.name,
          ticker: company.symbol,
          sector: company.sector,
          region: company.region,
          country: company.country,
          currentPrice: company.current_price,
        },
        shares: inv.shares,
        averagePrice: inv.buy_price,
        investedAmount,
        currentValue,
        gainLoss,
        gainLossPercent: Number(gainLossPercent.toFixed(2)),
        purchaseDate: inv.created_at,
      });
    }

    const totalGainLoss = currentPortfolioValue - totalInvested;

    const totalGainLossPercent = totalInvested > 0
      ? Number(((totalGainLoss / totalInvested) * 100).toFixed(2))
      : 0;

    res.json(serializePrisma({
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        balance: Number(wallet.balance || 0),
        country: userData.country,
      },
      portfolio: {
        totalInvested: Number(totalInvested),
        currentValue: Number(currentPortfolioValue),
        cashBalance: Number(wallet.balance || 0),
        totalGainLoss: Number(totalGainLoss),
        totalGainLossPercent,
        totalPortfolioValue:
          Number(currentPortfolioValue) + Number(wallet.balance || 0),
      },
      holdings,
    }));

  } catch (error) {
    console.error("PORTFOLIO ERROR:", error);

    res.status(500).json({
      success: false,
      error: "Failed to load portfolio",
      message: error.message
    });
  }
};