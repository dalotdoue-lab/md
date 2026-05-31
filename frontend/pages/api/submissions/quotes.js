import { connectDB } from '../_lib/mongodb'
import { Quote } from '../_lib/models'
import { requireAdmin } from '../_lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const admin = await requireAdmin(req)
  if (!admin) return res.status(403).json({ error: 'Admin only' })
  await connectDB()
  const data = await Quote.find().sort({ createdAt: -1 })
  res.json({ success: true, data })
}
