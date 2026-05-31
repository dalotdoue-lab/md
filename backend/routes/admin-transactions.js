const express = require('express');
const router = express.Router();
const adminTransactionsController = require('../controllers/adminTransactionsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/admin/transactions - List all transactions
 */
router.get('/', authenticate, requireAdmin, adminTransactionsController.getAllTransactions);

/**
 * GET /api/admin/transactions/summary - Transaction stats
 */
router.get('/summary', authenticate, requireAdmin, adminTransactionsController.getTransactionSummary);

/**
 * PATCH /api/admin/transactions/:id/flag - Flag suspicious transaction
 */
router.patch('/:id/flag', authenticate, requireAdmin, adminTransactionsController.flagTransaction);

/**
 * POST /api/admin/transactions/:id/approve - Approve pending transaction
 */
router.post('/:id/approve', authenticate, requireAdmin, adminTransactionsController.approveTransaction);

/**
 * POST /api/admin/transactions/:id/reject - Reject pending transaction
 */
router.post('/:id/reject', authenticate, requireAdmin, adminTransactionsController.rejectTransaction);

/**
 * GET /api/admin/transactions/export - Export transactions (CSV)
 */
router.get('/export', authenticate, requireAdmin, (req, res) => {
  // Export logic
  res.json({ success: true, message: 'Export CSV ready' });
});

module.exports = router;

