const express = require('express')
const router = express.Router()

// Mock quotes data
let quotes = [
  {
    id: '1',
    services: ['Smart Irrigation', 'AI Consulting'],
    projectInfo: {
      name: 'Agricultural AI Project',
      description: 'Smart farming solution',
      budget: '$100,000 - $150,000'
    },
    estimatedCost: '$125,000',
    status: 'pending',
    createdAt: '2024-02-01'
  }
]

// POST /api/quotes - Submit a new quote request
router.post('/', (req, res) => {
  const { services, projectInfo, estimatedCost } = req.body
  
  const newQuote = {
    id: String(quotes.length + 1),
    services: services || [],
    projectInfo: projectInfo || {},
    estimatedCost: estimatedCost || 'To be determined',
    status: 'pending',
    createdAt: new Date().toISOString().split('T')[0]
  }
  
  quotes.push(newQuote)
  
  res.status(201).json({
    success: true,
    quote: newQuote,
    message: 'Quote request submitted successfully'
  })
})

// GET /api/quotes - List all quotes
router.get('/', (req, res) => {
  res.json(quotes)
})

// GET /api/quotes/:id - Get quote details
router.get('/:id', (req, res) => {
  const quote = quotes.find(q => q.id === req.params.id)
  if (quote) {
    res.json(quote)
  } else {
    res.status(404).json({ error: 'Quote not found' })
  }
})

// PUT /api/quotes/:id/status - Update quote status
router.put('/:id/status', (req, res) => {
  const { status } = req.body
  const index = quotes.findIndex(q => q.id === req.params.id)
  
  if (index !== -1) {
    quotes[index].status = status
    res.json(quotes[index])
  } else {
    res.status(404).json({ error: 'Quote not found' })
  }
})

// Calculate estimated cost
router.post('/calculate', (req, res) => {
  const { services, projectSize, duration } = req.body
  
  // Base prices for services
  const servicePrices = {
    'Investment Management': 5000,
    'Engineering Solutions': 8000,
    'AI Consulting': 10000,
    'Smart Irrigation': 15000,
    'Building Automation': 12000,
    'Project Tracking': 3000
  }
  
  // Size multipliers
  const sizeMultipliers = {
    small: 1,
    medium: 1.5,
    large: 2,
    enterprise: 3
  }
  
  let baseCost = 0
  
  if (services && Array.isArray(services)) {
    services.forEach(service => {
      baseCost += servicePrices[service] || 5000
    })
  }
  
  const sizeMultiplier = sizeMultipliers[projectSize] || 1
  const estimatedCost = baseCost * sizeMultiplier
  
  res.json({
    estimatedCost: `$${estimatedCost.toLocaleString()}`,
    breakdown: {
      baseServices: baseCost,
      sizeMultiplier,
      total: estimatedCost
    }
  })
})

module.exports = router



