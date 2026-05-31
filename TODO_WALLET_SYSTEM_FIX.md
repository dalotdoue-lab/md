# Withdrawal System Fix - Progress Tracker

**Plan per specs (approved via feedback)**

**Information Gathered:**
- walletController.js: exports.withdraw uses pendingWithdraw (approval flow)
- transactionRepository.js needed for create tx
- Need instant withdrawal with atomic $transaction
- Frontend WithdrawModal.js for UI
- NO M-Pesa changes

**Detailed Update Plan:**
1. **walletController.js**: Rewrite exports.withdraw with validation, balance check, Prisma.$transaction (deduct + create completed tx)
2. **transactionRepository.js**: Ensure createTransaction supports 'withdrawal' type, status: 'completed'
3. **utils/serializePrisma.js**: Verify Number() conversion for Decimal
4. **frontend/components/wallet/WithdrawModal.js**: Fix payload/error handling
5. **routes/wallet.js**: Ensure middleware auth/validation

**Dependent Files:**
- backend/controllers/walletController.js 
- backend/repositories/transactionRepository.js
- backend/utils/serializePrisma.js
- frontend/components/wallet/WithdrawModal.js

**Follow-up Steps:**
1. Implement backend changes
2. Test withdrawal API with curl
3. Restart backend `cd backend && npm start`
4. Test frontend withdraw modal
5. Verify no M-Pesa changes

**Status:** Ready to read files and implement
