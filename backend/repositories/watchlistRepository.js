/**
 * Watchlist Repository
 * Let Investments - Database operations for watchlists
 * 
 * ============================================================================
 * Fixed: Using shared Prisma client from lib/prisma.js
 */

const prisma = require("../lib/prisma");

const watchlistRepository = {
  /**
   * Get user's watchlist
   */
  async findByUserId(userId, includeInactiveCompanies = false) {
    const where = { userId };
    
    if (!includeInactiveCompanies) {
      where.company = { isActive: true };
    }

    return await prisma.watchlist.findMany({
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
   * Get by ID
   watchlist item */
  async findById(id) {
    return await prisma.watchlist.findUnique({
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
   * Get watchlist item by user and company
   */
  async findByUserAndCompany(userId, companyId) {
    return await prisma.watchlist.findUnique({
      where: {
        userId_companyId: { userId, companyId },
      },
      include: {
        company: true,
      },
    });
  },

  /**
   * Add company to watchlist
   */
  async add(userId, companyId, targetPrice = null, note = null, priceAlertEnabled = false) {
    // Check if already exists
    const existing = await this.findByUserAndCompany(userId, companyId);
    if (existing) {
      return existing;
    }

    return await prisma.watchlist.create({
      data: {
        userId,
        companyId,
        targetPrice,
        note,
        priceAlertEnabled,
      },
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
   * Update watchlist item
   */
  async update(id, data) {
    const { targetPrice, note, priceAlertEnabled } = data;

    return await prisma.watchlist.update({
      where: { id },
      data: {
        targetPrice,
        note,
        priceAlertEnabled,
      },
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
   * Remove company from watchlist
   */
  async remove(userId, companyId) {
    return await prisma.watchlist.delete({
      where: {
        userId_companyId: { userId, companyId },
      },
    });
  },

  /**
   * Remove watchlist item by ID
   */
  async removeById(id, userId) {
    // Verify ownership
    const item = await prisma.watchlist.findUnique({ where: { id } });
    if (!item || item.userId !== userId) {
      throw new Error('Watchlist item not found or access denied');
    }

    return await prisma.watchlist.delete({
      where: { id },
    });
  },

  /**
   * Get watchlist with price alerts
   */
  async getPriceAlerts(userId) {
    return await prisma.watchlist.findMany({
      where: {
        userId,
        priceAlertEnabled: true,
        company: { isActive: true },
      },
      include: {
        company: true,
      },
    });
  },

  /**
   * Check and trigger price alerts
   */
  async checkPriceAlerts(companyId, currentPrice) {
    const watchlistItems = await prisma.watchlist.findMany({
      where: {
        companyId,
        priceAlertEnabled: true,
        targetPrice: { not: null },
      },
      include: {
        user: true,
        company: true,
      },
    });

    const triggered = [];
    
    for (const item of watchlistItems) {
      const targetPrice = Number(item.targetPrice);
      
      // Alert when price goes above or below target
      if (currentPrice >= targetPrice || currentPrice <= targetPrice) {
        triggered.push(item);
        
        // Create notification
        await prisma.notification.create({
          data: {
            userId: item.userId,
            type: 'price_alert',
            priority: 'high',
            title: `Price Alert: ${item.company.symbol}`,
            message: `${item.company.name} is now $${currentPrice.toFixed(2)} (target: $${targetPrice.toFixed(2)})`,
            entityType: 'company',
            entityId: companyId,
          },
        });
      }
    }

    return triggered;
  },

  /**
   * Get watchlist count for user
   */
  async getCount(userId) {
    return await prisma.watchlist.count({
      where: { userId },
    });
  },

  /**
   * Clear all watchlist items for user
   */
  async clearAll(userId) {
    return await prisma.watchlist.deleteMany({
      where: { userId },
    });
  },
};

module.exports = watchlistRepository;



