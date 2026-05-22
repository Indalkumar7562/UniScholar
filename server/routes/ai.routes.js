const express = require('express');
const { verifyDocumentOCR, getRecommendations, chatWithAI } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All AI routes are protected

router.post('/verify-document', verifyDocumentOCR);
router.get('/recommendations', getRecommendations);
router.post('/chat', chatWithAI);

module.exports = router;
