const express = require('express');
const { getSchemes, getScheme, createScheme, updateScheme, deleteScheme } = require('../controllers/scheme.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getSchemes);
router.get('/:id', getScheme);

// Admin only
router.post('/', protect, adminOnly, createScheme);
router.put('/:id', protect, adminOnly, updateScheme);
router.delete('/:id', protect, adminOnly, deleteScheme);

module.exports = router;
