/**
 * Transactions Controller
 * Handles transaction history using mock data
 */

const transactionRepository = require('../repositories/transactionRepository');
const companyRepository = require('../repositories/companyRepository');

/**
 * Transactions Controller - Real Database Implementation
 * Uses transactionRepository for all operations
 */

// =====================================================
// Get user's transactions
// =====================================================
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id
    const { type, status, limit = 50, offset = 0 } = req.query

    const result = await transactionRepository.findByUserId(userId, {
      type: type,
      status: status,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      transactions: result.transactions,
      total: result.total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
      message: error.message,
    })
  }
};

// =====================================================
// Get single transaction
// =====================================================
exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const transaction = await transactionRepository.findById(id);
    
    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found',
      })
    }

    res.json({ 
      success: true,
      transaction 
    })
  } catch (error) {
    console.error('Get transaction error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transaction',
      message: error.message,
    })
  }
};



