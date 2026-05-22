const express = require('express');
const { getProfile, upsertProfile, toggleBookmark, getBookmarks } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect); // All user routes are protected

router.get('/profile', getProfile);
router.put('/profile', upsertProfile);
router.get('/bookmarks', getBookmarks);
router.post('/bookmarks/:schemeId', toggleBookmark);

module.exports = router;
