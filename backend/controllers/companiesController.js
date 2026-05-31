/**
 * Companies Controller
 * Kingstone Investments - Real database data for companies/stocks
 * 
 * Uses Prisma database instead of mock data
 * ============================================================================
 */

const companyRepository = require('../repositories/companyRepository');
const { sectorRepository, regionRepository } = require('../repositories/refDataRepositories');
const stockPriceService = require('../services/stockPriceService');

// =====================================================
// Get all companies with optional filters
// =====================================================
exports.getAll = async (req, res) => {
  try {
    const { sector, region, country, search, limit, offset, featured } = req.query;

    // Build filters for repository
    const filters = {};
    if (sector) filters.sector = sector;
    if (region) filters.region = region;
    if (country) filters.country = country;
    if (search) filters.search = search;
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    // Get companies from database
    let result;
    if (featured === 'true') {
      const companies = await companyRepository.findFeatured(parseInt(limit) || 10);
      result = { companies, total: companies.length };
    } else {
      result = await companyRepository.findAll(filters);
    }

    // Transform data for API response
    const transformedCompanies = result.companies.map(company => ({
      id: company.id,
      name: company.name,
      symbol: company.symbol,
      ticker: company.symbol, // Add ticker alias for frontend compatibility
      sector: company.sector?.name || company.sectorName,
      sectorId: company.sectorId,
      region: company.region?.name || company.regionName,
      regionId: company.regionId,
      country: company.country,
      description: company.description,
      logoUrl: company.logoUrl || company.logo_url,
      website: company.website,
      currentPrice: Number(company.currentPrice) || company.current_price,
      previousPrice: Number(company.previousPrice) || company.previous_price,
      openPrice: Number(company.openPrice) || company.open_price,
      highPrice: Number(company.highPrice) || company.high_price,
      lowPrice: Number(company.lowPrice) || company.low_price,
      volume: company.volume?.toString() || company.volume,
      marketCap: company.marketCap?.toString() || company.market_cap,
      peRatio: Number(company.peRatio) || company.pe_ratio,
      dividendYield: Number(company.dividendYield) || company.dividend_yield,
      fiftyTwoWeekHigh: Number(company.fiftyTwoWeekHigh) || company.fifty_two_week_high,
      fiftyTwoWeekLow: Number(company.fiftyTwoWeekLow) || company.fifty_two_week_low,
      isActive: company.isActive ?? company.is_active,
      isFeatured: company.isFeatured ?? company.is_featured,
      createdAt: company.createdAt || company.created_at,
      updatedAt: company.updatedAt || company.updated_at,
    }));

    res.json({
      success: true,
      companies: transformedCompanies,
      total: result.total,
      limit: filters.limit || null,
      offset: filters.offset || null,
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch companies',
      message: error.message,
    });
  }
};

// =====================================================
// Get company by ID
// =====================================================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await companyRepository.findById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    // Transform data
    const transformed = {
      id: company.id,
      name: company.name,
      symbol: company.symbol,
      sector: company.sector?.name,
      sectorId: company.sectorId,
      region: company.region?.name,
      regionId: company.regionId,
      country: company.country,
      description: company.description,
      logoUrl: company.logoUrl,
      website: company.website,
      currentPrice: Number(company.currentPrice),
      previousPrice: company.previousPrice ? Number(company.previousPrice) : null,
      openPrice: company.openPrice ? Number(company.openPrice) : null,
      highPrice: company.highPrice ? Number(company.highPrice) : null,
      lowPrice: company.lowPrice ? Number(company.lowPrice) : null,
      volume: company.volume?.toString(),
      marketCap: company.marketCap?.toString(),
      peRatio: company.peRatio ? Number(company.peRatio) : null,
      dividendYield: company.dividendYield ? Number(company.dividendYield) : null,
      eps: company.eps ? Number(company.eps) : null,
      beta: company.beta ? Number(company.beta) : null,
      fiftyTwoWeekHigh: company.fiftyTwoWeekHigh ? Number(company.fiftyTwoWeekHigh) : null,
      fiftyTwoWeekLow: company.fiftyTwoWeekLow ? Number(company.fiftyTwoWeekLow) : null,
      employees: company.employees,
      foundedYear: company.foundedYear,
      ceo: company.ceo,
      headquarters: company.headquarters,
      isActive: company.isActive,
      isFeatured: company.isFeatured,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };

    res.json({ success: true, company: transformed });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company',
      message: error.message,
    });
  }
};

// =====================================================
// Get company by ticker/symbol
// =====================================================
exports.getByTicker = async (req, res) => {
  try {
    const { ticker } = req.params;
    const { refresh } = req.query;

    let company = await companyRepository.findBySymbol(ticker);

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found',
      });
    }

    // Optionally refresh price from API
    let priceData = null;
    if (refresh === 'true') {
      priceData = await stockPriceService.getQuote(ticker);
    }

    // Transform data
    const transformed = {
      id: company.id,
      name: company.name,
      symbol: company.symbol,
      sector: company.sector?.name,
      sectorId: company.sectorId,
      region: company.region?.name,
      regionId: company.regionId,
      country: company.country,
      description: company.description,
      logoUrl: company.logoUrl,
      website: company.website,
      currentPrice: priceData?.price || Number(company.currentPrice),
      previousPrice: Number(company.previousPrice) || priceData?.previousClose,
      openPrice: Number(company.openPrice) || priceData?.open,
      highPrice: Number(company.highPrice) || priceData?.high,
      lowPrice: Number(company.lowPrice) || priceData?.low,
      volume: company.volume?.toString(),
      marketCap: company.marketCap?.toString(),
      peRatio: company.peRatio ? Number(company.peRatio) : null,
      dividendYield: company.dividendYield ? Number(company.dividendYield) : null,
      fiftyTwoWeekHigh: company.fiftyTwoWeekHigh ? Number(company.fiftyTwoWeekHigh) : null,
      fiftyTwoWeekLow: company.fiftyTwoWeekLow ? Number(company.fiftyTwoWeekLow) : null,
      change: priceData?.change || (company.previousPrice ? Number(company.currentPrice) - Number(company.previousPrice) : null),
      changePercent: priceData?.changePercent || (company.previousPrice && Number(company.previousPrice) !== 0 
        ? ((Number(company.currentPrice) - Number(company.previousPrice)) / Number(company.previousPrice)) * 100 
        : null),
      isActive: company.isActive,
      isFeatured: company.isFeatured,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };

    res.json({ success: true, company: transformed });
  } catch (error) {
    console.error('Get company by ticker error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch company',
      message: error.message,
    });
  }
};

