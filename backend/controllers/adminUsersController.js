const prisma = require('../lib/prisma');
const userRepository = require('../repositories/userRepository');

/**
 * GET /api/admin/users - Get all users (admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, role, suspended, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isActive: true // Exclude deleted users
    };

    if (role && role !== 'all') {
      where.role = { name: role };
    }

    if (suspended !== undefined) {
      where.isActive = suspended === 'true' ? false : true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          role: { select: { name: true } },
          wallet: {
            select: { balance: true, currency: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id/role - Update user role
 */
exports.updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!['client', 'admin', 'manager'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId: role }, // Assumes role.name maps to roleId
      include: { role: true }
    });

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/admin/users/:id/suspend - Suspend/unsuspend user
 */
exports.toggleUserSuspend = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isSuspended = !user.isActive;

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive }
    });

    // If suspending, also handle wallet
    if (isSuspended) {
      await prisma.wallet.updateMany({
        where: { userId },
        data: { status: 'frozen' }
      });
    } else {
      await prisma.wallet.updateMany({
        where: { userId },
        data: { status: 'active' }
      });
    }

    res.json({
      success: true,
      message: isSuspended ? 'User suspended' : 'User reactivated',
      suspended: isSuspended
    });
  } catch (error) {
    console.error('Toggle suspend error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/admin/users/:id - Get single user details (admin)
 */
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        wallet: {
          include: {
            transactions: {
              take: 10,
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        investments: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

