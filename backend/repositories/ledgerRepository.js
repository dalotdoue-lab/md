// backend/repositories/ledgerRepository.js
const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');

const ledgerRepository = {
  async create(walletId, userId, type, amount, balanceAfter, reference, description = '', metadata = {}) {
    return await prisma.ledgerEntry.create({
      data: {
        walletId,
        userId,
        type,
        amount: new Prisma.Decimal(amount),
        balanceAfter: new Prisma.Decimal(balanceAfter),
        reference,
        description,
        metadata,
      },
    });
  },

  async findByWalletId(walletId, limit = 100, offset = 0) {
    return await prisma.ledgerEntry.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });
  },

  async findByReference(reference) {
    return await prisma.ledgerEntry.findFirst({
      where: { reference },
    });
  },

  async getBalanceHistory(walletId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.ledgerEntry.findMany({
      where: {
        walletId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });
  },
};

module.exports = ledgerRepository;

