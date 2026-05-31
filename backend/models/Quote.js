const mongoose = require('mongoose')
const s = new mongoose.Schema({
  name:            { type: String, default: '' },
  email:           { type: String, default: '' },
  phone:           { type: String, default: '' },
  services:        [String],
  description:     { type: String, default: '' },
  estimatedBudget: { type: String, default: '' },
  status:          { type: String, default: 'new' },
}, { timestamps: true })
module.exports = mongoose.models.Quote || mongoose.model('Quote', s)
