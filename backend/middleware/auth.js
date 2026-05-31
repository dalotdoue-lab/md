const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role || 'client'
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

// Middleware to protect routes (async)
const cookieParser = require('cookie-parser'); // Ensure available
const authenticate = async (req, res, next) => {
  try {
    // Cookie fallback first
    let token = req.cookies?.authToken;
    if (!token) {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Authentication required - Bearer token or cookie missing' })
      }
      token = authHeader.split(' ')[1]
    }
    
    let decoded = verifyToken(token)
    let user;

    if (!decoded) {
      // Standard JWT verification failed. Try Firebase ID Token.
      try {
        const admin = require('firebase-admin');
        if (!admin.apps.length) {
          require('./firebaseAuth'); // Trigger initialization
        }
        const firebaseDecoded = await admin.auth().verifyIdToken(token);
        if (!firebaseDecoded) {
          return res.status(401).json({ success: false, error: 'Invalid or expired Firebase token' })
        }

        user = await prisma.user.findUnique({
          where: { email: firebaseDecoded.email },
          include: { 
            role: {
              select: { name: true }
            }
          }
        });

        if (!user) {
          // Create role if doesn't exist
          let clientRole = await prisma.role.findFirst({
            where: { name: 'client' }
          });
          if (!clientRole) {
            clientRole = await prisma.role.create({
              data: {
                name: 'client',
                description: 'Standard investment client',
                permissions: {
                  dashboard: true,
                  portfolio: true,
                  transactions: true,
                  investments: true
                },
                isSystem: true
              }
            });
          }

          // Sync MongoDB role if available
          let mdbRole = 'client';
          try {
            const UserProfile = require('../models/UserProfile');
            const profile = await UserProfile.findOne({ email: firebaseDecoded.email });
            if (profile && profile.role) {
              mdbRole = profile.role;
            }
          } catch (mongoErr) {
            console.error("MongoDB profile role sync error in auth:", mongoErr);
          }

          let targetRole = clientRole;
          if (mdbRole && mdbRole !== 'client') {
            let roleObj = await prisma.role.findFirst({ where: { name: mdbRole } });
            if (!roleObj) {
              roleObj = await prisma.role.create({
                data: {
                  name: mdbRole,
                  description: `${mdbRole} role`,
                  permissions: { all: true },
                  isSystem: true
                }
              });
            }
            targetRole = roleObj;
          }

          // Create the SQL User
          user = await prisma.user.create({
            data: {
              email: firebaseDecoded.email,
              name: firebaseDecoded.name || firebaseDecoded.email.split('@')[0],
              passwordHash: 'FIREBASE_AUTH_USER',
              roleId: targetRole.id,
              isActive: true,
              isEmailVerified: firebaseDecoded.email_verified || false
            },
            include: {
              role: {
                select: { name: true }
              }
            }
          });

          // Create wallet with $10,000 starting balance
          const wallet = await prisma.wallet.create({
            data: {
              userId: user.id,
              balance: '10000.00',
              pendingBalance: '0.00',
              currency: 'USD',
              status: 'active'
            }
          });

          const ledgerService = require('../repositories/ledgerService');
          await ledgerService.create(
            wallet.id,
            user.id,
            'SYSTEM_INIT',
            0,
            10000.00,
            `WALLET_CREATE_${wallet.id}`,
            'Wallet initialized with $10,000 via Google Auth Sign On'
          );
        } else {
          // Sync MongoDB UserProfile role to PostgreSQL role
          let mdbRole = 'client';
          try {
            const UserProfile = require('../models/UserProfile');
            const profile = await UserProfile.findOne({ email: firebaseDecoded.email });
            if (profile && profile.role) {
              mdbRole = profile.role;
            }
          } catch (mongoErr) {
            console.error("MongoDB profile role sync error in auth:", mongoErr);
          }

          if (user.role?.name !== mdbRole) {
            let targetRole = await prisma.role.findFirst({ where: { name: mdbRole } });
            if (!targetRole) {
              targetRole = await prisma.role.create({
                data: {
                  name: mdbRole,
                  description: `${mdbRole} role`,
                  permissions: { all: true },
                  isSystem: true
                }
              });
            }
            user = await prisma.user.update({
              where: { id: user.id },
              data: { roleId: targetRole.id },
              include: { role: { select: { name: true } } }
            });
          }
        }
      } catch (fbErr) {
        console.error("Firebase token verification fallback failed:", fbErr);
        return res.status(401).json({ success: false, error: 'Invalid or expired Firebase ID token', detail: fbErr.message })
      }
    } else {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { 
          role: {
            select: { name: true }
          }
        }
      })
      if (!user) return res.status(401).json({ success: false, error: 'User not found - token may reference deleted account' })

      // Anti-spoofing: validate token role matches DB
      if (decoded.role && decoded.role !== user.role?.name) {
        return res.status(403).json({ success: false, error: 'Role mismatch detected - possible spoofing attempt' })
      }
    }

    req.user = { 
      id: user.id, 
      email: user.email,
      role: user.role?.name || 'client' 
    }
    req.userId = user.id
    next()
  } catch (error) {
    console.error('💥 [AUTH MIDDLEWARE ERROR]', error);
    res.status(500).json({ success: false, error: 'Authentication service error' })
  }
}

// Optional auth (async)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      let decoded = verifyToken(token)
      if (decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true }
        })
        if (user) {
          req.user = { id: user.id, email: user.email }
          req.userId = user.id
        }
      } else {
        // Try Firebase verification in optional auth
        try {
          const admin = require('firebase-admin');
          if (!admin.apps.length) {
            require('./firebaseAuth');
          }
          const firebaseDecoded = await admin.auth().verifyIdToken(token);
          if (firebaseDecoded) {
            const user = await prisma.user.findUnique({
              where: { email: firebaseDecoded.email },
              select: { id: true, email: true }
            })
            if (user) {
              req.user = { id: user.id, email: user.email }
              req.userId = user.id
            }
          }
        } catch (e) {}
      }
    }
    next()
  } catch (error) {
    next()
  }
}

// Role-based authorization
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' })
  // Note: role from token payload for now; fetch full user if needed
  if (!roles.includes(req.user.role || 'client')) return res.status(403).json({ error: 'Insufficient permissions' })
  next()
}

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  optionalAuth,
  authorize,
  requireAdmin: authorize('admin'),
}

