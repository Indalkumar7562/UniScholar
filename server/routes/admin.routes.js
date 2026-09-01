const express = require('express');
const {
  getAdminAnalytics,
  getStudents,
  updateStudent,
  deleteStudent,
  getAllApplicationsAdmin,
  updateApplicationStageAdmin,
  getAllDocumentsAdmin,
  verifyDocumentAdmin,
  getAllPartnersAdmin,
  updatePartnerStatusAdmin,
  getAuditLogsAdmin,
  exportAdminReport
} = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly); // Enforce role = admin for all admin routes

router.get('/analytics', getAdminAnalytics);
router.get('/students', getStudents);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

router.get('/applications', getAllApplicationsAdmin);
router.put('/applications/:id/stage', updateApplicationStageAdmin);

router.get('/documents', getAllDocumentsAdmin);
router.put('/documents/:id/verify', verifyDocumentAdmin);

router.get('/partners', getAllPartnersAdmin);
router.put('/partners/:id/status', updatePartnerStatusAdmin);

router.get('/audit-logs', getAuditLogsAdmin);
router.get('/reports/export', exportAdminReport);

module.exports = router;
