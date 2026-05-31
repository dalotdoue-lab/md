const prisma = require('../lib/prisma');
const walletService = require('../services/walletService');

/**
 * GET /api/admin/transactions - Get all transactions (admin)
 */
exports.getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type, userId, flagged = false, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};

    if (status && status !== 'all') where.status = status;
    if (type && type !== 'all') where.type = type;
    if (userId) where.userId = userId;
    if (flagged === 'true') where.flagged = true;

    if (search) {
      where.OR = [
        { reference: { contains: search } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          wallet: true,
          company: { select: { name: true, symbol: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/admin/transactions/:id/flag - Flag suspicious transaction
 */
exports.flagTransaction = async (req, res) => {
  try {
    const txId = req.params.id;
    const { flagged, reason } = req.body;

    const tx = await prisma.transaction.update({
      where: { id: txId },
      data: {
        flagged: flagged !== false,
        flagReason: flagged ? reason : null,
        flaggedAt: flagged ? new Date() : null
      },
      include: { user: { select: { name: true, email: true } } }
    });

    res.json({
      success: true,
      message: flagged ? 'Transaction flagged for review' : 'Flag removed',
      transaction: tx
    });
  } catch (error) {
    console.error('Flag transaction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/admin/transactions/:id/approve - Approve pending transaction
 */
exports.approveTransaction = async (req, res) => {
  try {
    const txId = req.params.id;

    const tx = await prisma.transaction.findUnique({
      where: { id: txId }
    });

    if (!tx || tx.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Only pending transactions can be approved' });
    }

    if (tx.type === 'DEPOSIT') {
      await walletService.confirmDeposit(tx.userId, tx.reference);
    } else if (tx.type === 'WITHDRAW') {
      await walletService.confirmWithdrawal(tx.userId, tx.reference);
    } else {
      // General completion fallback
      await prisma.transaction.update({
        where: { id: txId },
        data: {
          status: 'completed',
          processedAt: new Date(),
          adminId: req.user.id
        }
      });
    }

    res.json({ success: true, message: 'Transaction approved successfully' });
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/admin/transactions/:id/reject - Reject pending transaction
 */
exports.rejectTransaction = async (req, res) => {
  try {
    const txId = req.params.id;

    const tx = await prisma.transaction.findUnique({
      where: { id: txId }
    });

    if (!tx || tx.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'Only pending transactions can be rejected' });
    }

    if (tx.type === 'DEPOSIT') {
      await walletService.rejectDeposit(tx.userId, tx.reference);
    } else if (tx.type === 'WITHDRAW') {
      await walletService.rejectWithdraw(tx.userId, tx.reference);
    } else {
      // General failed fallback
      await prisma.transaction.update({
        where: { id: txId },
        data: {
          status: 'failed',
          processedAt: new Date(),
          failedAt: new Date()
        }
      });
    }

    res.json({ success: true, message: 'Transaction rejected successfully' });
  } catch (error) {
    console.error('Reject transaction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/admin/transactions/summary - Transaction summary stats
 */
exports.getTransactionSummary = async (req, res) => {
  try {
    const { period = 30 } = req.query;

    const stats = await prisma.transaction.groupBy({
      by: ['status', 'type'],
      where: {
        createdAt: {
          gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)
        }
      },
      _count: { id: true },
      _sum: { amount: true }
    });

    const flaggedCount = await prisma.transaction.count({
      where: { flagged: true }
    });

    res.json({
      success: true,
      stats,
      flaggedCount,
      totalVolume: await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' }
      })
    });
  } catch (error) {
    console.error('Transaction summary error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

