const prisma = require('../lib/prisma');

/**
 * Add KYC model to schema.prisma first, then run:
 * npx prisma migrate dev --name add-kyc
 * npx prisma generate
 */

 /**
 * GET /api/admin/kyc - Get KYC requests (pending/approved/rejected)
 */
exports.getKYCRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending', userId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      status: status === 'all' ? undefined : status
    };

    if (userId) {
      where.userId = userId;
    }

    const [kycRequests, total] = await Promise.all([
      prisma.kyc.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              company: true,
              country: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.kyc.count({ where })
    ]);

    res.json({
      success: true,
      kycRequests,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: {
        pending: await prisma.kyc.count({ where: { status: 'pending' } }),
        approved: await prisma.kyc.count({ where: { status: 'approved' } }),
        rejected: await prisma.kyc.count({ where: { status: 'rejected' } })
      }
    });
  } catch (error) {
    console.error('Get KYC requests error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/admin/kyc/:id/approve - Approve KYC
 */
exports.approveKYC = async (req, res) => {
  try {
    const kycId = req.params.id;
    const { notes } = req.body;

    const kyc = await prisma.kyc.update({
      where: { id: kycId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        adminNotes: notes,
        adminId: req.user.id
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Optional: Send approval email/notification

    res.json({
      success: true,
      message: `KYC approved for ${kyc.user.name}`,
      kycId
    });
  } catch (error) {
    console.error('Approve KYC error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /api/admin/kyc/:id/reject - Reject KYC
 */
exports.rejectKYC = async (req, res) => {
  try {
    const kycId = req.params.id;
    const { reason, notes } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, error: 'Reason required for rejection' });
    }

    const kyc = await prisma.kyc.update({
      where: { id: kycId },
      data: {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectionReason: reason,
        adminNotes: notes,
        adminId: req.user.id
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // Optional: Send rejection email/notification

    res.json({
      success: true,
      message: `KYC rejected for ${kyc.user.name}: ${reason}`,
      kycId
    });
  } catch (error) {
    console.error('Reject KYC error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/admin/kyc/:id - Get single KYC details with documents
 */
exports.getKYCDetails = async (req, res) => {
  try {
    const kycId = req.params.id;

    const kyc = await prisma.kyc.findUnique({
      where: { id: kycId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
            country: true
          }
        },
        documents: true
      }
    });

    if (!kyc) {
      return res.status(404).json({ success: false, error: 'KYC request not found' });
    }

    res.json({ success: true, kyc });
  } catch (error) {
    console.error('Get KYC details error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

