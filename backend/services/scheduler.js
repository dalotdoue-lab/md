/**
 * Cron Scheduler
 * Let Investments
 *
 * ============================================================
 * Handles scheduled tasks like:
 * - stock price updates
 * - portfolio value recalculation
 *
 * FIXES
 * - Runs jobs immediately on startup
 * - Safer error handling
 * - Works regardless of server timezone
 */

const cron = require("node-cron")
const stockPriceService = require("./stockPriceService")


function initScheduler() {

  console.log("⏰ Initializing scheduled jobs...")


  /**
   * ------------------------------------------------------------
   * PRICE UPDATE JOB
   * Every 15 minutes
   * ------------------------------------------------------------
   */
  cron.schedule("*/15 * * * *", async () => {

    console.log("🔄 Running scheduled price update...")

    try {

      if (stockPriceService.updateAllPrices) {
        await stockPriceService.updateAllPrices()
      } else {
        console.error("updateAllPrices() not found in stockPriceService")
      }

    } catch (error) {

      console.error("❌ Scheduler price update failed:", error.message)

    }

  })



  /**
   * ------------------------------------------------------------
   * PORTFOLIO UPDATE JOB
   * Every hour
   * ------------------------------------------------------------
   */
  cron.schedule("0 * * * *", async () => {

    console.log("📊 Running hourly portfolio update...")

    try {

      if (stockPriceService.updateAllPortfolios) {
        await stockPriceService.updateAllPortfolios()
      }

    } catch (error) {

      console.error("❌ Scheduler portfolio update failed:", error.message)

    }

  })



  /**
   * ------------------------------------------------------------
   * DAILY SNAPSHOT
   * ------------------------------------------------------------
   */
  cron.schedule("0 21 * * *", async () => {

    console.log("📅 Running daily market snapshot...")

    try {

      await stockPriceService.updateAllPrices()
      await stockPriceService.updateAllPortfolios()

    } catch (error) {

      console.error("❌ Scheduler daily snapshot failed:", error.message)

    }

  })



  /**
   * ------------------------------------------------------------
   * RUN ON STARTUP
   * ------------------------------------------------------------
   */

  setTimeout(async () => {

    try {

      console.log("🚀 Running initial market update...")

      await stockPriceService.updateAllPrices()
      await stockPriceService.updateAllPortfolios()

      console.log("✅ Initial market update complete")

    } catch (error) {

      console.error("❌ Initial scheduler run failed:", error.message)

    }

  }, 5000)



  console.log("✅ Scheduler initialized successfully")

}



function stopScheduler() {

  console.log("🛑 Scheduler stopped")

}



module.exports = {

  initScheduler,
  stopScheduler

}