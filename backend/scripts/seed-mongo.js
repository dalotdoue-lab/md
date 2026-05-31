require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const mongoose = require('mongoose')
const admin = require('firebase-admin')

const Project = require('../models/Project')
const Product = require('../models/Product')
const Material = require('../models/Material')
const AdminSettings = require('../models/AdminSettings')
const UserProfile = require('../models/UserProfile')
const { projects, products, materials, adminSettings } = require('../data/mongoSeedData')
const { getAdminEmails, isAdminEmail } = require('../config/adminEmails')

const DEFAULT_CLIENT_EMAILS = ['labcoatsxd@gmail.com']

function getClientEmails() {
  return Array.from(new Set([
    ...DEFAULT_CLIENT_EMAILS,
    ...String(process.env.SEED_CLIENT_EMAILS || '')
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean),
  ]))
}

async function connectMongo() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI env var is not set')
  }

  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false })
  console.log('Connected to MongoDB')
}

async function upsertCatalog(Model, uniqueField, records) {
  const summary = { inserted: 0, existing: 0 }

  for (const record of records) {
    const result = await Model.updateOne(
      { [uniqueField]: record[uniqueField] },
      { $setOnInsert: record },
      { upsert: true }
    )

    if (result.upsertedCount > 0) {
      summary.inserted += 1
    } else {
      summary.existing += 1
    }
  }

  return summary
}

async function seedAdminSettings() {
  const existing = await AdminSettings.findOne()
  if (existing) return { inserted: 0, existing: 1 }

  await AdminSettings.create(adminSettings)
  return { inserted: 1, existing: 0 }
}

function initFirebaseAdmin() {
  if (admin.apps.length) return true

  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    return false
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  })

  return true
}

async function seedUserProfiles() {
  const summary = { inserted: 0, existing: 0, notFound: 0, skipped: false }

  if (!initFirebaseAdmin()) {
    summary.skipped = true
    return summary
  }

  const emails = Array.from(new Set([
    ...getAdminEmails(process.env.ADMIN_EMAILS),
    ...getClientEmails(),
  ]))

  for (const email of emails) {
    try {
      const authUser = await admin.auth().getUserByEmail(email)
      const syncedRole = isAdminEmail(authUser.email, process.env.ADMIN_EMAILS) ? 'admin' : 'client'

      const result = await UserProfile.updateOne(
        { firebaseUid: authUser.uid },
        {
          $set: {
            email: authUser.email || email,
            name: authUser.displayName || '',
            role: syncedRole,
          },
          $setOnInsert: {
            balance: 0,
            dailyProfit: 0,
            totalInvested: 0,
          },
        },
        { upsert: true }
      )

      if (result.upsertedCount > 0) {
        summary.inserted += 1
      } else {
        summary.existing += 1
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        summary.notFound += 1
      } else {
        throw err
      }
    }
  }

  return summary
}

async function printCounts() {
  const counts = {
    projects: await Project.countDocuments(),
    products: await Product.countDocuments(),
    materials: await Material.countDocuments(),
    adminSettings: await AdminSettings.countDocuments(),
    userProfiles: await UserProfile.countDocuments(),
  }

  console.log('Collection counts:', counts)
}

async function main() {
  await connectMongo()

  const [projectSummary, productSummary, materialSummary, settingsSummary, profileSummary] = await Promise.all([
    upsertCatalog(Project, 'title', projects),
    upsertCatalog(Product, 'name', products),
    upsertCatalog(Material, 'name', materials),
    seedAdminSettings(),
    seedUserProfiles(),
  ])

  console.log('Seed summary:', {
    projects: projectSummary,
    products: productSummary,
    materials: materialSummary,
    adminSettings: settingsSummary,
    userProfiles: profileSummary,
  })

  await printCounts()
}

main()
  .catch(err => {
    console.error('Mongo seed failed:', err.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
