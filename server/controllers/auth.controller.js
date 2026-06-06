const User = require('../models/User.model');
const Profile = require('../models/Profile.model');
const { sendTokenResponse } = require('../utils/jwt.utils');
const { validationResult } = require('express-validator');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    // Create empty profile
    await Profile.create({ user: user._id, fullName: name, age: 18, annualFamilyIncome: 0, educationLevel: 'Below 10th', category: 'General', state: 'Other' });

    sendTokenResponse(user, 201, res, 'Account created successfully');
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Logout (client-side token removal, but we acknowledge it)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// Decode Google Credential JWT
const decodeGoogleToken = (token) => {
  try {
    const payloadBase64 = token.split('.')[1];
    const decoded = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
};

// @desc    Login or register with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ success: false, message: 'Google credential is required' });
  }

  let payload;
  if (credential.startsWith('mock_google_token_')) {
    try {
      const decodedMock = JSON.parse(Buffer.from(credential.replace('mock_google_token_', ''), 'base64').toString('utf-8'));
      payload = {
        email: decodedMock.email,
        name: decodedMock.name,
        picture: decodedMock.picture || '',
        sub: decodedMock.sub || `mock_${Date.now()}`
      };
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid Mock Google token' });
    }
  } else {
    payload = decodeGoogleToken(credential);
  }

  if (!payload || !payload.email) {
    return res.status(400).json({ success: false, message: 'Invalid Google credential' });
  }

  const { email, name, picture, sub } = payload;

  try {
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const randomPassword = Math.random().toString(36).slice(-8) + 'A1!';
      user = await User.create({
        name,
        email,
        password: randomPassword,
        googleId: sub,
        avatar: picture || '',
        isEmailVerified: true
      });

      // Create empty profile
      await Profile.create({
        user: user._id,
        fullName: name,
        age: 18,
        annualFamilyIncome: 0,
        educationLevel: 'Below 10th',
        category: 'General',
        state: 'Other'
      });
    } else {
      let changed = false;
      if (!user.googleId) {
        user.googleId = sub;
        changed = true;
      }
      if (picture && user.avatar !== picture) {
        user.avatar = picture;
        changed = true;
      }
      if (changed) {
        await user.save();
      }
    }

    sendTokenResponse(user, 200, res, isNewUser ? 'Account registered and logged in with Google' : 'Logged in with Google successfully');
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google Login' });
  }
};

// @desc    Get auth configurations (like Google Client ID)
// @route   GET /api/auth/config
// @access  Public
const getAuthConfig = async (req, res) => {
  res.json({
    success: true,
    googleClientId: process.env.GOOGLE_CLIENT_ID || ''
  });
};

module.exports = { register, login, getMe, logout, googleLogin, getAuthConfig };


