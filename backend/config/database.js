/**
 * Database Configuration
 * Let Investments - PostgreSQL connection using Prisma
 *
 * This file simply re-exports the shared Prisma client
 * from lib/prisma.js for backward compatibility.
 */

const prisma = require("../lib/prisma")

module.exports = { prisma }