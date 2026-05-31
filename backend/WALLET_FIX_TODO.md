# Wallet System Production Hardening - Steps

## Plan Breakdown
1. [ ] Fix schema.prisma corruption - copy schema-fixed.prisma → schema.prisma; run migrate dev + generate
2. [ ] Fix backend/controllers/transactionsController.js - replace mock Map with transactionRepository.findByUserId
3. [ ] Complete M-Pesa callback - routes/wallet.js mpesaCallback → use paymentService.webhookConfirm('mpesa', req.body)
4. [ ] Search project for other mocks (backend/data/mockData.js, controllers, utils)
5. [ ] Add rate limiting to wallet routes
6. [ ] Test deposit/withdraw end-to-end
7. [ ] Final report + verify no mocks

**Status:** Starting
