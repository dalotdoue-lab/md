const express = require('express')
const router = express.Router()
const { firebaseAuth, requireAdmin } = require('../middleware/firebaseAuth')
const Quote = require('../models/Quote')
const Message = require('../models/Message')

// Quotes
router.post('/quotes', async (req, res) => {
  try {
    const quote = await Quote.create(req.body)
    res.status(201).json({ success: true, data: quote })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.get('/quotes', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 })
    res.json({ success: true, data: quotes })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Messages
router.post('/messages', async (req, res) => {
  try {
    const msg = await Message.create(req.body)
    res.status(201).json({ success: true, data: msg })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.get('/messages', firebaseAuth, requireAdmin, async (req, res) => {
  try {
    const msgs = await Message.find().sort({ createdAt: -1 })
    res.json({ success: true, data: msgs })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
