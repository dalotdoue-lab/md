/**
 * Shared Prisma Client
 * Let Investments - Single Prisma instance for the entire application
 *
 * This ensures only ONE Prisma connection exists across the entire backend.
 */

const { PrismaClient } = require("@prisma/client")

let prisma

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["error"]
  })
} else {
  // Prevent multiple instances during development (nodemon / hot reload)
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ["query", "error", "warn"]
    })
  }
  prisma = global.prisma
}

module.exports = prisma