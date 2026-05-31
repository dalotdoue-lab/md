const mongoose = require('mongoose')
const s = new mongoose.Schema({
  name:    { type: String, default: '' },
  email:   { type: String, default: '' },
  phone:   { type: String, default: '' },
  subject: { type: String, default: '' },
  message: { type: String, default: '' },
}, { timestamps: true })
module.exports = mongoose.models.Message || mongoose.model('Message', s)
