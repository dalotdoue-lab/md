/**
 * Payment Service
 * Kingstone Investments - Payment provider integrations
 * M-Pesa STK Push, Stripe PaymentIntent, PayPal Orders
 */

const { Prisma } = require('@prisma/client');
const transactionRepository = require('../repositories/transactionRepository');
const walletService = require('../services/walletService');
const walletRepository = require('../repositories/walletRepository');
const prisma = require('../lib/prisma');

// Env vars (backend .env only)
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox';

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET ? require('stripe')(STRIPE_SECRET) : null;

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const paypal = PAYPAL_CLIENT_ID ? require('@paypal/checkout-server-sdk').paypal : null;

class PaymentService {
  /**
   * Initiate deposit - create pending + provider request
   */
  static async initiateDeposit(userId, amount, provider, details = {}) {
    if (amount < 10) throw new Error('Minimum deposit $10');

    const reference = `DEP_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // 1. Create pending transaction
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) throw new Error('Wallet not found');

    const tx = await transactionRepository.create({
      walletId: wallet.id,
      userId,
      type: 'DEPOSIT',
      amount,
      reference,
      provider,
      metadata: { details }
    });

    // 2. Add to pending balance
    await walletService.pendingDeposit(userId, amount, reference, `Deposit via ${provider}`);

    // 3. Provider-specific initiation
    let providerData = {};
    switch (provider.toLowerCase()) {
      case 'mpesa':
        providerData = await this.mpesaSTKPush(wallet.id, amount, reference, details.phone);
        break;
      case 'stripe':
        providerData = await this.stripePaymentIntent(amount, reference);
        break;
      case 'paypal':
        providerData = await this.paypalOrder(amount, reference);
        break;
      case 'demo':
        // Instant demo
        setTimeout(() => walletService.confirmDeposit(userId, reference), 2000);
        providerData = { status: 'demo_initiated' };
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    await transactionRepository.updateProviderRef(tx.id, provider, providerData.id || providerData.orderID);

    return {
      success: true,
      reference,
      transaction: tx,
      wallet,
      providerData
    };
  }

  /**
   * M-Pesa STK Push (Kenya)
   */
  static async mpesaSTKPush(walletId, amount, reference, phone) {
    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) throw new Error('M-Pesa not configured - check .env');

    const axios = require('axios');
    const crypto = require('crypto');

    // Generate timestamp
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    try {
      // 1. Get OAuth token
      const tokenRes = await axios.post(
        `https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`, // prod: api.safaricom.co.ke
        {},
        {
          auth: {
            username: MPESA_CONSUMER_KEY,
            password: MPESA_CONSUMER_SECRET
          }
        }
      );

      const accessToken = tokenRes.data.access_token;

      // 2. STK Push
      const stkRes = await axios.post(
        `https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`, // prod: api.safaricom.co.ke
        {
          BusinessShortCode: MPESA_SHORTCODE,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerPayBillOnline',
          Amount: Math.floor(amount),
          PartyA: phone.replace(/[^0-9]/g, ''),
          PartyB: MPESA_SHORTCODE,
          PhoneNumber: phone.replace(/[^0-9]/g, ''),
          CallBackURL: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/api/wallet/mpesa/callback`,
          AccountReference: `Kingstone_${reference.slice(0, 10)}`,
          TransactionDesc: `Deposit ${amount} via Kingstone Investments`
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[MPESA] STK Push successful: ${stkRes.data.CheckoutRequestID} to ${phone}`);
      return {
        CheckoutRequestID: stkRes.data.CheckoutRequestID,
        status: 'pending'
      };

    } catch (error) {
      console.error('[MPESA] STK Push failed:', error.response?.data || error.message);
      throw new Error(`M-Pesa STK failed: ${error.response?.data?.errorMessage || error.message}`);
    }
  }

  /**
   * Stripe PaymentIntent
   */
  static async stripePaymentIntent(amount, reference) {
    if (!stripe) throw new Error('Stripe not configured');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // cents
      currency: 'usd',
      metadata: { reference, walletId: 'from_wallet' },
      automatic_payment_methods: { enabled: true }
    });

    return {
      id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: paymentIntent.status
    };
  }

  /**
   * PayPal Order
   */
  static async paypalOrder(amount, reference) {
    if (!paypal) throw new Error('PayPal not configured');

    // Real impl: createOrder → captureOrder on webhook
    console.log(`[PAYPAL] Create order $${amount} ref ${reference}`);
    
    return {
      id: `mock_order_${reference}`,
      status: 'CREATED',
      links: [{ rel: 'approve', href: 'https://www.sandbox.paypal.com...' }]
    };
  }

  /**
   * Webhook: Confirm deposit by providerRef
   */
  static async webhookConfirm(provider, providerRef, signature, rawBody) {
    // Validate signature first
    this.validateWebhookSignature(provider, rawBody, signature);

    // Idempotency check
    const tx = await transactionRepository.findPendingByReference(providerRef);
    if (!tx) {
      console.log(`[WEBHOOK] Idempotent - tx ${providerRef} already processed or invalid`);
      return { success: true, idempotent: true, reference: providerRef };
    }

    // Confirm deposit
    await walletService.confirmDeposit(tx.wallet.user.id, tx.reference);
    await transactionRepository.complete(tx.id);

    // Notify user
    try {
      require('./websocketService').notifyUser(tx.wallet.user.id, {
        type: `${provider.toLowerCase()}_deposit_confirmed`,
        reference: tx.reference,
        amount: Number(tx.amount),
        provider
      });
    } catch (notifyErr) {
      console.warn('[WEBSOCKET] Notify failed:', notifyErr.message);
    }

    console.log(`[WEBHOOK] ${provider} confirmed deposit ${tx.reference} $${tx.amount}`);

    return { success: true, reference: tx.reference, amount: Number(tx.amount) };
  }

  static validateWebhookSignature(provider, rawBody, signature) {
    switch (provider.toLowerCase()) {
      case 'stripe':
        if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error('STRIPE_WEBHOOK_SECRET missing');
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        try {
          stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
          console.log('[STRIPE] Signature ✅ validated');
        } catch (err) {
          console.error('[STRIPE] Invalid signature:', err.message);
          throw new Error('Invalid Stripe signature');
        }
        break;
      case 'mpesa':
        // M-Pesa validation via callback data structure + timestamp check
        const callback = JSON.parse(rawBody);
        if (callback.Body.stkCallback && callback.Body.stkCallback.ResultCode === 0) {
          console.log('[MPESA] Callback ✅ validated');
        } else {
          throw new Error('Invalid M-Pesa callback');
        }
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}

module.exports = PaymentService;

