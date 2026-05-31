const admin = require('firebase-admin')
const UserProfile = require('../models/UserProfile')
const { isAdminEmail } = require('../config/adminEmails')

// Initialize Firebase Admin only once.
// Prefer env vars (Vercel / production). Fall back to a local key file for dev.
if (!admin.apps.length) {
  let serviceAccount

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  } else if (process.env.FIREBASE_PRIVATE_KEY_FILE) {
    serviceAccount = require(process.env.FIREBASE_PRIVATE_KEY_FILE)
  } else {
    throw new Error('Firebase Admin not configured. Set FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (or FIREBASE_SERVICE_ACCOUNT_JSON, or FIREBASE_PRIVATE_KEY_FILE).')
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })

  // Bootstrap admin user in Firebase Auth
  const bootstrapAdminUser = async () => {
    try {
      const email = 'let@admin.com'
      const password = process.env.ADMIN_PASSWORD
      if (!password) {
        console.warn('Skipping Firebase admin bootstrap because ADMIN_PASSWORD is not set.')
        return
      }
      let userRecord
      try {
        userRecord = await admin.auth().getUserByEmail(email)
        console.log('✅ Admin user let@admin.com already exists in Firebase Auth.')
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: 'Admin User',
            emailVerified: true
          })
          console.log('✅ Created Admin user let@admin.com in Firebase Auth.')
        } else {
          throw err
        }
      }
    } catch (err) {
      console.error('⚠️ Failed to bootstrap admin user in Firebase Auth:', err.message)
    }
  }
  bootstrapAdminUser()
}

// Verify Firebase ID token and load/create MongoDB user profile
const firebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Bearer token' })
    }
    const idToken = authHeader.split(' ')[1]
    const decoded = await admin.auth().verifyIdToken(idToken)

    const syncedRole = isAdminEmail(decoded.email) ? 'admin' : 'client'

    // Get or create MongoDB user profile
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

    req.user = { uid: decoded.uid, email: decoded.email, role: profile.role, profileId: profile._id }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired Firebase token', detail: err.message })
  }
}

// Admin guard — use after firebaseAuth
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}

module.exports = { firebaseAuth, requireAdmin }
