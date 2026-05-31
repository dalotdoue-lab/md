/**
 * Ads Controller
 * Handles sponsored content using mock data
 */

// In-memory ads storage
const ads = new Map()

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9)

// Initialize with sample ads
const sampleAds = [
  {
    id: '1',
    company_name: 'Safaricom',
    title: 'Invest in Africa\'s Leading Telecom',
    content: 'Safaricom continues to lead mobile innovation across East Africa',
    link: 'https://example.com/safaricom',
    placement: 'homepage',
    is_active: true,
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    created_at: new Date()
  },
  {
    id: '2',
    company_name: 'Standard Bank',
    title: 'Africa\'s Largest Bank',
    content: 'Invest in Standard Bank - Africa\'s banking leader',
    link: 'https://example.com/standardbank',
    placement: 'sidebar',
    is_active: true,
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    created_at: new Date()
  }
]

// Initialize sample ads
sampleAds.forEach(ad => ads.set(ad.id, ad))

// =====================================================
// Get active ads
// =====================================================
exports.getAds = async (req, res) => {
  try {
    const { placement } = req.query
    const now = new Date()

    let activeAds = Array.from(ads.values())
      .filter(ad => {
        return ad.is_active && 
               new Date(ad.start_date) <= now && 
               new Date(ad.end_date) >= now
      })

    if (placement) {
      activeAds = activeAds.filter(ad => ad.placement === placement)
    }

    res.json({ ads: activeAds })
  } catch (error) {
    console.error('Get ads error:', error)
    res.status(500).json({
      error: 'Failed to fetch ads',
      message: error.message,
    })
  }
}

// =====================================================
// Get ad by ID (admin)
// =====================================================
exports.getAdById = async (req, res) => {
  try {
    const { id } = req.params

    const ad = ads.get(id)

    if (!ad) {
      return res.status(404).json({
        error: 'Ad not found',
      })
    }

    res.json({ ad })
  } catch (error) {
    console.error('Get ad error:', error)
    res.status(500).json({
      error: 'Failed to fetch ad',
      message: error.message,
    })
  }
}

// =====================================================
// Create ad (admin)
// =====================================================
exports.createAd = async (req, res) => {
  try {
    const { companyName, title, content, link, placement } = req.body

    if (!companyName || !title || !content) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'companyName, title, and content are required',
      })
    }

    const ad = {
      id: generateId(),
      company_name: companyName,
      title,
      content,
      link: link || null,
      placement: placement || 'homepage',
      is_active: true,
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      created_at: new Date()
    }

    ads.set(ad.id, ad)

    res.status(201).json({
      success: true,
      ad,
    })
  } catch (error) {
    console.error('Create ad error:', error)
    res.status(500).json({
      error: 'Failed to create ad',
      message: error.message,
    })
  }
}

// =====================================================
// Update ad (admin)
// =====================================================
exports.updateAd = async (req, res) => {
  try {
    const { id } = req.params
    const { companyName, title, content, link, placement, isActive } = req.body

    const existing = ads.get(id)
    if (!existing) {
      return res.status(404).json({ error: 'Ad not found' })
    }

    const updated = {
      ...existing,
      company_name: companyName || existing.company_name,
      title: title || existing.title,
      content: content || existing.content,
      link: link !== undefined ? link : existing.link,
      placement: placement || existing.placement,
      is_active: isActive !== undefined ? isActive : existing.is_active
    }

    ads.set(id, updated)

    res.json({
      success: true,
      ad: updated,
    })
  } catch (error) {
    console.error('Update ad error:', error)
    res.status(500).json({
      error: 'Failed to update ad',
      message: error.message,
    })
  }
}

// =====================================================
// Delete ad (admin)
// =====================================================
exports.deleteAd = async (req, res) => {
  try {
    const { id } = req.params

    if (!ads.has(id)) {
      return res.status(404).json({ error: 'Ad not found' })
    }

    ads.delete(id)

    res.json({
      success: true,
      message: 'Ad deleted successfully',
    })
  } catch (error) {
    console.error('Delete ad error:', error)
    res.status(500).json({
      error: 'Failed to delete ad',
      message: error.message,
    })
  }
}


