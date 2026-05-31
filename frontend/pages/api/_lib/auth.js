import { verifyToken } from './firebaseAdmin'
import { connectDB } from './mongodb'
import { UserProfile } from './models'
import { isAdminEmail } from '../../../lib/adminAuth'

export async function getOrCreateProfile(decoded) {
  await connectDB()
  const isAdmin = isAdminEmail(decoded.email, process.env.ADMIN_EMAILS)
  const syncedRole = isAdmin ? 'admin' : 'client'

  let profile = await UserProfile.findOne({ firebaseUid: decoded.uid })
  if (!profile) {
    profile = await UserProfile.create({
      firebaseUid: decoded.uid,
      email: decoded.email || '',
      name: decoded.name || '',
      role: syncedRole,
    })
  } else if (profile.role !== syncedRole) {
    profile.role = syncedRole
    await profile.save()
  }
  return profile
}

export async function requireAdmin(req) {
  const decoded = await verifyToken(req.headers.authorization)
  if (!decoded) return null
  const profile = await getOrCreateProfile(decoded)
  return profile.role === 'admin' ? profile : null
}

export async function getUser(req) {
  const decoded = await verifyToken(req.headers.authorization)
  if (!decoded) return null
  return getOrCreateProfile(decoded)
}
