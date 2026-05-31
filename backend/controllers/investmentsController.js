/**
 * Investments Controller
 * Let Investments - Buy/Sell using real wallets & database
 */

const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');
const walletService = require('../services/walletService');

// Generate unique reference for investment transactions
const generateReference = (type) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${type}-${timestamp}-${random}`;
};

// =====================================================
// Buy shares
// =====================================================
exports.buy = async (req, res) => {
  try {
    const { companyId, amount } = req.body;
    const userId = req.user?.id;

    if (!userId)
      return res.status(400).json({ error: 'User not authenticated' });

    if (!companyId || !amount)
      return res.status(400).json({
        error: 'companyId and valid amount are required',
      });

    const investmentAmount = new Prisma.Decimal(amount);

    if (investmentAmount.lte(0))
      return res.status(400).json({
        error: 'Amount must be greater than zero',
      });

    // 1. Check available balance
    const availableBalance = await walletService.getAvailableBalance(userId);

    if (availableBalance.lt(investmentAmount)) {
      return res.status(400).json({
        error: 'Insufficient wallet balance',
      });
    }

    // 2. Get company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company)
      return res.status(404).json({ error: 'Company not found' });

    const currentPrice = new Prisma.Decimal(company.current_price);

    if (currentPrice.lte(0)) {
      return res.status(400).json({
        error: 'Company has no valid share price',
      });
    }

    const shares = investmentAmount.div(currentPrice).floor();

    if (shares.lte(0)) {
      return res.status(400).json({
        error: `Minimum investment is ${currentPrice} to buy at least 1 share`,
      });
    }

    const totalCost = shares.mul(currentPrice);

    const reference = generateReference('INV-BUY');

    // 3. Lock funds
    await walletService.lockFunds(userId, totalCost);

    // 4. Update investment
    const investment = await prisma.investment.upsert({
      where: {
        userId_companyId: { userId, companyId },
      },
      update: {
        shares: { increment: Number(shares) },
        investment_amount: { increment: totalCost },
        buy_price: currentPrice,
        updated_at: new Date(),
      },
      create: {
        userId,
        companyId,
        shares: Number(shares),
        buy_price: currentPrice,
        investment_amount: totalCost,
        firstPurchasedAt: new Date(),
        lastPurchasedAt: new Date(),
      },
    });

    // 5. Complete transaction
    await walletService.completeTransaction(userId, totalCost);

    // 6. Get wallet
    const updatedWallet = await walletService.findByUserId(userId);

    res.json({
      success: true,
      message: 'Investment successful',
      investment: {
        companyId,
        companyName: company.name,
        symbol: company.symbol,
        shares: Number(shares),
        buyPrice: currentPrice,
        totalCost,
      },
      sharesPurchased: Number(shares),
      totalCost,
      walletBalance: updatedWallet.balance,
    });

  } catch (error) {
    console.error('Buy investment error:', error);
    res.status(500).json({
      error: 'Investment failed',
      message: error.message,
    });
  }
};

// =====================================================
// Sell shares
// =====================================================
exports.sell = async (req, res) => {
  try {
    const { companyId, shares } = req.body;
    const userId = req.user?.id;

    if (!userId)
      return res.status(400).json({
        error: 'User not authenticated',
      });

    if (!companyId || !shares || parseInt(shares) <= 0) {
      return res.status(400).json({
        error: 'companyId and valid shares are required',
      });
    }

    const shareCount = parseInt(shares);

    const investment = await prisma.investment.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    if (!investment || investment.shares < shareCount) {
      return res.status(400).json({
        error: 'Insufficient shares to sell',
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company)
      return res.status(404).json({
        error: 'Company not found',
      });

    const totalValue = new Prisma.Decimal(company.current_price)
      .mul(shareCount);

    if (investment.shares === shareCount) {
      await prisma.investment.delete({
        where: { id: investment.id },
      });
    } else {
      await prisma.investment.update({
        where: { id: investment.id },
        data: {
          shares: investment.shares - shareCount,
          investment_amount:
            new Prisma.Decimal(investment.investment_amount)
              .minus(totalValue),
          updated_at: new Date(),
        },
      });
    }

    // Deposit funds back to wallet
    await walletService.deposit(userId, totalValue);

    res.json({
      success: true,
      message: 'Shares sold successfully',
      sharesSold: shareCount,
      totalValue,
    });

  } catch (error) {
    console.error('Sell investment error:', error);
    res.status(500).json({
      error: 'Sale failed',
      message: error.message,
    });
  }
};

// =====================================================
// Get user's investments
// =====================================================
exports.getUserInvestments = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId)
      return res.status(400).json({
        error: 'User not authenticated',
      });

    const userInvestments = await prisma.investment.findMany({
      where: { userId },
      include: { company: true },
    });

    const investmentsWithStats = userInvestments.map(inv => {
      const currentValue =
        new Prisma.Decimal(inv.shares)
          .mul(inv.company.current_price);

      const gainLoss =
        currentValue.minus(inv.investment_amount);

      const gainLossPercent =
        gainLoss
          .div(inv.investment_amount)
          .mul(100);

      return {
        ...inv,
        currentValue,
        gainLoss,
        gainLossPercent,
      };
    });

    res.json({
      investments: investmentsWithStats,
    });

  } catch (error) {
    console.error('Get investments error:', error);
    res.status(500).json({
      error: 'Failed to fetch investments',
      message: error.message,
    });
  }
};