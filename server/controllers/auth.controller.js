const User = require('../models/User.model');
const Profile = require('../models/Profile.model');
const { sendTokenResponse } = require('../utils/jwt.utils');
const { validationResult } = require('express-validator');

// Helper to generate permanent unique Student ID: USS-STU-2026-000001
const generateUniqueStudentId = async () => {
  const count = await User.countDocuments({ role: 'student', studentId: { $exists: true, $ne: '' } });
  const nextNum = String(count + 1).padStart(6, '0');
  let candidate = `USS-STU-2026-${nextNum}`;
  
  let exists = await User.findOne({ studentId: candidate });
  let offset = 1;
  while (exists) {
    candidate = `USS-STU-2026-${String(count + 1 + offset).padStart(6, '0')}`;
    exists = await User.findOne({ studentId: candidate });
    offset++;
  }
  return candidate;
};

// Automatic Backfill Migration for Existing Accounts
const backfillStudentIds = async () => {
  try {
    const studentsWithoutId = await User.find({ 
      role: 'student', 
      $or: [{ studentId: { $exists: false } }, { studentId: '' }, { studentId: null }] 
    });
    for (const student of studentsWithoutId) {
      student.studentId = await generateUniqueStudentId();
      await student.save();
    }
  } catch (err) {
    console.error('Student ID backfill notice:', err.message);
  }
};

// Helper to seed demo accounts on demand
const ensureDemoAccounts = async () => {
  try {
    let adminDemoExists = await User.findOne({ email: 'admin@demo.com' });
    if (!adminDemoExists) {
      await User.create({
        name: 'UniScholar System Admin',
        email: 'admin@demo.com',
        password: 'demo@123',
        role: 'admin',
        isEmailVerified: true
      });
    } else if (adminDemoExists.role !== 'admin') {
      adminDemoExists.role = 'admin';
      await adminDemoExists.save();
    }

    let adminGovExists = await User.findOne({ email: 'admin@uss.gov.in' });
    if (!adminGovExists) {
      await User.create({
        name: 'USS Platform Administrator',
        email: 'admin@uss.gov.in',
        password: 'admin@123',
        role: 'admin',
        isEmailVerified: true
      });
    } else if (adminGovExists.role !== 'admin') {
      adminGovExists.role = 'admin';
      await adminGovExists.save();
    }

    let indalAdminExists = await User.findOne({ email: 'indalkumar62073@gmail.com' });
    if (!indalAdminExists) {
      await User.create({
        name: 'Indal Kumar',
        email: 'indalkumar62073@gmail.com',
        password: 'admin@123',
        role: 'admin',
        isEmailVerified: true
      });
    } else if (indalAdminExists.role !== 'admin') {
      indalAdminExists.role = 'admin';
      await indalAdminExists.save();
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
      const studentId = await generateUniqueStudentId();
      const student = await User.create({
        name: 'Priya Sharma',
        email: 'student@demo.com',
        password: 'demo@123',
        role: 'student',
        studentId: 'USS-STU-2026-000001',
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

    await backfillStudentIds();
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
    let studentId = undefined;
    if (assignedRole === 'student') {
      studentId = await generateUniqueStudentId();
    }

    const user = await User.create({ 
      name, 
      email, 
      password,
      role: assignedRole,
      studentId,
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
  await ensureDemoAccounts();

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Auto-promote admin emails to admin role if needed
    if (['admin@uss.gov.in', 'admin@demo.com', 'indalkumar62073@gmail.com'].includes(user.email.toLowerCase()) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    // Ensure studentId is backfilled if missing on login
    if (user.role === 'student' && !user.studentId) {
      user.studentId = await generateUniqueStudentId();
      await user.save();
    }

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    if (user.role === 'student' && !user.studentId) {
      user.studentId = await generateUniqueStudentId();
      await user.save();
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Google auth callback / login
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  const { googleId, email, name, avatar } = req.body;

  try {
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      const studentId = await generateUniqueStudentId();
      user = await User.create({
        name,
        email,
        googleId,
        avatar: avatar || '',
        role: 'student',
        studentId,
        isEmailVerified: true,
      });

      await Profile.create({
        user: user._id,
        fullName: name,
        age: 18,
        annualFamilyIncome: 0,
        educationLevel: '12th Pass',
        category: 'General',
        state: 'Other'
      });
    }

    sendTokenResponse(user, 200, res, 'Google authentication successful');
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google authentication' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  register,
  login,
  getMe,
  googleAuth,
  logout,
  ensureDemoAccounts
};
