/**
 * Stock Price Simulation Engine
 * Let Investments
 *
 * ============================================================
 * PURPOSE
 * - Handles market price simulation
 * - Updates company prices in the database
 * - Updates portfolio values
 *
 * NOTE
 * - No cron jobs here
 * - Scheduler controls timing
 */

const prisma = require("../lib/prisma")

const MAX_CHANGE_PERCENT = 0.03
const MIN_CHANGE_PERCENT = -0.03


/**
 * Calculate new price using random variation
 */
function calculateNewPrice(currentPrice) {

  if (!currentPrice) return 0.01

  const randomPercent =
    Math.random() * (MAX_CHANGE_PERCENT - MIN_CHANGE_PERCENT) +
    MIN_CHANGE_PERCENT

  const priceChange = currentPrice * randomPercent

  let newPrice = currentPrice + priceChange

  newPrice = Math.max(0.01, newPrice)

  newPrice = Math.round(newPrice * 100) / 100

  return newPrice
}



/**
 * ============================================================
 * Update all company prices
 * ============================================================
 */
async function updateAllPrices() {

  try {

    console.log("🔄 Running market price simulation...")

    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: {
        id: true,
        symbol: true,
        name: true,
        currentPrice: true
      }
    })

    if (!companies.length) {
      console.log("⚠️ No companies found to update")
      return []
    }

    const results = []

    for (const company of companies) {

      const oldPrice = Number(company.currentPrice)

      const newPrice = calculateNewPrice(oldPrice)

      await prisma.company.update({
        where: { id: company.id },
        data: { currentPrice: newPrice }
      })

      results.push({
        symbol: company.symbol,
        oldPrice,
        newPrice,
        change: (
          ((newPrice - oldPrice) / oldPrice) * 100
        ).toFixed(2)
      })

    }

    results.forEach(r => {

      const direction = r.newPrice > r.oldPrice ? "📈" : "📉"

      console.log(
        `${direction} ${r.symbol}: $${r.oldPrice} → $${r.newPrice} (${r.change}%)`
      )

    })

    console.log("✅ Market simulation complete")

    return results

  } catch (error) {

    console.error("❌ Market simulation failed:", error.message)

    throw error

  }

}



/**
 * ============================================================
 * Update portfolio values
 * ============================================================
 */
async function updateAllPortfolios() {

  try {

    console.log("📊 Updating portfolio values...")

    const investments = await prisma.investment.findMany({
      include: {
        company: true
      }
    })

    for (const inv of investments) {

      if (!inv.company) continue

      const currentValue =
        Number(inv.shares) * Number(inv.company.currentPrice)

      await prisma.investment.update({
        where: { id: inv.id },
        data: {
          currentValue: currentValue
        }
      })

    }

    console.log("✅ Portfolio values updated")

  } catch (error) {

    console.error("❌ Portfolio update failed:", error.message)

    throw error

  }

}



module.exports = {

  calculateNewPrice,
  updateAllPrices,
  updateAllPortfolios

}