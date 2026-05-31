const mongoose = require('mongoose')

const s = new mongoose.Schema({
  mpesaPaybill: { type: String, default: '400200' },
  mpesaAccountNumber: { type: String, default: 'KINGSTONE' },
  mpesaAccountName: { type: String, default: 'Kingstone Investments' },
  mpesaNumber: { type: String, default: '400200' },
  mpesaName: { type: String, default: 'Kingstone Investments' },
  systemDown: { type: Boolean, default: false },
  systemMessage: { type: String, default: 'System is currently undergoing maintenance. Please try again later.' }
}, { timestamps: true })

module.exports = mongoose.models.SystemSettings || mongoose.model('SystemSettings', s)
