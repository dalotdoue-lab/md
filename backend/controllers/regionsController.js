/**
 * Regions Controller
 * Kingstone Investments - Real database data for regions
 * 
 * Uses Prisma database instead of mock data
 * ============================================================================
 */

const { regionRepository } = require('../repositories/refDataRepositories');
const prisma = require('../lib/prisma');

// =====================================================
// Get all regions
// =====================================================
exports.getAll = async (req, res) => {
  try {
    const regions = await regionRepository.findAll(true);

    // Get company counts for each region
    const regionsWithCounts = await Promise.all(
      regions.map(async (region) => {
        const companyCount = await prisma.company.count({
          where: { 
            regionId: region.id,
            isActive: true 
          }
        });

        const marketInsightCount = await prisma.marketInsight.count({
          where: { 
            regionId: region.id,
            isPublished: true 
          }
        });

        return {
          id: region.id,
          name: region.name,
          description: region.description,
          code: region.code,
          isActive: region.isActive,
          sortOrder: region.sortOrder,
          companyCount,
          marketInsightCount,
        };
      })
    );

    // Sort alphabetically
    regionsWithCounts.sort((a, b) => a.name.localeCompare(b.name));

    res.json({ 
      success: true,
      regions: regionsWithCounts 
    });
  } catch (error) {
    console.error('Get regions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch regions',
      message: error.message,
    });
  }
};

// =====================================================
// Get region by ID
// =====================================================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const region = await regionRepository.findById(id);

    if (!region) {
      return res.status(404).json({
        success: false,
        error: 'Region not found',
      });
    }

    // Get companies in this region
    const companies = await prisma.company.findMany({
      where: { 
        regionId: id,
        isActive: true 
      },
      include: { sector: true },
      orderBy: { name: 'asc' },
    });

    // Get market insights for this region
    const insights = await prisma.marketInsight.findMany({
      where: { 
        regionId: id,
        isPublished: true 
      },
      take: 5,
      orderBy: { publishedAt: 'desc' },
    });

    const transformedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      symbol: company.symbol,
      sector: company.sector?.name,
      country: company.country,
      currentPrice: Number(company.currentPrice),
      marketCap: company.marketCap?.toString(),
      isFeatured: company.isFeatured,
    }));

    const transformedInsights = insights.map(insight => ({
      id: insight.id,
      title: insight.title,
      slug: insight.slug,
      summary: insight.summary,
      category: insight.category,
      publishedAt: insight.publishedAt,
    }));

    res.json({ 
      success: true,
      region: {
        id: region.id,
        name: region.name,
        description: region.description,
        code: region.code,
        isActive: region.isActive,
        sortOrder: region.sortOrder,
        companies: transformedCompanies,
        companyCount: companies.length,
        insights: transformedInsights,
        insightCount: insights.length,
      }
    });
  } catch (error) {
    console.error('Get region error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch region',
      message: error.message,
    });
  }
};

// =====================================================
// Get region by name
// =====================================================
exports.getByName = async (req, res) => {
  try {
    const { name } = req.params;

    const region = await regionRepository.findByName(name);

    if (!region) {
      return res.status(404).json({
        success: false,
        error: 'Region not found',
      });
    }

    const companies = await prisma.company.findMany({
      where: { 
        regionId: region.id,
        isActive: true 
      },
      include: { sector: true },
      orderBy: { name: 'asc' },
    });

    res.json({ 
      success: true,
      region: {
        ...region,
        companies,
        companyCount: companies.length,
      }
    });
  } catch (error) {
    console.error('Get region by name error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch region',
      message: error.message,
    });
  }
};

