const express = require('express');
const { getAdminAnalytics, exportAdminReport } = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly); // Only admin can access these routes

router.get('/analytics', getAdminAnalytics);
router.get('/reports/export', exportAdminReport);

module.exports = router;
