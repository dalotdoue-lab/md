const mongoose = require('mongoose')
const s = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email:       { type: String, required: true },
  name:        { type: String, default: '' },
  role:        { type: String, default: 'client', enum: ['client', 'admin'] },
  balance:     { type: Number, default: 0 },
  dailyProfit: { type: Number, default: 0 },
  totalInvested:{ type: Number, default: 0 },
}, { timestamps: true })
module.exports = mongoose.models.UserProfile || mongoose.model('UserProfile', s)
