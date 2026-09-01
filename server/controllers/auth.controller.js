const User = require('../models/User.model');
const Profile = require('../models/Profile.model');
const { sendTokenResponse } = require('../utils/jwt.utils');
const { validationResult } = require('express-validator');

// Helper to seed demo accounts on demand
const ensureDemoAccounts = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@demo.com' });
    if (!adminExists) {
      await User.create({
        name: 'UniScholar System Admin',
        email: 'admin@demo.com',
        password: 'demo@123',
        role: 'admin',
        isEmailVerified: true
      });
    }

    const partnerExists = await User.findOne({ email: 'partner@demo.com' });
    if (!partnerExists) {
      await User.create({
        name: 'AICTE Welfare Partner',
        email: 'partner@demo.com',
        password: 'demo@123',
        role: 'partner',
        organization: 'All India Council for Technical Education (AICTE)',
        partnerStatus: 'Active',
        isEmailVerified: true
      });
    }

    const studentExists = await User.findOne({ email: 'student@demo.com' });
    if (!studentExists) {
      const student = await User.create({
        name: 'Priya Sharma',
        email: 'student@demo.com',
        password: 'demo@123',
        role: 'student',
        isEmailVerified: true
      });
      await Profile.create({
        user: student._id,
        fullName: 'Priya Sharma',
        age: 19,
        gender: 'Female',
        state: 'Gujarat',
        annualFamilyIncome: 150000,
        educationLevel: '12th Pass',
        stream: 'Science',
        category: 'General',
        cgpaOrPercentage: 88,
        isComplete: true
      });
    }
  } catch (err) {
    console.error('Demo account seeding notice:', err.message);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { name, email, password, role, organization } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const assignedRole = ['admin', 'partner'].includes(role) ? role : 'student';

    const user = await User.create({ 
      name, 
      email, 
      password,
      role: assignedRole,
      organization: organization || (assignedRole === 'partner' ? 'Scholarship Partner Org' : '')
    });

    // Create empty profile
    await Profile.create({ user: user._id, fullName: name, age: 18, annualFamilyIncome: 0, educationLevel: '12th Pass', category: 'General', state: 'Other' });

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
    await ensureDemoAccounts();

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

  const decoded = decodeGoogleToken(credential);
  if (!decoded || !decoded.email) {
    return res.status(400).json({ success: false, message: 'Invalid Google token' });
  }

  const { email, name, picture, sub } = decoded;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId: sub,
        avatar: picture || '',
        isEmailVerified: true,
      });

      await Profile.create({ user: user._id, fullName: name || 'Google User', age: 18, annualFamilyIncome: 0, educationLevel: '12th Pass', category: 'General', state: 'Other' });
    } else if (!user.googleId) {
      user.googleId = sub;
      if (picture && !user.avatar) user.avatar = picture;
      user.isEmailVerified = true;
      await user.save();
    }

    sendTokenResponse(user, 200, res, 'Google authentication successful');
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google authentication' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  googleLogin,
};
