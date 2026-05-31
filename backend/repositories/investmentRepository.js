/**
 * Investment Repository
 * Let Investments - Database operations for user investments
 * 
 * ============================================================================
 * Fixed: Using shared Prisma client from lib/prisma.js
 */

const prisma = require("../lib/prisma");

const investmentRepository = {
  /**
   * Get all investments for a user
   */
  async findByUserId(userId, includeInactive = false) {
    const where = { userId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return await prisma.investment.findMany({
      where,
      include: {
        company: {
          include: {
            sector: true,
            region: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get single investment by ID
   */
  async findById(id) {
    return await prisma.investment.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            sector: true,
            region: true,
          },
        },
      },
    });
  },

  /**
   * Get investment by user and company
   */
  async findByUserAndCompany(userId, companyId) {
    return await prisma.investment.findUnique({
      where: {
        userId_companyId: { userId, companyId },
      },
      include: {
        company: true,
      },
    });
  },

  /**
   * Create or update investment (buy more shares)
   */
  async upsertBuy(userId, companyId, newShares, pricePerShare, totalCost) {
    const existing = await this.findByUserAndCompany(userId, companyId);

    if (existing) {
      // Update existing investment - calculate new average
      const totalShares = existing.shares + newShares;
      const totalCostBasis = existing.investmentAmount + totalCost;
      const averageCost = totalCostBasis / totalShares;
      const currentValue = totalShares * pricePerShare;
      const profitLoss = currentValue - totalCostBasis;
      const profitLossPercent = (profitLoss / totalCostBasis) * 100;

      return await prisma.investment.update({
        where: { id: existing.id },
        data: {
          shares: totalShares,
          averageCost,
          investmentAmount: totalCostBasis,
          currentPrice: pricePerShare,
          currentValue,
          profitLoss,
          profitLossPercent,
          lastPurchasedAt: new Date(),
          isActive: true,
        },
        include: {
          company: true,
        },
      });
    } else {
      // Create new investment
      const currentValue = newShares * pricePerShare;
      const profitLoss = currentValue - totalCost;

      return await prisma.investment.create({
        data: {
          userId,
          companyId,
          shares: newShares,
          buyPrice: pricePerShare,
          averageCost: pricePerShare,
          investmentAmount: totalCost,
          currentPrice: pricePerShare,
          currentValue,
          profitLoss,
          profitLossPercent: (profitLoss / totalCost) * 100,
          isActive: true,
        },
        include: {
          company: true,
        },
      });
    }
  },

  /**
   * Sell shares - update or delete investment
   */
  async sellShares(userId, companyId, sharesToSell, pricePerShare) {
    const existing = await this.findByUserAndCompany(userId, companyId);

    if (!existing) {
      throw new Error('Investment not found');
    }

    if (existing.shares < sharesToSell) {
      throw new Error('Insufficient shares');
    }

    const totalValue = sharesToSell * pricePerShare;
    const remainingShares = existing.shares - sharesToSell;

    if (remainingShares === 0) {
      // Delete investment
      await prisma.investment.delete({
        where: { id: existing.id },
      });
      return { deleted: true, remainingShares: 0 };
    } else {
      // Update investment
      const remainingCostBasis = existing.averageCost * remainingShares;
      const currentValue = remainingShares * pricePerShare;
      const profitLoss = currentValue - remainingCostBasis;
      const profitLossPercent = (profitLoss / remainingCostBasis) * 100;

      return await prisma.investment.update({
        where: { id: existing.id },
        data: {
          shares: remainingShares,
          investmentAmount: remainingCostBasis,
          currentPrice: pricePerShare,
          currentValue,
          profitLoss,
          profitLossPercent,
        },
        include: {
          company: true,
        },
      });
    }
  },

  /**
   * Update all investment values (for price updates)
   */
  async updatePortfolioValues(userId) {
    const investments = await this.findByUserId(userId);

    for (const inv of investments) {
      const currentPrice = inv.company.currentPrice;
      const currentValue = Number(inv.shares) * Number(currentPrice);
      const profitLoss = currentValue - Number(inv.investmentAmount);
      const profitLossPercent = (profitLoss / Number(inv.investmentAmount)) * 100;

      await prisma.investment.update({
        where: { id: inv.id },
        data: {
          currentPrice,
          currentValue,
          profitLoss,
          profitLossPercent,
        },
      });
    }
  },

  /**
   * Get portfolio summary for a user
   */
  async getPortfolioSummary(userId) {
    const investments = await this.findByUserId(userId);

    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.investmentAmount), 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + Number(inv.currentValue || 0), 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const returnPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    return {
      totalPositions: investments.length,
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      returnPercent,
    };
  },

  /**
   * Get sector allocation
   */
  async getSectorAllocation(userId) {
    const investments = await this.findByUserId(userId);

    const sectorMap = {};
    let totalValue = 0;

    for (const inv of investments) {
      const sectorName = inv.company.sector?.name || 'Unknown';
      const value = Number(inv.currentValue || 0);
      totalValue += value;

      if (!sectorMap[sectorName]) {
        sectorMap[sectorName] = { name: sectorName, value: 0, positions: 0 };
      }
      sectorMap[sectorName].value += value;
      sectorMap[sectorName].positions += 1;
    }

    return Object.values(sectorMap).map((s) => ({
      ...s,
      allocation: totalValue > 0 ? (s.value / totalValue) * 100 : 0,
    }));
  },

  /**
   * Get top holdings
   */
  async getTopHoldings(userId, limit = 10) {
    const investments = await prisma.investment.findMany({
      where: { userId, isActive: true },
      include: {
        company: {
          include: { sector: true, region: true },
        },
      },
      orderBy: { currentValue: 'desc' },
      take: limit,
    });

    return investments.map((inv) => ({
      ...inv,
      currentValue: Number(inv.currentValue || 0),
      profitLoss: Number(inv.profitLoss || 0),
      profitLossPercent: Number(inv.profitLossPercent || 0),
    }));
  },
};

module.exports = investmentRepository;



