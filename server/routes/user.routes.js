const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getProfile, upsertProfile, toggleBookmark, getBookmarks, updateAvatar, removeAvatar } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Configure avatar storage (separate from private student documents)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPG, JPEG, and PNG images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.use(protect); // All user routes are protected

router.get('/profile', getProfile);
router.put('/profile', upsertProfile);

// Profile photo endpoints
router.put('/avatar', upload.single('avatar'), updateAvatar);
router.post('/avatar', upload.single('avatar'), updateAvatar);
router.delete('/avatar', removeAvatar);

// Profile image alias endpoints
router.post('/profile/image', upload.single('avatar'), updateAvatar);
router.delete('/profile/image', removeAvatar);

router.get('/bookmarks', getBookmarks);
router.post('/bookmarks/:schemeId', toggleBookmark);

module.exports = router;

