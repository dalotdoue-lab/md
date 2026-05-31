import { connectDB } from '../_lib/mongodb'
import { Project, Material, Product } from '../_lib/models'
import { requireAdmin } from '../_lib/auth'

const MODELS = { projects: Project, materials: Material, products: Product }
const SORT   = { projects: { order: 1, title: 1 }, materials: { name: 1 }, products: { name: 1 } }

export default async function handler(req, res) {
  const { model } = req.query
  const Model = MODELS[model]
  if (!Model) return res.status(404).json({ error: 'Unknown catalog type' })

  await connectDB()

  if (req.method === 'GET') {
    const items = await Model.find().sort(SORT[model] || { createdAt: -1 })
    return res.json({ success: true, data: items })
  }

  if (req.method === 'POST') {
    const admin = await requireAdmin(req)
    if (!admin) return res.status(403).json({ error: 'Admin only' })
    const item = await Model.create(req.body)
    return res.status(201).json({ success: true, data: item })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
