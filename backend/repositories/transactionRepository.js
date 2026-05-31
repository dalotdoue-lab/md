// backend/repositories/transactionRepository.js
const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');

const transactionRepository = {
  async findByUserId(userId, filters = {}) {
    const { type, status, limit = 50, offset = 0 } = filters;
    const where = { userId };
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { company: { select: { id: true, name: true, symbol: true } } },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total };
  },

  async findById(id) {
    return await prisma.transaction.findUnique({
      where: { id },
      include: {
        company: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async findByReference(reference) {
    return await prisma.transaction.findUnique({
      where: { reference },
      include: { company: true },
    });
  },

  async create(data) {
    const netAmount = new Prisma.Decimal(data.amount);
    
    return await prisma.transaction.create({
      data: {
        walletId: data.walletId,
        userId: data.userId,
        type: data.type,
        amount: new Prisma.Decimal(data.amount),
        netAmount: netAmount,
        reference: data.reference,
        provider: data.provider || null,
        status: data.status || 'pending',
        metadata: data.metadata || {},
        requiresApproval: data.requiresApproval || false
      },
      include: { company: true },
    });
  },

  async complete(id) {
    return await prisma.transaction.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
      include: { company: true },
    });
  },

  async fail(id, reason) {
    return await prisma.transaction.update({
      where: { id },
      data: { status: 'failed', failedAt: new Date(), metadata: { failureReason: reason } },
    });
  },

  async updateProviderRef(id, provider, providerRef) {
    return await prisma.transaction.update({
      where: { id },
      data: { 
        provider,
        providerReference: providerRef
      }
    });
  },

  async findPendingByReference(reference) {
    return await prisma.transaction.findFirst({
      where: { 
        reference,
        status: 'pending'
      },
      include: { 
        wallet: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });
  },

  async getPendingByUser(userId) {
    return await prisma.transaction.findMany({
      where: { 
        userId,
        status: 'pending'
      },
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async getSummary(userId, periodDays = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const transactions = await prisma.transaction.findMany({
      where: { userId, status: 'completed', createdAt: { gte: startDate } },
    });

    const summary = { deposits: 0, withdrawals: 0, investments: 0, divestments: 0, fees: 0 };
    for (const tx of transactions) {
      switch (tx.type) {
        case 'DEPOSIT': summary.deposits += Number(tx.amount); break;
        case 'WITHDRAW': summary.withdrawals += Number(tx.amount); break;
        case 'BUY': summary.investments += Number(tx.amount); break;
        case 'SELL': summary.divestments += Number(tx.amount); break;
        case 'FEE': summary.fees += Number(tx.amount); break;
      }
    }

    return summary;
  },

  async getRecent(userId, limit = 10) {
    return await prisma.transaction.findMany({
      where: { userId },
      include: { company: { select: { id: true, name: true, symbol: true } } },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  },
};

module.exports = transactionRepository;
