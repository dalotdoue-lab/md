/**
 * Wallet Controller - CLEANED VERSION
 * ONLY validation → walletService → response
 * NO Prisma, NO repository, NO Number()
 */

const walletService = require('../services/walletService');

// Generate unique reference
const generateReference = (type) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${type}-${timestamp}-${random}`;
};

// =====================
// GET /api/wallet
// =====================
exports.getWallet = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    let wallet = await walletService.findByUserId(userId);
    if (!wallet) {
      wallet = await walletService.create(userId, "USD");
    }

    res.json({ success: true, wallet });
  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch wallet", message: error.message });
  }
};

// =====================
// POST /api/wallet/deposit
// =====================
exports.deposit = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const amount = req.body.amount;
    if (!amount) {
      return res.status(400).json({ success: false, error: "Amount required" });
    }

    const provider = req.body.provider || 'demo';
    const reference = generateReference("DEP");

    await walletService.pendingDeposit(
      userId,
      amount,
      reference,
      `Deposit via ${provider}`
    );

    res.status(201).json({
      success: true,
      message: "Deposit initiated",
      data: {
        reference,
        provider
      }
    });

  } catch (error) {
    console.error("Deposit error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// =====================
// POST /api/wallet/withdraw
// =====================
exports.withdraw = async (req, res) => {
  try {
    const userId = req.user?.id;
    const amount = req.body.amount;
    const provider = req.body.provider || 'bank';

    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });
    if (!amount) return res.status(400).json({ success: false, error: "Amount required" });

    const reference = generateReference("WDR");

    const updatedWallet = await walletService.pendingWithdrawal(
      userId,
      amount,
      reference,
      `Withdrawal via ${provider}`
    );

    res.json({
      success: true,
      message: "Withdrawal initiated",
      data: {
        balance: updatedWallet.balance,
        reference,
        provider
      }
    });

  } catch (error) {
    console.error("Withdraw error:", error);
    let status = 500;
    if (error.message === "Insufficient balance") status = 400;
    if (error.message === "Wallet not found") status = 404;
    res.status(status).json({ success: false, error: error.message });
  }
};

// =====================
// GET /api/wallet/transactions
// =====================
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

    const result = await walletService.getTransactions(userId);

    res.json({
      success: true,
      transactions: result.transactions || [],
      total: result.total || 0
    });

  } catch (error) {
    console.error("Transactions error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch transactions" });
  }
};

// =====================
// GET /api/wallet/status/:reference
// =====================
exports.getStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    const userId = req.user?.id;

    const result = await walletService.getStatus(reference, userId);

    if (!result || !result.transaction) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found"
      });
    }

    res.json({
      success: true,
      transaction: result.transaction,
      status: result.status
    });

  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ success: false, error: "Status check failed" });
  }
};

// =====================
// GET /api/wallet/summary
// =====================
exports.getSummary = async (req, res) => {
  res.json({ success: true, message: "Wallet summary endpoint working" });
};

// =====================
// GENERIC PAYMENT WEBHOOK
// =====================
exports.webhook = async (req, res) => {
  try {
    console.log("[GENERIC WEBHOOK RECEIVED]", req.body);
    res.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ success: false, error: "Webhook processing failed" });
  }
};

// =====================
// STRIPE WEBHOOK
// =====================
exports.stripeWebhook = async (req, res) => {
  try {
    const rawBody = req.body.rawBody || req.body;
    const sig = req.get('stripe-signature');

    const result = await require('../services/paymentService')
      .webhookConfirm('stripe', req.body.id, sig, rawBody);

    res.json(result);

  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(400).json({ error: "Stripe webhook failed" });
  }
};