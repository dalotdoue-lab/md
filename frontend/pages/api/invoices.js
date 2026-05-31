import { connectDB } from './_lib/mongodb'
import { Invoice } from './_lib/models'
import { requireAdmin } from './_lib/auth'

export default async function handler(req, res) {
  const admin = await requireAdmin(req)
  if (!admin) return res.status(403).json({ error: 'Admin only' })
  await connectDB()

  if (req.method === 'GET') {
    const data = await Invoice.find().sort({ createdAt: -1 })
    return res.json({ success: true, data })
  }

  if (req.method === 'POST') {
    const item = await Invoice.create(req.body)
    return res.status(201).json({ success: true, data: item })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
