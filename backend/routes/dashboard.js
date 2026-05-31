const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')

// GET /api/dashboard/stats
router.get('/stats', (req, res) => {
  res.json({
    activeProjects: 3,
    completedProjects: 12,
    pendingInvoices: 2,
    totalInvestment: '$2.5B+',
    annualReturn: '18.5%',
    yearsExperience: '15+'
  })
})

// GET /api/dashboard/projects
router.get('/projects', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Smart Irrigation System',
      status: 'in_progress',
      progress: 65,
      nextMilestone: 'Sensor Installation',
      dueDate: '2024-03-15'
    },
    {
      id: '2',
      title: 'Building Automation',
      status: 'completed',
      progress: 100,
      nextMilestone: 'Final Handover',
      dueDate: '2024-01-30'
    },
    {
      id: '3',
      title: 'AI Analytics Platform',
      status: 'in_progress',
      progress: 40,
      nextMilestone: 'Data Integration',
      dueDate: '2024-03-20'
    }
  ])
})

// GET /api/dashboard/invoices
router.get('/invoices', (req, res) => {
  res.json([
    {
      id: 'INV-001',
      project: 'Smart Irrigation System',
      amount: '$45,000',
      status: 'pending',
      dueDate: '2024-03-01'
    },
    {
      id: 'INV-002',
      project: 'AI Analytics Platform',
      amount: '$30,000',
      status: 'paid',
      dueDate: '2024-02-15'
    },
    {
      id: 'INV-003',
      project: 'Building Automation',
      amount: '$85,000',
      status: 'paid',
      dueDate: '2024-01-30'
    }
  ])
})

// GET /api/dashboard/tasks
router.get('/tasks', (req, res) => {
  res.json([
    { id: '1', title: 'Review project proposal', status: 'completed', priority: 'high' },
    { id: '2', title: 'Approve design specifications', status: 'in_progress', priority: 'high' },
    { id: '3', title: 'Schedule client meeting', status: 'pending', priority: 'medium' },
    { id: '4', title: 'Review invoice', status: 'pending', priority: 'medium' }
  ])
})

// GET portfolio (Prisma version)
router.get('/portfolio/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { virtualBalance: true, name: true }
    })

    const investments = await prisma.investment.findMany({
      where: { userId },
      include: {
        company: true
      }
    })

    let totalInvested = 0
    let currentPortfolioValue = 0

    const holdings = investments.map(inv => {
      const investmentValue = inv.shares * inv.buyPrice
      const currentValue = inv.shares * (inv.company?.currentPrice || 0)
      const gainLoss = currentValue - investmentValue

      totalInvested += investmentValue
      currentPortfolioValue += currentValue

      return {
        company: inv.company,
        shares: inv.shares,
        current_value: currentValue,
        gain_loss: gainLoss,
        purchase_date: inv.createdAt
      }
    })

    const totalGainLoss = currentPortfolioValue - totalInvested

    res.json({
      virtual_balance: user?.virtualBalance || 10000,
      total_invested: totalInvested,
      current_value: currentPortfolioValue,
      total_gain_loss: totalGainLoss,
      total_gain_loss_percent: totalInvested > 0 
        ? (totalGainLoss / totalInvested) * 100 
        : 0,
      holdings: holdings.slice(0, 5)
    })

  } catch (error) {
    console.error('Portfolio error:', error)

    res.json({
      virtual_balance: 10000,
      total_invested: 0,
      current_value: 0,
      total_gain_loss: 0,
      total_gain_loss_percent: 0,
      holdings: []
    })
  }
})

// Virtual Balance
router.get('/virtual-balance/:userId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: { virtualBalance: true }
    })

    res.json({
      virtual_balance: user?.virtualBalance || 10000,
      initialized: !!user
    })

  } catch (error) {
    res.json({
      virtual_balance: 10000,
      initialized: false
    })
  }
})

module.exports = router