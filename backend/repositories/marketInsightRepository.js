/**
 * Market Insight Repository
 * Let Investments - Database operations for market insights
 * 
 * ============================================================================
 * Fixed: Using shared Prisma client from lib/prisma.js
 */

const prisma = require("../lib/prisma");

const marketInsightRepository = {
  /**
   * Find all market insights with optional filters
   */
  async findAll(filters = {}) {
    const { 
      published = true, 
      featured = false, 
      category, 
      regionId, 
      limit = 50, 
      offset = 0 
    } = filters;

    const where = {};
    
    if (published !== undefined) {
      where.isPublished = published;
    }
    
    if (featured !== undefined) {
      where.isFeatured = featured;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (regionId) {
      where.regionId = regionId;
    }

    const [insights, total] = await Promise.all([
      prisma.marketInsight.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true }
          },
          region: true,
        },
        skip: offset,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.marketInsight.count({ where }),
    ]);

    return { insights, total };
  },

  /**
   * Find market insight by ID
   */
  async findById(id) {
    return await prisma.marketInsight.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        region: true,
      },
    });
  },

  /**
   * Find market insight by slug
   */
  async findBySlug(slug) {
    return await prisma.marketInsight.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        region: true,
      },
    });
  },

  /**
   * Get featured insights
   */
  async findFeatured(limit = 5) {
    return await prisma.marketInsight.findMany({
      where: { isFeatured: true, isPublished: true },
      include: {
        author: {
          select: { id: true, name: true }
        },
        region: true,
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });
  },

  /**
   * Get insights by category
   */
  async findByCategory(category, limit = 20) {
    return await prisma.marketInsight.findMany({
      where: { category, isPublished: true },
      include: {
        author: {
          select: { id: true, name: true }
        },
        region: true,
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });
  },

  /**
   * Get insights by region
   */
  async findByRegion(regionId, limit = 20) {
    return await prisma.marketInsight.findMany({
      where: { regionId, isPublished: true },
      include: {
        author: {
          select: { id: true, name: true }
        },
        region: true,
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });
  },

  /**
   * Get all categories
   */
  async getCategories() {
    const insights = await prisma.marketInsight.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category'],
    });
    return insights.map(i => i.category).filter(Boolean);
  },

  /**
   * Create market insight
   */
  async create(data) {
    const {
      title,
      slug,
      content,
      summary,
      authorId,
      category,
      subcategory,
      regionId,
      tags,
      imageUrl,
      videoUrl,
      isFeatured,
      isPublished,
      isPremium,
      metaTitle,
      metaDescription,
    } = data;

    return await prisma.marketInsight.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content,
        summary,
        authorId,
        category,
        subcategory,
        regionId,
        tags: tags || [],
        imageUrl,
        videoUrl,
        isFeatured: isFeatured || false,
        isPublished: isPublished || false,
        isPremium: isPremium || false,
        metaTitle,
        metaDescription,
        publishedAt: isPublished ? new Date() : null,
      },
      include: {
        author: {
          select: { id: true, name: true }
        },
        region: true,
      },
    });
  },

  /**
   * Update market insight
   */
  async update(id, data) {
    const {
      title,
      content,
      summary,
      category,
      subcategory,
      regionId,
      tags,
      imageUrl,
      videoUrl,
      isFeatured,
      isPublished,
      isPremium,
      metaTitle,
      metaDescription,
    } = data;

    // Check if publishing for the first time
    const existing = await prisma.marketInsight.findUnique({ where: { id } });
    const isFirstPublish = !existing?.isPublished && isPublished;

    return await prisma.marketInsight.update({
      where: { id },
      data: {
        title,
        content,
        summary,
        category,
        subcategory,
        regionId,
        tags,
        imageUrl,
        videoUrl,
        isFeatured,
        isPublished,
        isPremium,
        metaTitle,
        metaDescription,
        publishedAt: isFirstPublish ? new Date() : undefined,
      },
      include: {
        author: {
          select: { id: true, name: true }
        },
        region: true,
      },
    });
  },

  /**
   * Delete market insight
   */
  async delete(id) {
    return await prisma.marketInsight.delete({
      where: { id },
    });
  },

  /**
   * Increment view count
   */
  async incrementViews(id) {
    return await prisma.marketInsight.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  },

  /**
   * Increment likes
   */
  async incrementLikes(id) {
    return await prisma.marketInsight.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });
  },

  /**
   * Search insights
   */
  async search(query, limit = 20) {
    return await prisma.marketInsight.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
          { summary: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        author: { select: { id: true, name: true } },
        region: true,
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
    });
  },
};

module.exports = marketInsightRepository;



