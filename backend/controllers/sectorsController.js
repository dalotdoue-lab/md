/**
 * Sectors Controller
 * Kingstone Investments - Real database data for sectors
 * 
 * Uses Prisma database instead of mock data
 * ============================================================================
 */

const { sectorRepository } = require('../repositories/refDataRepositories');
const prisma = require('../lib/prisma');

// =====================================================
// Get all sectors
// =====================================================
exports.getAll = async (req, res) => {
  try {
    const sectors = await sectorRepository.findAll(true);

    // Get company counts for each sector
    const sectorsWithCounts = await Promise.all(
      sectors.map(async (sector) => {
        const companyCount = await prisma.company.count({
          where: { 
            sectorId: sector.id,
            isActive: true 
          }
        });

        return {
          id: sector.id,
          name: sector.name,
          description: sector.description,
          icon: sector.icon,
          color: sector.color,
          isActive: sector.isActive,
          sortOrder: sector.sortOrder,
          companyCount,
        };
      })
    );

    // Sort alphabetically
    sectorsWithCounts.sort((a, b) => a.name.localeCompare(b.name));

    res.json({ 
      success: true,
      sectors: sectorsWithCounts 
    });
  } catch (error) {
    console.error('Get sectors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sectors',
      message: error.message,
    });
  }
};

// =====================================================
// Get sector by ID
// =====================================================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const sector = await sectorRepository.findById(id);

    if (!sector) {
      return res.status(404).json({
        success: false,
        error: 'Sector not found',
      });
    }

    // Get companies in this sector
    const companies = await prisma.company.findMany({
      where: { 
        sectorId: id,
        isActive: true 
      },
      include: {
        region: true
      },
      orderBy: { name: 'asc' },
    });

    const transformedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      symbol: company.symbol,
      region: company.region?.name,
      country: company.country,
      currentPrice: Number(company.currentPrice),
      marketCap: company.marketCap?.toString(),
      isFeatured: company.isFeatured,
    }));

    res.json({ 
      success: true,
      sector: {
        id: sector.id,
        name: sector.name,
        description: sector.description,
        icon: sector.icon,
        color: sector.color,
        isActive: sector.isActive,
        sortOrder: sector.sortOrder,
        companies: transformedCompanies,
        companyCount: companies.length,
      }
    });
  } catch (error) {
    console.error('Get sector error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sector',
      message: error.message,
    });
  }
};

// =====================================================
// Get sector by name
// =====================================================
exports.getByName = async (req, res) => {
  try {
    const { name } = req.params;

    const sector = await sectorRepository.findByName(name);

    if (!sector) {
      return res.status(404).json({
        success: false,
        error: 'Sector not found',
      });
    }

    const companies = await prisma.company.findMany({
      where: { 
        sectorId: sector.id,
        isActive: true 
      },
      include: { region: true },
      orderBy: { name: 'asc' },
    });

    res.json({ 
      success: true,
      sector: {
        ...sector,
        companies,
        companyCount: companies.length,
      }
    });
  } catch (error) {
    console.error('Get sector by name error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sector',
      message: error.message,
    });
  }
};

