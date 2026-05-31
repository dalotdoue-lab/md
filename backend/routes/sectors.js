/**
 * Sectors Routes
 * Kingstone Investments - Reference data API endpoints
 * 
 * Uses Prisma database via sectorsController
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const sectorsController = require('../controllers/sectorsController');

/**
 * GET /api/sectors - Get all sectors
 */
router.get('/', sectorsController.getAll);

/**
 * GET /api/sectors/:id - Get sector by ID
 */
router.get('/:id', sectorsController.getById);

/**
 * GET /api/sectors/name/:name - Get sector by name
 */
router.get('/name/:name', sectorsController.getByName);

module.exports = router;

