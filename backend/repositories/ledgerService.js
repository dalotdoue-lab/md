/**
 * Ledger Service - Pure Prisma ledgerEntry operations only
 */

const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');

const ledgerService = {
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

  async updateType(id, type) {
    return await prisma.ledgerEntry.update({
      where: { id },
      data: { type }
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

  async findPendingByRefUser(reference, userId, type) {
    return await prisma.ledgerEntry.findFirst({
      where: { 
        reference, 
        type,
        wallet: { userId }
      }
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

module.exports = ledgerService;

