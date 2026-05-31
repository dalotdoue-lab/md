/**
 * Blog CMS Routes - Admin Only
 * Mounted at /api/admin/blog/*
 */

const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/admin/blog - List posts (paginated)
 */
router.get('/', authenticate, requireAdmin, blogController.getPosts);

/**
 * POST /api/admin/blog - Create new post (draft)
 */
router.post('/', authenticate, requireAdmin, blogController.createPost);

/**
 * PATCH /api/admin/blog/:id - Update/publish post
 */
router.patch('/:id', authenticate, requireAdmin, blogController.updatePost);

/**
 * DELETE /api/admin/blog/:id - Delete post
 */
router.delete('/:id', authenticate, requireAdmin, blogController.deletePost);

module.exports = router;

