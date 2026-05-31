/**
 * Sector & Region Repositories
 * Let Investments - Database operations for reference data
 * 
 * ============================================================================
 * Fixed: Using shared Prisma client from lib/prisma.js
 */

const prisma = require("../lib/prisma");

// Sector Repository
const sectorRepository = {
  async findAll(activeOnly = true) {
    const where = activeOnly ? { isActive: true } : {};
    return await prisma.sector.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id) {
    return await prisma.sector.findUnique({
      where: { id },
      include: { companies: true },
    });
  },

  async findByName(name) {
    return await prisma.sector.findUnique({
      where: { name },
    });
  },

  async create(data) {
    return await prisma.sector.create({ data });
  },

  async update(id, data) {
    return await prisma.sector.update({ where: { id }, data });
  },
};

// Region Repository
const regionRepository = {
  async findAll(activeOnly = true) {
    const where = activeOnly ? { isActive: true } : {};
    return await prisma.region.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id) {
    return await prisma.region.findUnique({
      where: { id },
      include: { companies: true, marketInsights: true },
    });
  },

  async findByName(name) {
    return await prisma.region.findUnique({
      where: { name },
    });
  },

  async create(data) {
    return await prisma.region.create({ data });
  },

  async update(id, data) {
    return await prisma.region.update({ where: { id }, data });
  },
};

module.exports = { sectorRepository, regionRepository };



