/**
 * Watchlist Controller
 * Handles user's watchlist using mock data
 */

const { companies } = require('../data/mockData')

// In-memory watchlist storage
const watchlist = new Map()

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9)

// =====================================================
// Get user's watchlist
// =====================================================
exports.getWatchlist = async (req, res) => {
  try {
    const userId = req.user.id

    const userWatchlist = Array.from(watchlist.values())
      .filter(w => w.user_id === userId)
      .map(w => {
        const company = companies.find(c => c.id === w.company_id)
        return {
          ...w,
          company
        }
      })

    res.json({ watchlist: userWatchlist })
  } catch (error) {
    console.error('Get watchlist error:', error)
    res.status(500).json({
      error: 'Failed to fetch watchlist',
      message: error.message,
    })
  }
}

// =====================================================
// Add company to watchlist
// =====================================================
exports.addToWatchlist = async (req, res) => {
  try {
    const { companyId } = req.body
    const userId = req.user.id

    if (!companyId) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'companyId is required',
      })
    }

    // Check if company exists
    const company = companies.find(c => c.id === companyId)
    if (!company) {
      return res.status(404).json({
        error: 'Company not found',
      })
    }

    // Check if already in watchlist
    const existing = Array.from(watchlist.values())
      .find(w => w.user_id === userId && w.company_id === companyId)

    if (existing) {
      return res.status(400).json({
        error: 'Already in watchlist',
        message: 'This company is already in your watchlist',
      })
    }

    // Add to watchlist
    const watchlistItem = {
      id: generateId(),
      user_id: userId,
      company_id: companyId,
      created_at: new Date()
    }

    watchlist.set(watchlistItem.id, watchlistItem)

    res.json({
      success: true,
      message: 'Added to watchlist',
      watchlist: {
        ...watchlistItem,
        company
      }
    })
  } catch (error) {
    console.error('Add to watchlist error:', error)
    res.status(500).json({
      error: 'Failed to add to watchlist',
      message: error.message,
    })
  }
}

// =====================================================
// Remove company from watchlist
// =====================================================
exports.removeFromWatchlist = async (req, res) => {
  try {
    const { companyId } = req.params
    const userId = req.user.id

    // Find in watchlist
    const existing = Array.from(watchlist.values())
      .find(w => w.user_id === userId && w.company_id === companyId)

    if (!existing) {
      return res.status(404).json({
        error: 'Not in watchlist',
        message: 'This company is not in your watchlist',
      })
    }

    // Remove from watchlist
    watchlist.delete(existing.id)

    res.json({
      success: true,
      message: 'Removed from watchlist',
    })
  } catch (error) {
    console.error('Remove from watchlist error:', error)
    res.status(500).json({
      error: 'Failed to remove from watchlist',
      message: error.message,
    })
  }
}


