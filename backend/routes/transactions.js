/**
 * Transactions Routes
 * Handles transaction history
 */

const express = require('express')
const router = express.Router()
const walletController = require('../controllers/walletController')
const { authenticate } = require('../middleware/auth')

// GET /api/transactions - Get user's transactions (proxies to walletController)
router.get('/', authenticate, walletController.getTransactions)

module.exports = router



