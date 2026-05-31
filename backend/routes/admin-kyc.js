const express = require('express');
const router = express.Router();
const adminKYCController = require('../controllers/adminKYCController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/kyc/' });

/**
 * GET /api/admin/kyc - List KYC requests
 */
router.get('/kyc', authenticate, requireAdmin, adminKYCController.getKYCRequests);

/**
 * GET /api/admin/kyc/:id - Get KYC details
 */
router.get('/kyc/:id', authenticate, requireAdmin, adminKYCController.getKYCDetails);

/**
 * PATCH /api/admin/kyc/:id/approve - Approve KYC
 */
router.patch('/kyc/:id/approve', authenticate, requireAdmin, adminKYCController.approveKYC);

/**
 * PATCH /api/admin/kyc/:id/reject - Reject KYC
 */
router.patch('/kyc/:id/reject', authenticate, requireAdmin, adminKYCController.rejectKYC);

/**
 * POST /api/admin/kyc/:id/document - Upload additional documents (admin)
 */
router.post('/kyc/:id/document', authenticate, requireAdmin, upload.single('document'), (req, res) => {
  // Handle uploaded document
  res.json({ success: true, message: 'Document uploaded' });
});

module.exports = router;

