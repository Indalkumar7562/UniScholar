const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const {
  getUserApplications,
  createOrUpdateApplication,
  updateApplicationStatus,
  deleteApplication,
} = require('../controllers/application.controller');

const router = express.Router();

router.use(protect); // All application routes require authentication

router.get('/', getUserApplications);
router.post('/', createOrUpdateApplication);
router.put('/:id', updateApplicationStatus);
router.delete('/:id', deleteApplication);

module.exports = router;
