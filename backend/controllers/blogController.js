/**
 * Blog CMS Controller - Kingstone Investments
 * Admin-only: Create/Edit/Delete/Publish blog posts
 * Fields: title, slug, content, status(draft|published), featuredImage
 */

const prisma = require('../lib/prisma');
const auditLogger = require('../middleware/auditLogger');
const path = require('path');
const fs = require('fs').promises;

const blogController = {

  /**
   * GET /api/admin/blog - List posts (paginated, filter by status)
   */
  getPosts: async (req, res) => {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
          orderBy: { publishedAt: 'desc', createdAt: 'desc' },
          skip,
          take: parseInt(limit),
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            status: true,
            featuredImage: true,
            createdAt: true,
            updatedAt: true,
            publishedAt: true,
            author: {
              select: { name: true }
            }
          }
        }),
        prisma.post.count({ where })
      ]);

      res.json({
        success: true,
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('[BLOG-GET]', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * POST /api/admin/blog - Create new post (draft)
   */
  createPost: async (req, res) => {
    try {
      const { title, content, excerpt, featuredImage, tags = [] } = req.body;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

      const post = await prisma.post.create({
        data: {
          title,
          slug,
          content,
          excerpt: excerpt || content.slice(0, 160),
          status: 'draft',
          featuredImage,
          tags: tags.join(','),
          authorId: req.user.id
        }
      });

      // Audit
      auditLogger.createBlogPost(req.user.id, post, req.ip);

      res.status(201).json({
        success: true,
        message: 'Post created (draft)',
        post
      });
    } catch (error) {
      console.error('[BLOG-CREATE]', error);
      res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * PATCH /api/admin/blog/:id - Update post
   */
  updatePost: async (req, res) => {
    try {
      const postId = req.params.id;
      const { title, content, excerpt, status, featuredImage, tags = [] } = req.body;

      // Auto-generate slug if title changed
      let slug = undefined;
      if (title) {
        slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }

      // Publish: set publishedAt
      const data = {
        title,
        slug,
        content,
        excerpt: excerpt || content?.slice(0, 160),
        featuredImage,
        tags: tags.join(','),
        status
      };

      if (status === 'published' && !req.body.publishedAt) {
        data.publishedAt = new Date();
      }

      const post = await prisma.post.update({
        where: { id: postId },
        data
      });

      // Audit
      auditLogger.updateBlogPost(req.user.id, { postId, changes: data }, req.ip);

      res.json({
        success: true,
        message: status === 'published' ? 'Post published!' : 'Post updated',
        post
      });
    } catch (error) {
      console.error('[BLOG-UPDATE]', error);
      res.status(400).json({ success: false, error: error.message });
    }
  },

  /**
   * DELETE /api/admin/blog/:id - Delete post
   */
  deletePost: async (req, res) => {
    try {
      const postId = req.params.id;

      // Delete featured image if exists
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (post?.featuredImage && post.featuredImage.startsWith('uploads/')) {
        try {
          await fs.unlink(path.join(__dirname, '../../', post.featuredImage));
        } catch (fsErr) {
          console.warn('[BLOG-DELETE] Image cleanup failed:', fsErr.message);
        }
      }

      await prisma.post.delete({ where: { id: postId } });

      // Audit
      auditLogger.deleteBlogPost(req.user.id, { postId }, req.ip);

      res.json({
        success: true,
        message: 'Post deleted'
      });
    } catch (error) {
      console.error('[BLOG-DELETE]', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = blogController;

