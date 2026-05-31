/**
 * Payment Routes - Kingstone Investments
 * Protected: authenticate middleware (JWT + role check)
 * Providers: Stripe, PayPal, M-Pesa STK
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth').authenticate;
const { validate, schemas } = require('../middleware/validate');
const paymentController = require('../controllers/paymentController');

// Raw body parser for webhook signatures (Stripe/MPesa)
router.use((req, res, next) => {
  if (req.path.includes('/webhook')) {
    // Preserve raw body for signature verification
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      req.body.rawBody = data;
      next();
    });
  } else {
    next();
  }
});

// =====================================================
// PROTECTED ROUTES (User authenticated)
// =====================================================

// POST /api/payments/deposit
// { amount, provider: 'stripe|paypal|mpesa', phone? }
router.post('/deposit', authenticate, validate(schemas.deposit), paymentController.deposit);

// POST /api/payments/withdrawal  
// { amount, details: {bank?, phone?, reference?} }
router.post('/withdrawal', authenticate, validate(schemas.withdraw), paymentController.withdrawal);

// =====================================================
// PUBLIC WEBHOOKS (Provider callbacks)
// =====================================================

// POST /api/payments/webhook/:provider (Stripe/MPesa/PayPal)
router.post('/webhook/:provider', paymentController.webhook);

module.exports = router;

