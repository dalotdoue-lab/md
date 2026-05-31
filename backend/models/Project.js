const mongoose = require('mongoose')
const s = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  category:    { type: String, default: 'Engineering' },
  status:      { type: String, default: 'completed', enum: ['planning','in_progress','completed','on_hold'] },
  client:      { type: String, default: '' },
  progress:    { type: Number, default: 100, min: 0, max: 100 },
  description: { type: String, default: '' },
  details:     { type: String, default: '' },
  image:       { type: String, default: '' },
  price:       { type: Number, default: 0, min: 0 },
  location:    { type: String, default: '' },
  link:        { type: String, default: '' },
  featured:    { type: Boolean, default: false },
  order:       { type: Number, default: 0 },
  dailyEarnings:{ type: Number, default: 0 },
  minInvestment:{ type: Number, default: 0 },
}, { timestamps: true })
module.exports = mongoose.models.Project || mongoose.model('Project', s)
