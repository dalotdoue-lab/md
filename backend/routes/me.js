const express = require('express')
const router = express.Router()
const { firebaseAuth } = require('../middleware/firebaseAuth')
const UserProfile = require('../models/UserProfile')

router.get('/', firebaseAuth, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ firebaseUid: req.user.uid })
    res.json({ success: true, user: profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', firebaseAuth, async (req, res) => {
  try {
    const { name } = req.body
    const profile = await UserProfile.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $set: { name: name || req.user.email, email: req.user.email } },
      { new: true, upsert: true }
    )
    res.json({ success: true, user: profile })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
