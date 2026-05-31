const mongoose = require('mongoose')
const s = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  category:    { type: String, default: 'Irrigation' },
  price:       { type: Number, default: 0 },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  inStock:     { type: Boolean, default: true },
  featured:    { type: Boolean, default: false },
}, { timestamps: true })
module.exports = mongoose.models.Product || mongoose.model('Product', s)
