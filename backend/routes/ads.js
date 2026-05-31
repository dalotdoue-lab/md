/**
 * Ads Routes
 * Handles sponsored content and advertisements
 */

const express = require('express')
const router = express.Router()
const adsController = require('../controllers/adsController')
const { authenticate, requireAdmin } = require('../middleware/auth')

// GET /api/ads - Get active ads
router.get('/', adsController.getAds)

// POST /api/ads - Create ad (admin only)
router.post('/', authenticate, requireAdmin, adsController.createAd)

// GET /api/ads/:id - Get ad by ID (admin only)
router.get('/:id', authenticate, requireAdmin, adsController.getAdById)

// PUT /api/ads/:id - Update ad (admin only)
router.put('/:id', authenticate, requireAdmin, adsController.updateAd)

// DELETE /api/ads/:id - Delete ad (admin only)
router.delete('/:id', authenticate, requireAdmin, adsController.deleteAd)

module.exports = router



