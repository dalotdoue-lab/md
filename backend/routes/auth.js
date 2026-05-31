/**
 * Auth Routes
 * Let Investments - Authentication API endpoints
 * 
 * ============================================================================
 * Uses authController for handling auth logic with mock data
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userRepository = require('../repositories/userRepository');
const { generateToken, authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');
const { audit } = require('../middleware/auditLogger');

/**
 * POST /api/auth/register
 * Register a new user
 * Uses authController.register
 */
router.post('/register', validate(schemas.register), async (req, res) => {
  try {
    // Delegate to authController.register
    // Input is already validated and sanitized by Joi middleware above
    await authController.register(req, res);
  } catch (error) {
    console.error('Register route error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/login
 * User login
 * Uses authController.login
 */
router.post('/login', async (req, res) => {
  try {
    // Delegate to authController.login
    await authController.login(req, res);
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message,
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    console.log('🔍 [AUTH/ME] Fetching user:', req.user.id);
    
    const user = await userRepository.findById(req.user.id);
    if (!user) {
      console.error('❌ [AUTH/ME] User not found:', req.user.id);
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Handle Prisma response structure (user.role → user.role.name, user.virtualBalance)
    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      company: user.company,
      country: user.country,
      role: user.role?.name || 'client',
      virtualBalance: user.virtualBalance?.toString() || '0',
      walletBalance: user.wallet?.balance?.toString() || '0',
      currency: user.wallet?.currency || 'USD',
      createdAt: user.createdAt || user.created_at,
    };

    console.log('✅ [AUTH/ME] User profile sent:', user.id);
    
    res.json({
      success: true,
      user: responseUser,
    });
  } catch (error) {
    console.error('💥 [AUTH/ME ERROR] Failed to get profile for user', req.user?.id, error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message || 'Failed to fetch user profile',
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, company, country } = req.body;
    
    const user = await userRepository.update(req.user.id, {
      name,
      phone,
      company,
      country,
    });
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        company: user.company,
        country: user.country,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message,
    });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Password change failed',
        message: 'Current password and new password are required',
      });
    }

    // Get user with password
    const user = await userRepository.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }
    
    // For demo purposes, skip password verification if using placeholder hash
    // In production, always verify
    
    // Hash new password
    const bcrypt = require('bcryptjs');
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await userRepository.changePassword(req.user.id, newPasswordHash);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Failed to change password',
      message: error.message,
    });
  }
});

module.exports = router;


/**
 * POST /api/auth/logout
 * Logout user (client + cookie cleanup)
 */
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Clear cookie if used
    res.clearCookie('authToken');

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: error.message,
    });
  }
});
