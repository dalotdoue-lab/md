/**
 * Stock Price Service
 * Let Investments - Handles stock price alerts and price updates
 *
 * ============================================================================
 * FIXES APPLIED
 * - Added missing methods used by scheduler and controllers
 * - updateAllPrices()
 * - updateAllPortfolios()
 * - getQuote(symbol)
 * - updateCompanyPrice(companyId, newPrice)
 * - Added safety checks for undefined values
 * - Uses shared Prisma client
 */

const prisma = require("../lib/prisma");

// Engine that simulates price updates
const stockPriceEngine = require("./stockPriceEngine");

const stockPriceService = {

  /**
   * ============================================================
   * PRICE UPDATE METHODS (USED BY SCHEDULER)
   * ============================================================
   */

  async updateAllPrices() {
    try {
      console.log("🚀 Updating all company prices...");

      if (!stockPriceEngine || !stockPriceEngine.updateAllPrices) {
        throw new Error("stockPriceEngine.updateAllPrices not available");
      }

      return await stockPriceEngine.updateAllPrices();

    } catch (error) {
      console.error("❌ Error updating prices:", error.message);
      throw error;
    }
  },

  async updateAllPortfolios() {
    try {
      console.log("📊 Updating all portfolios...");

      if (!stockPriceEngine || !stockPriceEngine.updateAllPortfolios) {
        console.warn("⚠️ updateAllPortfolios not implemented in engine");
        return;
      }

      return await stockPriceEngine.updateAllPortfolios();

    } catch (error) {
      console.error("❌ Error updating portfolios:", error.message);
      throw error;
    }
  },

  /**
   * Update company price in database
   */
  async updateCompanyPrice(companyId, newPrice) {
    try {
      if (!companyId) throw new Error("Company ID required");
      if (newPrice === undefined || newPrice === null) {
        throw new Error("New price required");
      }

      return await prisma.company.update({
        where: { id: companyId },
        data: { currentPrice: newPrice },
      });

    } catch (error) {
      console.error("Error updating company price:", error.message);
      throw error;
    }
  },

  /**
   * Get stock quote by symbol
   */
  async getQuote(symbol) {
    try {
      if (!symbol) throw new Error("Symbol is required");

      const company = await prisma.company.findFirst({
        where: {
          symbol: symbol.toUpperCase(),
        },
      });

      if (!company) {
        throw new Error(`Company with symbol ${symbol} not found`);
      }

      return {
        symbol: company.symbol,
        name: company.name,
        price: company.currentPrice,
        updatedAt: company.updatedAt,
      };

    } catch (error) {
      console.error("Error getting stock quote:", error.message);
      throw error;
    }
  },

  /**
   * ============================================================
   * ALERT MANAGEMENT
   * ============================================================
   */

  async getAllAlerts() {
    try {
      return await prisma.stockPriceAlert.findMany({
        include: {
          company: true,
          user: true,
        },
      });
    } catch (error) {
      console.error("Error fetching stock alerts:", error.message);
      throw error;
    }
  },

  async createAlert(data) {
    try {

      if (!data) throw new Error("Alert data required");
      if (!data.companyId) throw new Error("Company ID required");
      if (!data.userId) throw new Error("User ID required");

      return await prisma.stockPriceAlert.create({
        data: {
          companyId: data.companyId,
          userId: data.userId,
          targetPrice: data.targetPrice,
          type: data.type || "above",
          isActive: data.isActive ?? true,
        },
        include: {
          company: true,
          user: true,
        },
      });

    } catch (error) {
      console.error("Error creating alert:", error.message);
      throw error;
    }
  },

  async updateAlert(alertId, data) {
    try {

      if (!alertId) throw new Error("Alert ID required");

      return await prisma.stockPriceAlert.update({
        where: { id: alertId },
        data: {
          targetPrice: data.targetPrice,
          type: data.type,
          isActive: data.isActive,
        },
        include: {
          company: true,
          user: true,
        },
      });

    } catch (error) {
      console.error("Error updating alert:", error.message);
      throw error;
    }
  },

  async deleteAlert(alertId) {
    try {

      if (!alertId) throw new Error("Alert ID required");

      return await prisma.stockPriceAlert.update({
        where: { id: alertId },
        data: { isActive: false },
      });

    } catch (error) {
      console.error("Error deleting alert:", error.message);
      throw error;
    }
  },

  /**
   * Check if alerts should trigger
   */
  async checkAlerts() {
    try {

      const alerts = await prisma.stockPriceAlert.findMany({
        where: { isActive: true },
        include: { company: true, user: true },
      });

      const triggered = [];

      for (const alert of alerts) {

        if (!alert.company || alert.company.currentPrice == null) {
          console.warn(`Skipping alert ${alert.id} - missing price`);
          continue;
        }

        const currentPrice = alert.company.currentPrice;

        let trigger = false;

        if (alert.type === "above" && currentPrice >= alert.targetPrice) trigger = true;
        if (alert.type === "below" && currentPrice <= alert.targetPrice) trigger = true;

        if (trigger) {

          triggered.push(alert);

          await prisma.stockPriceAlert.update({
            where: { id: alert.id },
            data: { isActive: false },
          });

        }
      }

      return triggered;

    } catch (error) {
      console.error("Error checking alerts:", error.message);
      throw error;
    }
  },

  /**
   * ============================================================
   * PRICE HISTORY
   * ============================================================
   */

  async getPriceHistory(companyId, days = 30) {

    try {

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await prisma.stockPriceHistory.findMany({
        where: {
          companyId,
          date: { gte: startDate },
        },
        orderBy: {
          date: "desc",
        },
      });

    } catch (error) {
      console.error("Error fetching price history:", error.message);
      throw error;
    }
  }

};

module.exports = stockPriceService;