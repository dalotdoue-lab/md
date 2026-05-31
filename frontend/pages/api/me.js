import { verifyToken } from './_lib/firebaseAdmin'
import { getOrCreateProfile } from './_lib/auth'

export default async function handler(req, res) {
  const decoded = await verifyToken(req.headers.authorization)
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })

  const profile = await getOrCreateProfile(decoded)

  if (req.method === 'GET') {
    return res.json({ user: { ...profile.toObject(), id: profile._id } })
  }

  if (req.method === 'POST') {
    const { name } = req.body || {}
    if (name) profile.name = name
    await profile.save()
    return res.json({ user: { ...profile.toObject(), id: profile._id } })
  }

  res.status(405).json({ error: 'Method not allowed' })
}
