const mongoose = require('mongoose')
const s = new mongoose.Schema({
  paybill: { type: String, default: '174379' },
  accountNumber: { type: String, default: 'LET-INVEST' },
  withdrawalInstructions: { type: String, default: 'To withdraw your earnings, contact support or request a withdrawal via support@letinvestments.com.' }
}, { timestamps: true })
module.exports = mongoose.models.AdminSettings || mongoose.model('AdminSettings', s)
