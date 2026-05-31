/**
 * Companies Routes
 * Kingstone Investments - Company/Stock API endpoints
 * 
 * Uses Prisma database via companiesController
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companiesController');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/companies
 * Get all companies with filters
 */
router.get('/', optionalAuth, companiesController.getAll);

/**
 * GET /api/companies/featured
 * Get featured companies
 */
router.get('/featured', companiesController.getAll);

/**
 * GET /api/companies/search
 * Search companies
 */
router.get('/search', companiesController.search);

/**
 * GET /api/companies/overview
 * Get market overview with gainers/losers
 */
router.get('/overview', companiesController.getMarketOverview);

/**
 * GET /api/companies/quote/:symbol
 * Get real-time quote for a symbol
 */
router.get('/quote/:symbol', companiesController.getQuote);

/**
 * GET /api/companies/:id
 * Get company by ID
 */
router.get('/:id', companiesController.getById);

/**
 * GET /api/companies/symbol/:ticker
 * Get company by ticker symbol
 */
router.get('/symbol/:ticker', companiesController.getByTicker);

/**
 * GET /api/companies/:id/history
 * Get stock price history
 */
router.get('/:id/history', companiesController.getStockHistory);

module.exports = router;

