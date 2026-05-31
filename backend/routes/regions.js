/**
 * Regions Routes
 * Handles region-related operations
 */

const express = require('express')
const router = express.Router()
const regionsController = require('../controllers/regionsController')

// GET /api/regions - Get all regions
router.get('/', regionsController.getAll)

// GET /api/regions/:id - Get region by ID
router.get('/:id', regionsController.getById)

module.exports = router



