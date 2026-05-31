/**
 * Company Repository
 * Let Investments - Database operations for companies/stocks
 * 
 * ============================================================================
 * Uses the shared Prisma client from lib/prisma.js
 * All fields and relations match schema.prisma.
 */

const prisma = require("../lib/prisma");

const companyRepository = {
  /**
   * Find all companies with optional filters
   */
  async findAll(filters = {}) {
    try {
      const { sector, region, country, search, limit = 100, offset = 0 } = filters;

      const where = { isActive: true };

      if (sector) where.sector = { name: sector };
      if (region) where.region = { name: region };
      if (country) where.country = country;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { symbol: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where,
          include: { sector: true, region: true },
          skip: offset,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        prisma.company.count({ where }),
      ]);

      return { companies, total };
    } catch (error) {
      console.error("Error in findAll:", error.message);
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }
  },

  /**
   * Find company by ID
   */
  async findById(id) {
    if (!id) throw new Error("Company ID is required");
    return await prisma.company.findUnique({
      where: { id },
      include: { sector: true, region: true },
    });
  },

  /**
   * Find company by symbol/ticker
   */
  async findBySymbol(symbol) {
    if (!symbol) throw new Error("Company symbol is required");
    return await prisma.company.findUnique({
      where: { symbol: symbol.toUpperCase() },
      include: { sector: true, region: true },
    });
  },

  /**
   * Get featured companies
   */
  async findFeatured(limit = 10) {
    return await prisma.company.findMany({
      where: { isFeatured: true, isActive: true },
      include: { sector: true, region: true },
      take: limit,
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Get companies by sector
   */
  async findBySector(sectorId, limit = 50) {
    if (!sectorId) throw new Error("Sector ID is required");
    return await prisma.company.findMany({
      where: { sectorId, isActive: true },
      include: { sector: true, region: true },
      take: limit,
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Get companies by region
   */
  async findByRegion(regionId, limit = 50) {
    if (!regionId) throw new Error("Region ID is required");
    return await prisma.company.findMany({
      where: { regionId, isActive: true },
      include: { sector: true, region: true },
      take: limit,
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Create a new company
   */
  async create(data) {
    if (!data) throw new Error("Company data is required");

    return await prisma.company.create({
      data: {
        name: data.name,
        symbol: data.symbol?.toUpperCase(),
        description: data.description,
        currentPrice: data.currentPrice || 0,
        previousPrice: data.previousPrice || 0,
        sectorId: data.sectorId,
        regionId: data.regionId,
        country: data.country,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isFeatured: data.isFeatured || false,
        logo: data.logo,
        website: data.website,
      },
      include: { sector: true, region: true },
    });
  },

  /**
   * Update a company
   */
  async update(id, data) {
    if (!id) throw new Error("Company ID is required");
    if (!data) throw new Error("Update data is required");

    return await prisma.company.update({
      where: { id },
      data: {
        name: data.name,
        symbol: data.symbol?.toUpperCase(),
        description: data.description,
        currentPrice: data.currentPrice,
        previousPrice: data.previousPrice,
        sectorId: data.sectorId,
        regionId: data.regionId,
        country: data.country,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        logo: data.logo,
        website: data.website,
      },
      include: { sector: true, region: true },
    });
  },

  /**
   * Delete a company (soft delete)
   */
  async delete(id) {
    if (!id) throw new Error("Company ID is required");
    return await prisma.company.update({
      where: { id },
      data: { isActive: false },
    });
  },

  /**
   * Update company price
   */
  async updatePrice(id, newPrice) {
    if (!id) throw new Error("Company ID is required");
    if (newPrice === undefined || newPrice === null) throw new Error("New price is required");

    const company = await prisma.company.findUnique({
      where: { id },
      select: { currentPrice: true },
    });
    if (!company) throw new Error("Company not found");

    return await prisma.company.update({
      where: { id },
      data: {
        previousPrice: company.currentPrice,
        currentPrice: newPrice,
      },
    });
  },

  /**
   * Get stock price history
   */
  async getPriceHistory(companyId, days = 30) {
    if (!companyId) throw new Error("Company ID is required");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await prisma.stockPriceHistory.findMany({
      where: { companyId, date: { gte: startDate } },
      orderBy: { date: "desc" },
    });
  },

  /**
   * Search companies
   */
  async search(query, limit = 20) {
    if (!query) throw new Error("Search query is required");

    return await prisma.company.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { symbol: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { sector: true, region: true },
      take: limit,
      orderBy: { name: "asc" },
    });
  },
};

module.exports = companyRepository;