// =====================================================
// Get all sectors
// =====================================================
exports.getSectors = async (req, res) => {
  try {
    const sectors = await sectorRepository.findAll(true);

    const transformed = sectors.map(sector => ({
      id: sector.id,
      name: sector.name,
      description: sector.description,
      icon: sector.icon,
      color: sector.color,
      isActive: sector.isActive,
      sortOrder: sector.sortOrder,
      createdAt: sector.createdAt,
      updatedAt: sector.updatedAt,
    }));

    res.json({ success: true, sectors: transformed });
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
// Get all regions
// =====================================================
exports.getRegions = async (req, res) => {
  try {
    const regions = await regionRepository.findAll(true);

    const transformed = regions.map(region => ({
      id: region.id,
      name: region.name,
      description: region.description,
      code: region.code,
      isActive: region.isActive,
      sortOrder: region.sortOrder,
      createdAt: region.createdAt,
      updatedAt: region.updatedAt,
    }));

    res.json({ success: true, regions: transformed });
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
// Get stock price history for a company
// =====================================================
exports.getStockHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30, refresh } = req.query;

    const company = await companyRepository.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    // Get history from database
    let history = await companyRepository.getPriceHistory(id, parseInt(days));

    // If not enough data or refresh requested, try to get from API
    if (history.length < parseInt(days) || refresh === 'true') {
      // Trigger price update for this company
      await stockPriceService.updateCompanyPrice(id, company.symbol);
      
      // Re-fetch history
      history = await companyRepository.getPriceHistory(id, parseInt(days));
    }

    // Transform data
    const prices = history.map(h => ({
      companyId: h.companyId,
      date: h.date,
      open: h.openPrice ? Number(h.openPrice) : null,
      high: h.highPrice ? Number(h.highPrice) : null,
      low: h.lowPrice ? Number(h.lowPrice) : null,
      close: h.closePrice ? Number(h.closePrice) : null,
      volume: h.volume?.toString(),
      priceChange: h.priceChange ? Number(h.priceChange) : null,
      priceChangePercent: h.priceChangePercent ? Number(h.priceChangePercent) : null,
    }));

    res.json({ success: true, prices });
  } catch (error) {
    console.error('Get stock history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock history',
      message: error.message,
    });
  }
};

// =====================================================
// Get real-time quote for a symbol (for frontend polling)
// =====================================================
exports.getQuote = async (req, res) => {
  try {
    const { symbol } = req.params;

    // Try to get real-time quote
    const quote = await stockPriceService.getQuote(symbol);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not available',
      });
    }

    res.json({ success: true, quote });
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote',
      message: error.message,
    });
  }
};

// =====================================================
// Search companies
// =====================================================
exports.search = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query required',
      });
    }

    const companies = await companyRepository.search(q, parseInt(limit));

    const transformed = companies.map(company => ({
      id: company.id,
      name: company.name,
      symbol: company.symbol,
      sector: company.sector?.name,
      region: company.region?.name,
      country: company.country,
      currentPrice: Number(company.currentPrice),
      logoUrl: company.logoUrl,
    }));

    res.json({ success: true, companies: transformed, count: transformed.length });
  } catch (error) {
    console.error('Search companies error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: error.message,
    });
  }
};

// =====================================================
// Get market overview (top movers, etc.)
// =====================================================
exports.getMarketOverview = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get featured companies as "top picks"
    const featured = await companyRepository.findFeatured(parseInt(limit));

    // Calculate gainers/losers from database
    const allCompanies = await companyRepository.findAll({ limit: 100 });
    
    const withChange = allCompanies.companies
      .filter(c => c.currentPrice && c.previousPrice)
      .map(c => ({
        id: c.id,
        name: c.name,
        symbol: c.symbol,
        currentPrice: Number(c.currentPrice),
        previousPrice: Number(c.previousPrice),
        change: Number(c.currentPrice) - Number(c.previousPrice),
        changePercent: ((Number(c.currentPrice) - Number(c.previousPrice)) / Number(c.previousPrice)) * 100,
      }))
      .sort((a, b) => b.changePercent - a.changePercent);

    const gainers = withChange.filter(c => c.changePercent > 0).slice(0, 5);
    const losers = withChange.filter(c => c.changePercent < 0).reverse().slice(0, 5);

    res.json({
      success: true,
      overview: {
        featured: featured.map(c => ({
          id: c.id,
          name: c.name,
          symbol: c.symbol,
          currentPrice: Number(c.currentPrice),
          sector: c.sector?.name,
        })),
        gainers,
        losers,
        totalCompanies: allCompanies.total,
      },
    });
  } catch (error) {
    console.error('Get market overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market overview',
      message: error.message,
    });
  }
};

