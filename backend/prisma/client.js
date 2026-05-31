// prisma/client.js
/**
 * Prisma Client Singleton
 * Ensures only one Prisma connection is used
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

module.exports = prisma