/**
 * Wallet Repository - Pure Prisma wallet operations ONLY
 */

const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');

const walletRepository = {

  /**
   * Find wallet by user ID
   */
  async findByUserId(userId, select = null) {
    return await prisma.wallet.findUnique({
      where: { userId },
      ...(select && { select })
    });
  },

  /**
   * Create new wallet
   */
  async create(data) {
    return await prisma.wallet.create({
      data
    });
  },

  /**
   * Update wallet by user ID
   */
  async updateByUserId(userId, data, select = null) {
    return await prisma.wallet.update({
      where: { userId },
      data,
      ...(select && { select })
    });
  },

  /**
   * Find wallet or throw
   */
  async findByUserIdOrThrow(userId, select = null) {
    return await prisma.wallet.findUniqueOrThrow({
      where: { userId },
      ...(select && { select })
    });
  },

  /**
   * Get available balance
   * balance - pendingBalance - lockedBalance
   */
  async getAvailableBalance(userId) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        balance: true,
        pendingBalance: true,
        lockedBalance: true
      }
    });

    if (!wallet) return new Prisma.Decimal(0);

    return new Prisma.Decimal(wallet.balance)
      .minus(new Prisma.Decimal(wallet.pendingBalance || 0))
      .minus(new Prisma.Decimal(wallet.lockedBalance || 0));
  }

};

module.exports = walletRepository;