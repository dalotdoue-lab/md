// investments.js
const express = require('express');
const router = express.Router();
const investmentRepository = require('../repositories/investmentRepository');
const companyRepository = require('../repositories/companyRepository');
const walletService = require('../services/walletService');
const walletRepository = require('../repositories/walletRepository');
const transactionRepository = require('../repositories/transactionRepository');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { audit } = require('../middleware/auditLogger');

router.post('/buy', authenticate, validate(schemas.buy), async (req, res) => {
  try {
    const { companyId, amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount is required and must be > 0' });
    }

    const company = await companyRepository.findById(companyId);
    if (!company) return res.status(404).json({ error: 'Company not found' });

    const currentPrice = Number(company.currentPrice || company.current_price || 0);
    if (currentPrice <= 0) return res.status(400).json({ error: 'Invalid company price' });

    const shares = Math.floor(amount / currentPrice);
    const totalCost = shares * currentPrice;
    if (shares <= 0) return res.status(400).json({ error: 'Investment too low' });

    const wallet = await walletRepository.findByUserId(req.userId);
    if (!wallet || Number(wallet.balance) < totalCost) return res.status(400).json({ error: 'Insufficient balance' });

    await walletRepository.withdraw(req.userId, totalCost);

    const reference = `BUY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await transactionRepository.create({
      walletId: wallet.id,
      userId: req.userId,
      type: 'BUY',
      amount: totalCost,
      fee: 0,
      netAmount: totalCost,
      reference,
      provider: 'wallet',
      description: `Bought ${shares} shares of ${company.symbol}`,
      companyId,
      shares,
      pricePerShare: currentPrice,
    });

    const investment = await investmentRepository.upsertBuy(req.userId, companyId, shares, currentPrice, totalCost);

    audit.buy(req.userId, { investmentId: investment.id, companyId, companyName: company.name, symbol: company.symbol, shares, pricePerShare: currentPrice, totalCost }, req.ip);

    res.status(201).json({ success: true, message: 'Investment successful', investment, sharesPurchased: shares, totalCost });

  } catch (error) {
    console.error('Buy investment error:', error);
    res.status(500).json({ error: 'Investment failed', message: error.message });
  }
});

// POST /api/invest/project
router.post('/project', authenticate, async (req, res) => {
  try {
    const { projectId, amount, paymentMethod, phone } = req.body;

    if (!projectId || !amount || Number(amount) <= 0 || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields: projectId, amount, and paymentMethod' });
    }

    const Project = require('../models/Project');
    const UserInvestment = require('../models/UserInvestment');

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Catalog project not found' });
    }

    const reference = `PROJ_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    if (paymentMethod === 'wallet') {
      // 1. Process balance deduction and completed transaction in PostgreSQL
      await walletService.investFromWallet(
        req.userId,
        Number(amount),
        reference,
        `Investment in project ${project.title}`
      );

      // 2. Create active UserInvestment in MongoDB
      const investment = await UserInvestment.create({
        userId: req.userId,
        projectId: project._id.toString(),
        projectTitle: project.title,
        amount: Number(amount),
        reference,
        status: 'active',
        growthRate: 0.05
      });

      return res.status(201).json({
        success: true,
        message: 'Investment processed successfully',
        status: 'completed',
        reference,
        investment
      });

    } else if (paymentMethod === 'mpesa') {
      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required for M-Pesa payments' });
      }

      // 1. Process pending deposit in PostgreSQL
      await walletService.pendingDeposit(
        req.userId,
        Number(amount),
        reference,
        `Investment in project ${project.title} via mpesa`
      );

      // 2. Create pending UserInvestment in MongoDB
      const investment = await UserInvestment.create({
        userId: req.userId,
        projectId: project._id.toString(),
        projectTitle: project.title,
        amount: Number(amount),
        reference,
        status: 'pending',
        growthRate: 0.05
      });

      // 3. Initiate M-Pesa STK Push
      try {
        const paymentService = require('../services/paymentService');
        const wallet = await walletRepository.findByUserId(req.userId);
        if (wallet) {
          // Trigger STK push in background
          paymentService.mpesaSTKPush(wallet.id, Number(amount), reference, phone).catch(err => {
            console.error('M-Pesa STK push background error:', err.message);
          });
        }
      } catch (payErr) {
        console.error('M-Pesa service initiation error:', payErr);
      }

      return res.status(201).json({
        success: true,
        message: 'Investment initiated. Please approve the payment on your phone.',
        status: 'pending',
        reference,
        investment
      });

    } else {
      return res.status(400).json({ error: 'Unsupported payment method. Use wallet or mpesa.' });
    }

  } catch (error) {
    console.error('Project investment error:', error);
    res.status(500).json({ error: 'Investment failed', message: error.message });
  }
});

// GET /api/invest/my-investments
router.get('/my-investments', authenticate, async (req, res) => {
  try {
    const UserInvestment = require('../models/UserInvestment');
    const investments = await UserInvestment.find({ userId: req.userId });
    res.json({ success: true, investments });
  } catch (error) {
    console.error('Get my-investments error:', error);
    res.status(500).json({ error: 'Failed to fetch investments', message: error.message });
  }
});

module.exports = router;