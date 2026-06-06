const User = require('../models/User.model');
const Profile = require('../models/Profile.model');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create or update user profile
// @route   PUT /api/users/profile
// @access  Private
const upsertProfile = async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      state,
      district,
      mobileNumber,
      email,
      educationLevel,
      stream,
      collegeName,
      cgpaOrPercentage,
      currentYearOrSemester,
      profession,
      annualFamilyIncome,
      bplStatus,
      category,
      minorityStatus,
      disabilityStatus,
      documentUploads,
    } = req.body;

    const profileData = {
      fullName,
      age,
      gender,
      state,
      district,
      mobileNumber,
      email,
      educationLevel,
      stream,
      collegeName,
      cgpaOrPercentage,
      currentYearOrSemester,
      profession,
      annualFamilyIncome,
      bplStatus,
      category,
      minorityStatus,
      disabilityStatus,
      documentUploads,
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { ...profileData, user: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );

    // Keep user name in sync
    await User.findByIdAndUpdate(req.user._id, { name: fullName });

    res.json({ success: true, message: 'Profile saved successfully', profile });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const msg = Object.values(error.errors).map(e => e.message).join('. ');
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Toggle bookmark a scheme
// @route   POST /api/users/bookmarks/:schemeId
// @access  Private
const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const schemeId = req.params.schemeId;
    const isBookmarked = user.bookmarks.includes(schemeId);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== schemeId);
    } else {
      user.bookmarks.push(schemeId);
    }
    await user.save();

    res.json({
      success: true,
      message: isBookmarked ? 'Bookmark removed' : 'Scheme bookmarked',
      bookmarked: !isBookmarked,
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get bookmarked schemes
// @route   GET /api/users/bookmarks
// @access  Private
const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');
    res.json({ success: true, bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).populate('bookmarks');

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      user,
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile picture' });
  }
};

module.exports = { getProfile, upsertProfile, toggleBookmark, getBookmarks, updateAvatar };

