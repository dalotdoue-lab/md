const express = require('express')
const router = express.Router()
const { firebaseAuth, requireAdmin } = require('../middleware/firebaseAuth')
const UserProfile = require('../models/UserProfile')
const Project = require('../models/Project')
const Investment = require('../models/Investment')
const AdminSettings = require('../models/AdminSettings')

// Helper to get or create settings
async function getSettings() {
  let settings = await AdminSettings.findOne()
  if (!settings) {
    settings = await AdminSettings.create({
      paybill: '174379',
      accountNumber: 'LET-INVEST',
      withdrawalInstructions: 'To withdraw your earnings, contact support or request a withdrawal via support@letinvestments.com.'
    })
  }
  return settings
}

// ── ADMIN ROUTES ──────────────────────────────────────────────────────────

// List all registered clients
router.get('/admin/users', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const users = await UserProfile.find({ role: 'client' }).sort({ createdAt: -1 })
    res.json({ success: true, data: users })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update client metrics (balance, dailyProfit, totalInvested)
router.put('/admin/users/:id', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const { balance, dailyProfit, totalInvested } = req.body
    const user = await UserProfile.findByIdAndUpdate(
      req.params.id,
      { $set: { balance: Number(balance || 0), dailyProfit: Number(dailyProfit || 0), totalInvested: Number(totalInvested || 0) } },
      { new: true }
    )
    if (!user) return res.status(404).json({ error: 'Client not found' })
    res.json({ success: true, data: user })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Get all investments
router.get('/admin/investments', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const investments = await Investment.find()
      .populate('userId', 'email name')
      .populate('projectId', 'title category dailyEarnings')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: investments })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Approve investment
router.put('/admin/investments/:id/approve', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id)
    if (!investment) return res.status(404).json({ error: 'Investment not found' })
    if (investment.status !== 'pending') {
      return res.status(400).json({ error: 'Investment is already processed' })
    }

    investment.status = 'approved'
    investment.approvedAt = new Date()
    await investment.save()

    // Add amount to user's totalInvested, and increase balance by investment amount,
    // plus calculate dailyProfit update if necessary.
    // The requirement says: after admin confirms, client's balance and profit is updated.
    const user = await UserProfile.findById(investment.userId)
    if (user) {
      user.totalInvested = (user.totalInvested || 0) + investment.amount
      // Increment user balance by investment amount (since they paid/invested, it represents their active portfolio assets)
      user.balance = (user.balance || 0) + investment.amount
      
      // Auto-accumulate daily profit rate from project dailyEarnings
      const proj = await Project.findById(investment.projectId)
      if (proj) {
        user.dailyProfit = (user.dailyProfit || 0) + (proj.dailyEarnings || 0)
      }
      await user.save()
    }

    res.json({ success: true, data: investment })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Reject investment
router.put('/admin/investments/:id/reject', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const investment = await Investment.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'rejected' } },
      { new: true }
    )
    if (!investment) return res.status(404).json({ error: 'Investment not found' })
    res.json({ success: true, data: investment })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get admin settings
router.get('/admin/settings', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const settings = await getSettings()
    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Update admin settings
router.put('/admin/settings', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const { paybill, accountNumber, withdrawalInstructions } = req.body
    const settings = await getSettings()
    settings.paybill = paybill || settings.paybill
    settings.accountNumber = accountNumber || settings.accountNumber
    settings.withdrawalInstructions = withdrawalInstructions || settings.withdrawalInstructions
    await settings.save()
    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── CLIENT ROUTES ─────────────────────────────────────────────────────────

// Get client portfolio details and stats
router.get('/client/stats', firebaseAuth, async (req, res) => {
  try {
    const user = await UserProfile.findOne({ firebaseUid: req.user.uid })
    if (!user) return res.status(404).json({ error: 'User profile not found' })
    res.json({
      success: true,
      data: {
        balance: user.balance || 0,
        dailyProfit: user.dailyProfit || 0,
        totalInvested: user.totalInvested || 0,
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create investment request
router.post('/investments', firebaseAuth, async (req, res) => {
  try {
    const { projectId, amount, paymentReference } = req.body
    if (!projectId || !amount || !paymentReference) {
      return res.status(400).json({ error: 'Project, amount, and reference are required' })
    }

    const user = await UserProfile.findOne({ firebaseUid: req.user.uid })
    if (!user) return res.status(404).json({ error: 'UserProfile not found' })

    const project = await Project.findById(projectId)
    if (!project) return res.status(404).json({ error: 'Project not found' })

    if (Number(amount) < (project.minInvestment || 0)) {
      return res.status(400).json({ error: `Amount must be at least the minimum investment of $${project.minInvestment}` })
    }

    const existingRef = await Investment.findOne({ paymentReference: paymentReference.trim() })
    if (existingRef) {
      return res.status(400).json({ error: 'Payment reference already submitted' })
    }

    const investment = await Investment.create({
      userId: user._id,
      projectId: project._id,
      amount: Number(amount),
      paymentReference: paymentReference.trim(),
      status: 'pending',
      acknowledged: false,
    })

    res.status(201).json({ success: true, data: investment })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Check if client has a newly approved, unacknowledged investment
router.get('/investments/unacknowledged', firebaseAuth, async (req, res) => {
  try {
    const user = await UserProfile.findOne({ firebaseUid: req.user.uid })
    if (!user) return res.status(404).json({ error: 'User profile not found' })

    // Find any approved investment where acknowledged is false
    const investment = await Investment.findOne({
      userId: user._id,
      status: 'approved',
      acknowledged: false,
    }).populate('projectId', 'title')

    if (investment) {
      return res.json({ success: true, hasUnacknowledged: true, investment })
    }
    res.json({ success: true, hasUnacknowledged: false })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Acknowledge approved investment
router.post('/investments/:id/acknowledge', firebaseAuth, async (req, res) => {
  try {
    const user = await UserProfile.findOne({ firebaseUid: req.user.uid })
    if (!user) return res.status(404).json({ error: 'UserProfile not found' })

    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      { $set: { acknowledged: true } },
      { new: true }
    )

    if (!investment) return res.status(404).json({ error: 'Investment not found or already acknowledged' })
    res.json({ success: true, data: investment })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get settings (public info for payment & withdrawal instructions)
router.get('/settings', firebaseAuth, async (req, res) => {
  try {
    const settings = await getSettings()
    res.json({
      success: true,
      data: {
        paybill: settings.paybill,
        accountNumber: settings.accountNumber,
        withdrawalInstructions: settings.withdrawalInstructions,
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
