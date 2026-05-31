/**
 * Wallet Service - Business logic layer
 * Calls pure walletRepository + ledgerService
 * Preserves exact API contract
 */

const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

const walletRepository = require('../repositories/walletRepository');
const ledgerService = require('../repositories/ledgerService');
const websocketService = require('../services/websocketService');

const walletService = {

  async findByUserId(userId) {
    return await walletRepository.findByUserId(userId);
  },

  async create(userId, currency = 'USD') {
    return await prisma.$transaction(async (tx) => {

      const wallet = await tx.wallet.create({
        data: {
          userId,
          balance: new Prisma.Decimal(0),
          pendingBalance: new Prisma.Decimal(0),
          lockedBalance: new Prisma.Decimal(0),
          currency,
          status: 'active',
        },
      });

      await ledgerService.create(
        wallet.id,
        userId,
        'SYSTEM_INIT',
        0,
        0,
        `WALLET_CREATE_${wallet.id}`,
        'Wallet initialized'
      );

      return wallet;
    });
  },

  async getTransactions(userId) {
    const transactionRepository = require('../repositories/transactionRepository');
    return await transactionRepository.findByUserId(userId);
  },

  async getStatus(reference, userId) {
    const transaction = await prisma.transaction.findFirst({
      where: { reference, userId }
    });
    if (!transaction) return null;
    return {
      transaction,
      status: transaction.status
    };
  },

  async pendingDeposit(userId, amount, reference, description = 'Deposit initiated') {
    return await prisma.$transaction(async (tx) => {

      const wallet = await walletRepository.findByUserIdOrThrow(
        userId,
        { id: true, pendingBalance: true, userId: true }
      );

      const newPending = new Prisma.Decimal(wallet.pendingBalance).plus(amount);

      const updatedWallet = await walletRepository.updateByUserId(userId, {
        pendingBalance: newPending
      });

      await ledgerService.create(
        updatedWallet.id,
        updatedWallet.userId,
        'PENDING_CREDIT',
        amount,
        newPending,
        reference,
        description
      );

      // Auto-create/sync Transaction
      let transaction = await tx.transaction.findUnique({
        where: { reference }
      });
      if (!transaction) {
        let provider = 'demo';
        if (description && description.includes('via ')) {
          provider = description.split('via ')[1];
        }
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            userId,
            type: 'DEPOSIT',
            amount: new Prisma.Decimal(amount),
            netAmount: new Prisma.Decimal(amount),
            reference,
            provider,
            status: 'pending',
            requiresApproval: true,
            description
          }
        });
      }

      return updatedWallet;
    });
  },

  async confirmDeposit(userId, reference) {
    return await prisma.$transaction(async (tx) => {

      const pendingLedger = await tx.ledgerEntry.findFirst({
        where: { reference, type: 'PENDING_CREDIT', wallet: { userId } },
        select: { id: true, amount: true }
      });

      if (!pendingLedger) throw new Error('Pending deposit not found');

      const wallet = await walletRepository.findByUserIdOrThrow(
        userId,
        { id: true, balance: true, pendingBalance: true, userId: true }
      );

      const amount = pendingLedger.amount;

      const newBalance = new Prisma.Decimal(wallet.balance).plus(amount);
      const newPending = new Prisma.Decimal(wallet.pendingBalance).minus(amount);

      const updatedWallet = await walletRepository.updateByUserId(userId, {
        balance: newBalance,
        pendingBalance: newPending
      });

      await tx.ledgerEntry.update({
        where: { id: pendingLedger.id },
        data: { type: 'CREDIT' }
      });

      await ledgerService.create(
        updatedWallet.id,
        updatedWallet.userId,
        'CREDIT',
        amount,
        updatedWallet.balance,
        reference,
        'Deposit confirmed'
      );

      // Update transaction status to completed
      await tx.transaction.update({
        where: { reference },
        data: { status: 'completed', completedAt: new Date() }
      });

      // Sync MongoDB user investment if exists
      try {
        const UserInvestment = require('../models/UserInvestment');
        await UserInvestment.updateOne(
          { reference, userId },
          { status: 'active' }
        );
      } catch (mongoErr) {
        console.error('Failed to update MongoDB user investment on confirmDeposit:', mongoErr);
      }

      try {
        websocketService.notifyTransaction(userId, {
          type: 'deposit_confirmed',
          reference,
          amount: Number(amount)
        });
      } catch (e) {
        console.warn('[WS] Notification failed:', e.message);
      }

      return updatedWallet;
    });
  },

  async rejectDeposit(userId, reference) {
    return await prisma.$transaction(async (tx) => {
      const pendingLedger = await tx.ledgerEntry.findFirst({
        where: { reference, type: 'PENDING_CREDIT', wallet: { userId } },
        select: { amount: true }
      });

      if (!pendingLedger) throw new Error('Pending deposit not found');

      const wallet = await walletRepository.findByUserIdOrThrow(
        userId,
        { pendingBalance: true, balance: true, id: true }
      );

      const amount = pendingLedger.amount;

      const newPending = new Prisma.Decimal(wallet.pendingBalance).minus(amount);

      const updatedWallet = await walletRepository.updateByUserId(userId, {
        pendingBalance: newPending
      });

      await ledgerService.create(
        wallet.id,
        userId,
        'REJECTED_CREDIT',
        amount,
        wallet.balance,
        reference,
        'Deposit rejected'
      );

      // Update transaction status to failed
      await tx.transaction.update({
        where: { reference },
        data: { status: 'failed', failedAt: new Date() }
      });

      // Sync MongoDB user investment if exists
      try {
        const UserInvestment = require('../models/UserInvestment');
        await UserInvestment.updateOne(
          { reference, userId },
          { status: 'failed' }
        );
      } catch (mongoErr) {
        console.error('Failed to update MongoDB user investment on rejectDeposit:', mongoErr);
      }

      return updatedWallet;
    });
  },

  async pendingWithdrawal(userId, amount, reference, description = 'Withdrawal pending') {
    return await prisma.$transaction(async (tx) => {

      const wallet = await walletRepository.findByUserIdOrThrow(
        userId,
        { id: true, pendingBalance: true, balance: true, userId: true }
      );

      const newPending = new Prisma.Decimal(wallet.pendingBalance).plus(amount);

      const updatedWallet = await walletRepository.updateByUserId(userId, {
        pendingBalance: newPending
      });

      await ledgerService.create(
        updatedWallet.id,
        updatedWallet.userId,
        'PENDING_DEBIT',
        amount,
        wallet.balance,
        reference,
        description
      );

      // Auto-create/sync Transaction
      let transaction = await tx.transaction.findUnique({
        where: { reference }
      });
      if (!transaction) {
        let provider = 'bank';
        if (description && description.includes('via ')) {
          provider = description.split('via ')[1];
        }
        await tx.transaction.create({
          data: {
            walletId: wallet.id,
            userId,
            type: 'WITHDRAW',
            amount: new Prisma.Decimal(amount),
            netAmount: new Prisma.Decimal(amount),
            reference,
            provider,
            status: 'pending',
            requiresApproval: true,
            description
          }
        });
      }

      return updatedWallet;
    });
  },

  async confirmWithdrawal(userId, reference) {
    return await prisma.$transaction(async (tx) => {

      const pendingLedger = await tx.ledgerEntry.findFirst({
        where: { reference, type: 'PENDING_DEBIT', wallet: { userId } },
        select: { id: true, amount: true }
      });

      if (!pendingLedger) throw new Error('Pending withdrawal not found');

      const wallet = await walletRepository.findByUserIdOrThrow(
        userId,
        { id: true, balance: true, pendingBalance: true, userId: true }
      );

      const amount = pendingLedger.amount;

      const newBalance = new Prisma.Decimal(wallet.balance).minus(amount);
      const newPending = new Prisma.Decimal(wallet.pendingBalance).minus(amount);

      const updatedWallet = await walletRepository.updateByUserId(userId, {
        balance: newBalance,
        pendingBalance: newPending
      });

      await tx.ledgerEntry.update({
        where: { id: pendingLedger.id },
        data: { type: 'DEBIT' }
      });

      await ledgerService.create(
        updatedWallet.id,
        updatedWallet.userId,
        'DEBIT',
        amount,
        updatedWallet.balance,
        reference,
        'Withdrawal confirmed'
      );

      // Update transaction status to completed
      await tx.transaction.update({
        where: { reference },
        data: { status: 'completed', completedAt: new Date() }
      });

      return updatedWallet;
    });
  },

  async confirmWithdraw(userId, reference) {
    return await this.confirmWithdrawal(userId, reference);
  },

  async rejectWithdraw(userId, reference) {
    return await prisma.$transaction(async (tx) => {

      const pendingLedger = await tx.ledgerEntry.findFirst({
        where: { reference, type: 'PENDING_DEBIT', wallet: { userId } },
        select: { amount: true }
      });

      if (!pendingLedger) throw new Error('Pending withdrawal not found');

      const wallet = await walletRepository.findByUserIdOrThrow(
        userId,
        { pendingBalance: true, balance: true, id: true }
      );

      const amount = pendingLedger.amount;

      const newPending = new Prisma.Decimal(wallet.pendingBalance).minus(amount);

      const updatedWallet = await walletRepository.updateByUserId(userId, {
        pendingBalance: newPending
      });

      await ledgerService.create(
        wallet.id,
        userId,
        'REJECTED_DEBIT',
        amount,
        wallet.balance,
        reference,
        'Withdrawal rejected'
      );

      // Update transaction status to failed
      await tx.transaction.update({
        where: { reference },
        data: { status: 'failed', failedAt: new Date() }
      });

      return updatedWallet;
    });
  },

  async getAvailableBalance(userId) {
    return await walletRepository.getAvailableBalance(userId);
  },

  async investFromWallet(userId, amount, reference, description = 'Investment payment') {
    return await prisma.$transaction(async (tx) => {
      const wallet = await walletRepository.findByUserIdOrThrow(
        userId,
        { id: true, balance: true, pendingBalance: true, userId: true }
      );

      const bal = new Prisma.Decimal(wallet.balance);
      const amt = new Prisma.Decimal(amount);
      if (bal.lessThan(amt)) {
        throw new Error('Insufficient balance');
      }

      const newBalance = bal.minus(amt);
      const updatedWallet = await walletRepository.updateByUserId(userId, {
        balance: newBalance
      });

      await ledgerService.create(
        updatedWallet.id,
        updatedWallet.userId,
        'DEBIT',
        amount,
        updatedWallet.balance,
        reference,
        description
      );

      // Create completed Transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: 'BUY',
          amount: amt,
          netAmount: amt,
          reference,
          provider: 'wallet',
          status: 'completed',
          requiresApproval: false,
          description,
          completedAt: new Date()
        }
      });

      return updatedWallet;
    });
  }

};

module.exports = walletService;