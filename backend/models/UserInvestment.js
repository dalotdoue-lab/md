const mongoose = require('mongoose')

const s = new mongoose.Schema({
  userId: { type: String, required: true },
  projectId: { type: String, required: true },
  projectTitle: { type: String, required: true },
  amount: { type: Number, required: true },
  reference: { type: String },
  status: { type: String, default: 'pending', enum: ['pending', 'active', 'failed'] },
  growthRate: { type: Number, default: 0.05 } // 5% base growth rate
}, { timestamps: true })

module.exports = mongoose.models.UserInvestment || mongoose.model('UserInvestment', s)
