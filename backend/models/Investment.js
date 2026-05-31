const mongoose = require('mongoose')
const s = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  amount: { type: Number, required: true, min: 0 },
  paymentReference: { type: String, required: true, unique: true },
  status: { type: String, default: 'pending', enum: ['pending', 'approved', 'rejected'] },
  acknowledged: { type: Boolean, default: false },
  approvedAt: { type: Date }
}, { timestamps: true })
module.exports = mongoose.models.Investment || mongoose.model('Investment', s)
