const prisma = require('../lib/prisma');
const walletService = require('../services/walletService');
const SystemSettings = require('../models/SystemSettings');
const UserInvestment = require('../models/UserInvestment');

const DEFAULT_PAYMENT_SETTINGS = {
  mpesaPaybill: '400200',
  mpesaAccountNumber: 'KINGSTONE',
  mpesaAccountName: 'Kingstone Investments'
};

const firstDefined = (...values) => values.find((value) => value !== undefined);
const cleanText = (value) => String(value || '').trim();

const toSettingsPayload = (settings) => {
  const mpesaPaybill = settings.mpesaPaybill || settings.mpesaNumber || DEFAULT_PAYMENT_SETTINGS.mpesaPaybill;
  const mpesaAccountNumber = settings.mpesaAccountNumber || DEFAULT_PAYMENT_SETTINGS.mpesaAccountNumber;
  const mpesaAccountName = settings.mpesaAccountName || settings.mpesaName || DEFAULT_PAYMENT_SETTINGS.mpesaAccountName;

  return {
    id: settings._id,
    systemDown: Boolean(settings.systemDown),
    systemMessage: settings.systemMessage || '',
    mpesaPaybill,
    mpesaAccountNumber,
    mpesaAccountName,
    mpesaNumber: mpesaPaybill,
    mpesaName: mpesaAccountName
  };
};

// GET /api/admin/pending-deposits
exports.getPendingDeposits = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        type: 'DEPOSIT',
        status: 'pending'
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('getPendingDeposits error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/admin/pending-withdrawals
exports.getPendingWithdrawals = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        type: 'WITHDRAW',
        status: 'pending'
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, transactions });
  } catch (error) {
    console.error('getPendingWithdrawals error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/admin/withdrawals/:id/approve
exports.approveWithdraw = async (req, res) => {
  try {
    const txId = req.params.id || req.params.txId;
    const tx = await prisma.transaction.findUnique({
      where: { id: txId }
    });
    if (!tx || tx.type !== 'WITHDRAW' || tx.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Invalid transaction' });
    }
    await walletService.confirmWithdrawal(tx.userId, tx.reference);
    res.json({ success: true, message: 'Withdrawal approved successfully' });
  } catch (error) {
    console.error('approveWithdraw error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/admin/withdrawals/:id/reject
exports.rejectWithdraw = async (req, res) => {
  try {
    const txId = req.params.id || req.params.txId;
    const tx = await prisma.transaction.findUnique({
      where: { id: txId }
    });
    if (!tx || tx.type !== 'WITHDRAW' || tx.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Invalid transaction' });
    }
    await walletService.rejectWithdraw(tx.userId, tx.reference);
    res.json({ success: true, message: 'Withdrawal rejected successfully' });
  } catch (error) {
    console.error('rejectWithdraw error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/admin/ledger/:walletId
exports.getLedger = async (req, res) => {
  try {
    const { walletId } = req.params;
    const ledger = await prisma.ledgerEntry.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, ledger });
  } catch (error) {
    console.error('getLedger error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/admin/metrics
exports.getMetrics = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    
    // Total deposits (completed)
    const depositsResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'DEPOSIT', status: 'completed' }
    });
    const totalDeposits = depositsResult._sum.amount ? Number(depositsResult._sum.amount) : 0;

    // Total investments (active catalog project investments from MongoDB)
    let totalInvestmentsAmount = 0;
    let totalInvestmentsCount = 0;
    try {
      const activeInvestments = await UserInvestment.find({ status: 'active' });
      totalInvestmentsCount = activeInvestments.length;
      totalInvestmentsAmount = activeInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    } catch (mongoErr) {
      console.error('MongoDB investments fetch error:', mongoErr);
    }

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalDeposits,
        totalInvestmentsAmount,
        totalInvestmentsCount
      }
    });
  } catch (error) {
    console.error('getMetrics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/admin/settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json({ success: true, settings: toSettingsPayload(settings) });
  } catch (error) {
    console.error('getSettings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/admin/settings
exports.updateSettings = async (req, res) => {
  try {
    const {
      mpesaPaybill,
      mpesaAccountNumber,
      mpesaAccountName,
      mpesaNumber,
      mpesaName,
      systemDown,
      systemMessage
    } = req.body;

    const nextPaybill = firstDefined(mpesaPaybill, mpesaNumber);
    const nextAccountNumber = firstDefined(mpesaAccountNumber);
    const nextAccountName = firstDefined(mpesaAccountName, mpesaName);

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
    }

    if (nextPaybill !== undefined) {
      const value = cleanText(nextPaybill);
      if (!value) return res.status(400).json({ success: false, error: 'Paybill number is required' });
      settings.mpesaPaybill = value;
      settings.mpesaNumber = value;
    }

    if (nextAccountNumber !== undefined) {
      const value = cleanText(nextAccountNumber);
      if (!value) return res.status(400).json({ success: false, error: 'Account number is required' });
      settings.mpesaAccountNumber = value;
    }

    if (nextAccountName !== undefined) {
      const value = cleanText(nextAccountName);
      if (!value) return res.status(400).json({ success: false, error: 'Account name is required' });
      settings.mpesaAccountName = value;
      settings.mpesaName = value;
    }

    if (systemDown !== undefined) settings.systemDown = systemDown;
    if (systemMessage !== undefined) settings.systemMessage = systemMessage;
    
    await settings.save();
    res.json({ success: true, message: 'Settings updated successfully', settings: toSettingsPayload(settings) });
  } catch (error) {
    console.error('updateSettings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
