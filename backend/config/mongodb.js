const mongoose = require('mongoose')

let isConnected = false

async function connectMongoDB() {
  if (isConnected) return

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/letinvestments'

  try {
    await mongoose.connect(uri)
    isConnected = true
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection failed:', err.message)
  }
}

module.exports = connectMongoDB
