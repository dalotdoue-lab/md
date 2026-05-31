/**
 * Payment Controller - Kingstone Investments
 * Central endpoints for deposits, withdrawals, webhooks
 */

const PaymentService = require('../services/paymentService');
const walletService = require('../services/walletService');
const prisma = require('../lib/prisma');
const { Prisma } = require('@prisma/client');
const auditLogger = require('../middleware/auditLogger');

const paymentController = {

  /**
   * POST /api/payments/deposit
   */
  deposit: async (req, res) => {
    try {
      const { amount, provider, details = {} } = req.body;

      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const decimalAmount = new Prisma.Decimal(amount);

      const result = await PaymentService.initiateDeposit(
        req.user.id,
        decimalAmount,
        provider,
        details
      );

      auditLogger.deposit(
        req.user.id,
        {
          transactionId: result.transaction.id,
          amount,
          provider,
          ipAddress: req.ip
        },
        req.ip
      );

      res.json({
        success: true,
        message: `Deposit initiated via ${provider}`,
        reference: result.reference,
        transaction: result.transaction,
        providerData: result.providerData
      });

    } catch (error) {
      console.error('[PAYMENT-DEPOSIT]', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Deposit initiation failed'
      });
    }
  },

  /**
   * POST /api/payments/withdrawal
   */
  withdrawal: async (req, res) => {
    try {

      const { amount, details = {} } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const decimalAmount = new Prisma.Decimal(amount);

      const reference = `WDRL_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase()}`;

      const wallet = await walletService.pendingWithdrawal(
        userId,
        decimalAmount,
        reference,
        'Withdrawal pending admin approval'
      );

      auditLogger.createWithdrawalRequest(
        userId,
        {
          amount,
          reference,
          details,
          ipAddress: req.ip
        },
        req.ip
      );

      res.json({
        success: true,
        message: 'Withdrawal request created - pending admin approval',
        reference,
        eta: '1-3 business days'
      });

    } catch (error) {

      console.error('[PAYMENT-WITHDRAWAL]', error);

      let status = 400;

      if (error.message.includes('Wallet not found'))
        status = 404;

      res.status(status).json({
        success: false,
        error: error.message || 'Withdrawal request failed'
      });
    }
  },

  /**
   * POST /api/payments/webhook/:provider
   */
  webhook: async (req, res) => {

    try {

      const provider = req.params.provider.toLowerCase();
      const rawBody = req.body.rawBody || JSON.stringify(req.body);

      const signature =
        req.get('stripe-signature') ||
        req.headers['x-mpesa-signature'];

      const result = await PaymentService.webhookConfirm(
        provider,
        req.body.id ||
        req.body.Body?.stkCallback?.CheckoutRequestID ||
        req.body.orderID,
        signature,
        rawBody
      );

      res.status(200).json(result);

    } catch (error) {

      console.error('[PAYMENT-WEBHOOK]', error);

      res.status(400).json({
        error: 'Webhook processing failed'
      });

    }
  }

};

module.exports = paymentController;