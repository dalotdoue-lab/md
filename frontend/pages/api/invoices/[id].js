import { connectDB } from '../_lib/mongodb'
import { Invoice } from '../_lib/models'
import { requireAdmin } from '../_lib/auth'

export default async function handler(req, res) {
  const admin = await requireAdmin(req)
  if (!admin) return res.status(403).json({ error: 'Admin only' })
  await connectDB()
  const { id } = req.query

  if (req.method === 'PUT') {
    const item = await Invoice.findByIdAndUpdate(id, req.body, { new: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    return res.json({ success: true, data: item })
  }

  if (req.method === 'DELETE') {
    await Invoice.findByIdAndDelete(id)
    return res.json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
