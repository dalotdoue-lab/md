require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const admin = require('firebase-admin')
const { getFirestore } = require('firebase-admin/firestore')
const { projects, products, materials, adminSettings } = require('../data/mongoSeedData')

function initFirebase() {
  if (admin.apps.length) return
  
  const keyFile = process.env.FIREBASE_PRIVATE_KEY_FILE
  if (!keyFile) {
    throw new Error('FIREBASE_PRIVATE_KEY_FILE is not set in environment variables')
  }

  const serviceAccount = require(keyFile)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
}

async function upsertCollection(db, collectionName, uniqueField, records) {
  console.log(`Seeding collection '${collectionName}'...`)
  const collectionRef = db.collection(collectionName)
  let inserted = 0
  let updated = 0

  for (const record of records) {
    // Find if document exists by uniqueField
    const snapshot = await collectionRef.where(uniqueField, '==', record[uniqueField]).get()
    
    if (snapshot.empty) {
      await collectionRef.add({
        ...record,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      inserted++
    } else {
      const docId = snapshot.docs[0].id
      await collectionRef.doc(docId).set({
        ...record,
        updatedAt: new Date()
      }, { merge: true })
      updated++
    }
  }

  console.log(`Collection '${collectionName}': ${inserted} inserted, ${updated} updated.`)
}

async function seedAdminSettings(db) {
  console.log("Seeding admin settings...")
  const docRef = db.collection('adminSettings').doc('settings')
  await docRef.set({
    ...adminSettings,
    updatedAt: new Date()
  }, { merge: true })
  console.log("Admin settings seeded successfully.")
}

async function main() {
  initFirebase()
  const db = getFirestore()
  db.settings({ ignoreUndefinedProperties: true })

  await upsertCollection(db, 'projects', 'title', projects)
  await upsertCollection(db, 'products', 'name', products)
  await upsertCollection(db, 'materials', 'name', materials)
  await seedAdminSettings(db)

  console.log("Firestore seeding completed successfully!")
}

main().catch(err => {
  console.error("Firestore seeding failed:", err.message)
  process.exitCode = 1
})
