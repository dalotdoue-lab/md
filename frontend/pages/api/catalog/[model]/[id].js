import { connectDB } from '../../_lib/mongodb'
import { Project, Material, Product } from '../../_lib/models'
import { requireAdmin } from '../../_lib/auth'

const MODELS = { projects: Project, materials: Material, products: Product }

export default async function handler(req, res) {
  const { model, id } = req.query
  const Model = MODELS[model]
  if (!Model) return res.status(404).json({ error: 'Unknown catalog type' })

  const admin = await requireAdmin(req)
  if (!admin) return res.status(403).json({ error: 'Admin only' })

  await connectDB()

  if (req.method === 'PUT') {
    const item = await Model.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    if (!item) return res.status(404).json({ error: 'Not found' })
    return res.json({ success: true, data: item })
  }

  if (req.method === 'DELETE') {
    const item = await Model.findByIdAndDelete(id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    return res.json({ success: true, message: 'Deleted' })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
