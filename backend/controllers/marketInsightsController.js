/**
 * Market Insights Controller
 * Handles market insights using mock data
 */

const { marketInsights } = require('../data/mockData')

// =====================================================
// Get all market insights
// =====================================================
exports.getAll = async (req, res) => {
  try {
    const { category, region, featured, limit = 20, offset = 0 } = req.query

    let filtered = marketInsights.filter(i => i.is_published)

    if (category) {
      filtered = filtered.filter(i => i.category === category)
    }

    if (region) {
      filtered = filtered.filter(i => i.region === region)
    }

    if (featured === 'true') {
      filtered = filtered.filter(i => i.is_featured)
    }

    // Sort by published date
    filtered.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

    // Apply pagination
    const offsetNum = parseInt(offset)
    const limitNum = parseInt(limit)
    const paginated = filtered.slice(offsetNum, offsetNum + limitNum)

    res.json({
      insights: paginated,
      total: filtered.length,
      limit: limitNum,
      offset: offsetNum,
    })
  } catch (error) {
    console.error('Get insights error:', error)
    res.status(500).json({
      error: 'Failed to fetch insights',
      message: error.message,
    })
  }
}

// =====================================================
// Get featured insights
// =====================================================
exports.getFeatured = async (req, res) => {
  try {
    const insights = marketInsights
      .filter(i => i.is_featured && i.is_published)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

    res.json({ insights })
  } catch (error) {
    console.error('Get featured insights error:', error)
    res.status(500).json({
      error: 'Failed to fetch featured insights',
      message: error.message,
    })
  }
}

// =====================================================
// Get insights by slug
// =====================================================
exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const insight = marketInsights.find(i => i.slug === slug)

    if (!insight) {
      return res.status(404).json({
        error: 'Insight not found',
      })
    }

    res.json({ insight })
  } catch (error) {
    console.error('Get insight error:', error)
    res.status(500).json({
      error: 'Failed to fetch insight',
      message: error.message,
    })
  }
}

// =====================================================
// Get insights by category
// =====================================================
exports.getByCategory = async (req, res) => {
  try {
    const { category } = req.params

    const insights = marketInsights
      .filter(i => i.category === category && i.is_published)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

    res.json({ insights })
  } catch (error) {
    console.error('Get insights by category error:', error)
    res.status(500).json({
      error: 'Failed to fetch insights',
      message: error.message,
    })
  }
}

// =====================================================
// Get insights by region
// =====================================================
exports.getByRegion = async (req, res) => {
  try {
    const { region } = req.params

    const insights = marketInsights
      .filter(i => i.region === region && i.is_published)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))

    res.json({ insights })
  } catch (error) {
    console.error('Get insights by region error:', error)
    res.status(500).json({
      error: 'Failed to fetch insights',
      message: error.message,
    })
  }
}

// =====================================================
// Get all categories
// =====================================================
exports.getCategories = async (req, res) => {
  try {
    const categories = [...new Set(marketInsights.map(i => i.category))]
    res.json({ categories })
  } catch (error) {
    console.error('Get categories error:', error)
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message,
    })
  }
}

// =====================================================
// Get all regions for insights
// =====================================================
exports.getRegions = async (req, res) => {
  try {
    const regions = [...new Set(marketInsights.map(i => i.region).filter(Boolean))]
    res.json({ regions })
  } catch (error) {
    console.error('Get regions error:', error)
    res.status(500).json({
      error: 'Failed to fetch regions',
      message: error.message,
    })
  }
}


