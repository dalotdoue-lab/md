/**
 * Portfolio Routes - FINAL STABLE VERSION
 */

const express = require('express');
const router = express.Router();

const portfolioController = require('../controllers/portfolioController');
const { authenticate } = require('../middleware/auth');

// ✅ Safety check (prevents undefined handler crash)
if (!portfolioController || typeof portfolioController.getPortfolio !== 'function') {
  throw new Error("portfolioController.getPortfolio is not defined");
}

// =====================================================
// GET /api/portfolio
// =====================================================
router.get('/', authenticate, portfolioController.getPortfolio);

// =====================================================
// GET /api/portfolio/summary (SAFE OPTIONAL)
// =====================================================
if (typeof portfolioController.getPortfolioSummary === 'function') {
  router.get('/summary', authenticate, portfolioController.getPortfolioSummary);
} else {
  console.warn("⚠️ getPortfolioSummary not defined - route skipped");
}

module.exports = router;