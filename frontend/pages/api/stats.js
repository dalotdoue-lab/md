import { connectDB } from './_lib/mongodb'
import { SiteStats } from './_lib/models'
import { requireAdmin } from './_lib/auth'

const DEFAULTS = {
  activeProjects:     '5',
  completedProjects:  '12',
  pendingQuotes:      '3',
  totalInvestment:    '$2.5M',
}

export default async function handler(req, res) {
  await connectDB()

  if (req.method === 'GET') {
    const docs = await SiteStats.find()
    const stats = { ...DEFAULTS }
    docs.forEach(d => { stats[d.key] = d.value })
    return res.json({ success: true, data: stats })
  }

  if (req.method === 'PUT') {
    const admin = await requireAdmin(req)
    if (!admin) return res.status(403).json({ error: 'Admin only' })
    const updates = req.body
    await Promise.all(
      Object.entries(updates).map(([key, value]) =>
        SiteStats.findOneAndUpdate({ key }, { value }, { upsert: true, new: true })
      )
    )
    return res.json({ success: true })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
