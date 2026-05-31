/**
 * Client Portal Routes - Client-only endpoints
 * Kingstone Investments
 */

const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middleware/auth');

// Controllers
const portfolioController = require('../controllers/portfolioController');
const walletController = require('../controllers/walletController');
const investmentsController = require('../controllers/investmentsController');
const watchlistController = require('../controllers/watchlistController');
const transactionsController = require('../controllers/transactionsController');

// Dashboard router
const dashboardRoutes = require('./dashboard');

// Safe wrapper
const safe = (fn, name) => (req, res, next) => {
  if (typeof fn !== 'function') {
    console.error(`❌ Missing controller: ${name}`);
    return res.status(500).json({
      error: `Missing controller: ${name}`
    });
  }
  return fn(req, res, next);
};

// Client-only middleware
const requireClient = authorize('client');

// Dashboard
router.use('/dashboard', authenticate, requireClient, dashboardRoutes);

// Portfolio
router.get(
  '/portfolio',
  authenticate,
  requireClient,
  safe(portfolioController.getPortfolio, 'getPortfolio')
);

// Wallet
router.get(
  '/wallet',
  authenticate,
  requireClient,
  safe(walletController.getWallet, 'getWallet')
);

router.get(
  '/wallet/transactions',
  authenticate,
  requireClient,
  safe(walletController.getTransactions, 'getTransactions')
);

// Investments
router.get(
  '/investments',
  authenticate,
  requireClient,
  safe(investmentsController.getUserInvestments, 'getUserInvestments')
);

// Watchlist
router.get(
  '/watchlist',
  authenticate,
  requireClient,
  safe(watchlistController.getWatchlist, 'getWatchlist')
);

// Transactions
router.get(
  '/transactions',
  authenticate,
  requireClient,
  safe(transactionsController.getUserTransactions, 'getUserTransactions')
);

module.exports = router;