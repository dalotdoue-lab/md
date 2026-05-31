/**
 * Market Insights Routes
 * Let Investments - Market insights API endpoints
 * 
 * ============================================================================
 * Uses marketInsightsController for handling logic with mock data
 */

const express = require('express');
const router = express.Router();
const marketInsightsController = require('../controllers/marketInsightsController');
const { authenticate, optionalAuth, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/insights
 * Get all market insights with filters
 * Uses marketInsightsController.getAll
 */
router.get('/', async (req, res) => {
  try {
    await marketInsightsController.getAll(req, res);
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      error: 'Failed to fetch insights',
      message: error.message,
    });
  }
});

/**
 * GET /api/insights/featured
 * Get featured insights
 * Uses marketInsightsController.getFeatured
 */
router.get('/featured', async (req, res) => {
  try {
    await marketInsightsController.getFeatured(req, res);
  } catch (error) {
    console.error('Get featured insights error:', error);
    res.status(500).json({
      error: 'Failed to fetch featured insights',
      message: error.message,
    });
  }
});

/**
 * GET /api/insights/categories
 * Get all categories
 * Uses marketInsightsController.getCategories
 */
router.get('/categories', async (req, res) => {
  try {
    await marketInsightsController.getCategories(req, res);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message,
    });
  }
});

/**
 * GET /api/insights/regions
 * Get all regions for insights
 * Uses marketInsightsController.getRegions
 */
router.get('/regions', async (req, res) => {
  try {
    await marketInsightsController.getRegions(req, res);
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      error: 'Failed to fetch regions',
      message: error.message,
    });
  }
});

/**
 * GET /api/insights/search
 * Search insights - handled by getAll with query params
 */
router.get('/search', async (req, res) => {
  try {
    // Reuse getAll with search query
    await marketInsightsController.getAll(req, res);
  } catch (error) {
    console.error('Search insights error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/insights/category/:category
 * Get insights by category
 * Uses marketInsightsController.getByCategory
 */
router.get('/category/:category', async (req, res) => {
  try {
    await marketInsightsController.getByCategory(req, res);
  } catch (error) {
    console.error('Get insights by category error:', error);
    res.status(500).json({
      error: 'Failed to fetch insights',
      message: error.message,
    });
  }
});

/**
 * GET /api/insights/region/:region
 * Get insights by region
 * Uses marketInsightsController.getByRegion
 */
router.get('/region/:region', async (req, res) => {
  try {
    await marketInsightsController.getByRegion(req, res);
  } catch (error) {
    console.error('Get insights by region error:', error);
    res.status(500).json({
      error: 'Failed to fetch insights',
      message: error.message,
    });
  }
});

/**
 * GET /api/insights/:id
 * Get insight by ID
 * Uses marketInsightsController.getBySlug (checks for id or slug)
 */
router.get('/:id', async (req, res) => {
  try {
    // Try to find by slug first, if not found try as id
    const { id } = req.params;
    
    // Check if it's a slug (contains hyphens or letters)
    if (id.includes('-') || /[a-zA-Z]/.test(id)) {
      await marketInsightsController.getBySlug(req, res);
    } else {
      // Find by id - convert to find by slug for mock data
      req.params.slug = id;
      await marketInsightsController.getBySlug(req, res);
    }
  } catch (error) {
    console.error('Get insight error:', error);
    res.status(500).json({
      error: 'Failed to fetch insight',
      message: error.message,
    });
  }
});

/**
 * GET /api/insights/slug/:slug
 * Get insight by slug
 * Uses marketInsightsController.getBySlug
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    await marketInsightsController.getBySlug(req, res);
  } catch (error) {
    console.error('Get insight by slug error:', error);
    res.status(500).json({
      error: 'Failed to fetch insight',
      message: error.message,
    });
  }
});

// Admin routes - require authentication (mock data - these endpoints return 501)

/**
 * POST /api/insights
 * Create new insight (admin only)
 * Note: Mock data doesn't support creating new insights
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  res.status(501).json({
    error: 'Not implemented',
    message: 'Creating insights is not supported in mock mode',
  });
});

/**
 * PUT /api/insights/:id
 * Update insight (admin only)
 * Note: Mock data doesn't support updating insights
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  res.status(501).json({
    error: 'Not implemented',
    message: 'Updating insights is not supported in mock mode',
  });
});

/**
 * DELETE /api/insights/:id
 * Delete insight (admin only)
 * Note: Mock data doesn't support deleting insights
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  res.status(501).json({
    error: 'Not implemented',
    message: 'Deleting insights is not supported in mock mode',
  });
});

/**
 * POST /api/insights/:id/like
 * Like an insight
 * Note: Mock data doesn't support likes
 */
router.post('/:id/like', async (req, res) => {
  res.status(501).json({
    error: 'Not implemented',
    message: 'Liking insights is not supported in mock mode',
  });
});

module.exports = router;



