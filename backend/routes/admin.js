/**
 * Admin Routes
 * Kingstone Investments - Admin-only endpoints
 */

const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Safety wrapper to prevent undefined controller crashes
const safe = (fn, name) => (req, res, next) => {
  if (typeof fn !== 'function') {
    console.error(`❌ Missing admin controller function: ${name}`);
    return res.status(500).json({
      error: 'Admin controller function missing',
      function: name
    });
  }
  return fn(req, res, next);
};

// User management
router.use('/users', require('./admin-users'));

// KYC management
router.use('/kyc', require('./admin-kyc'));

// Transaction management
router.use('/transactions', require('./admin-transactions'));

// Pending deposits & withdrawals
router.get(
  '/pending/deposits',
  authenticate,
  requireAdmin,
  safe(adminController.getPendingDeposits, 'getPendingDeposits')
);

router.get(
  '/pending/withdrawals',
  authenticate,
  requireAdmin,
  safe(adminController.getPendingWithdrawals, 'getPendingWithdrawals')
);

// Withdrawal actions
router.post(
  '/withdraw/approve/:txId',
  authenticate,
  requireAdmin,
  safe(adminController.approveWithdraw, 'approveWithdraw')
);

router.post(
  '/withdraw/reject/:txId',
  authenticate,
  requireAdmin,
  safe(adminController.rejectWithdraw, 'rejectWithdraw')
);

// Ledger & metrics
router.get(
  '/ledger/:walletId',
  authenticate,
  requireAdmin,
  safe(adminController.getLedger, 'getLedger')
);

router.get(
  '/metrics',
  authenticate,
  requireAdmin,
  safe(adminController.getMetrics, 'getMetrics')
);

router.get(
  '/settings',
  authenticate,
  requireAdmin,
  safe(adminController.getSettings, 'getSettings')
);

router.put(
  '/settings',
  authenticate,
  requireAdmin,
  safe(adminController.updateSettings, 'updateSettings')
);

module.exports = router;