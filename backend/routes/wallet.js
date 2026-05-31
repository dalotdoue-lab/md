/**
 * Wallet Routes - FINAL STABLE
 */

const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// =====================
// GET /api/wallet
// =====================
router.get('/', authenticate, walletController.getWallet);

// =====================
// POST /api/wallet/deposit
// =====================
router.post('/deposit', authenticate, validate(schemas.deposit), walletController.deposit);

// =====================
// POST /api/wallet/withdraw  
// =====================
router.post('/withdraw', authenticate, validate(schemas.withdraw), walletController.withdraw);

// =====================
// GET /api/wallet/transactions
// =====================
router.get('/transactions', authenticate, walletController.getTransactions);

// =====================
// GET /api/wallet/status/:reference
// =====================
router.get('/status/:reference', authenticate, walletController.getStatus);

// =====================
// GET /api/wallet/summary
// =====================
router.get('/summary', authenticate, walletController.getSummary);

// =====================
// POST /api/wallet/webhook
// =====================
router.post('/webhook', walletController.webhook);

// =====================
// Stripe webhook
// =====================
if (typeof walletController.stripeWebhook === 'function') {
  router.post('/stripe/webhook', walletController.stripeWebhook);
}

// =====================
// PayPal webhook
// =====================
router.post('/paypal/webhook', walletController.webhook);

// =====================
// M-Pesa callback (legacy)
// =====================
router.post('/mpesa/callback', async (req, res) => {
  try {
    const paymentService = require('../services/paymentService');
    const result = await paymentService.webhookConfirm(
      'mpesa',
      req.body,
      null,
      JSON.stringify(req.body)
    );

    console.log('[MPESA CALLBACK PROCESSED]', result);

    res.json({
      ResultCode: 0,
      ResultDesc: "Accepted the service request successfully."
    });
  } catch (error) {
    console.error('[MPESA CALLBACK ERROR]', error.message);

    res.status(400).json({
      ResultCode: 1,
      ResultDesc: error.message || "Failed to process callback"
    });
  }
});

module.exports = router;