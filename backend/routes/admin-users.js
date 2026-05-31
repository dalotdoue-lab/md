const express = require('express');
const router = express.Router();
const adminUsersController = require('../controllers/adminUsersController');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/admin/users - List all users
 */
router.get('/users', authenticate, requireAdmin, adminUsersController.getAllUsers);

/**
 * GET /api/admin/users/:id - Get user details
 */
router.get('/users/:id', authenticate, requireAdmin, adminUsersController.getUserDetails);

/**
 * PATCH /api/admin/users/:id/role - Update role
 */
router.patch('/users/:id/role', authenticate, requireAdmin, adminUsersController.updateUserRole);

/**
 * PATCH /api/admin/users/:id/suspend - Toggle suspend status
 */
router.patch('/users/:id/suspend', authenticate, requireAdmin, adminUsersController.toggleUserSuspend);

module.exports = router;

