const Scheme = require('../models/Scheme.model');
const Profile = require('../models/Profile.model');
const { runEligibilityCheck } = require('../utils/eligibility.utils');

// @desc    Get all schemes with filtering & search
// @route   GET /api/schemes
// @access  Public
const getSchemes = async (req, res) => {
  try {
    const { search, category, state, sort, status, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (category && category !== 'All') query.category = category;
    if (state && state !== 'All') {
      query.$or = [
        { 'eligibilityCriteria.states': 'All' },
        { 'eligibilityCriteria.states': state },
      ];
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'deadline' || sort === 'deadline_asc') {
      sortOption = { applicationDeadline: 1 };
    } else if (sort === 'deadline_desc') {
      sortOption = { applicationDeadline: -1 };
    } else if (sort === 'amount' || sort === 'amount_desc') {
      sortOption = { amountValue: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [schemes, total] = await Promise.all([
      Scheme.find(query).skip(skip).limit(parseInt(limit)).sort(sortOption),
      Scheme.countDocuments(query),
    ]);

    res.json({
      success: true,
      schemes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single scheme
// @route   GET /api/schemes/:id
// @access  Public
const getScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
    res.json({ success: true, scheme });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create scheme (Admin only)
// @route   POST /api/schemes
// @access  Private/Admin
const createScheme = async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    res.status(201).json({ success: true, message: 'Scheme created', scheme });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Scheme name already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update scheme (Admin only)
// @route   PUT /api/schemes/:id
// @access  Private/Admin
const updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
    res.json({ success: true, message: 'Scheme updated', scheme });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete scheme (Admin only)
// @route   DELETE /api/schemes/:id
// @access  Private/Admin
const deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
    res.json({ success: true, message: 'Scheme deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Compare schemes with user profile and rank them
// @route   GET /api/schemes/compare/ranked
// @access  Private
const compareAndRankSchemes = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile || !profile.isComplete) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile before comparing schemes',
      });
    }

    const schemes = await Scheme.find({ isActive: true }).sort({ createdAt: -1 });
    if (!schemes.length) {
      return res.status(404).json({ success: false, message: 'No active schemes found' });
    }

    // Run eligibility check for all schemes
    const { results } = runEligibilityCheck(profile, schemes);

    // Group and rank schemes
    const eligible = results.filter(r => r.eligible).sort((a, b) => b.matchScore - a.matchScore);
    const partialMatch = results.filter(r => !r.eligible && r.matchScore >= 50).sort((a, b) => b.matchScore - a.matchScore);
    const lowMatch = results.filter(r => r.matchScore < 50).sort((a, b) => b.matchScore - a.matchScore);

    // Enhanced response with categorized schemes
    res.json({
      success: true,
      data: {
        profile: {
          fullName: profile.fullName,
          age: profile.age,
          category: profile.category,
          state: profile.state,
          educationLevel: profile.educationLevel,
          stream: profile.stream,
          annualFamilyIncome: profile.annualFamilyIncome,
        },
        summary: {
          totalSchemes: schemes.length,
          directlyEligible: eligible.length,
          partiallyMatched: partialMatch.length,
          lowMatched: lowMatch.length,
          comparisonDate: new Date().toISOString(),
        },
        ranked: {
          directlyEligible: eligible.map(r => ({
            ...r.schemeData.toObject(),
            matchScore: r.matchScore,
            matchedCriteria: r.matchedCriteria,
            missingCriteria: r.missingCriteria,
            missingDocuments: r.missingDocuments,
            suggestions: r.suggestions,
            tier: 'Directly Eligible',
          })),
          partiallyMatched: partialMatch.map(r => ({
            ...r.schemeData.toObject(),
            matchScore: r.matchScore,
            matchedCriteria: r.matchedCriteria,
            missingCriteria: r.missingCriteria,
            missingDocuments: r.missingDocuments,
            suggestions: r.suggestions,
            tier: 'Partially Matched',
          })),
          lowMatched: lowMatch.map(r => ({
            ...r.schemeData.toObject(),
            matchScore: r.matchScore,
            matchedCriteria: r.matchedCriteria,
            missingCriteria: r.missingCriteria,
            missingDocuments: r.missingDocuments,
            suggestions: r.suggestions,
            tier: 'Low Match - Future Target',
          })),
        },
      },
    });
  } catch (error) {
    console.error('Scheme comparison error:', error);
    res.status(500).json({ success: false, message: 'Server error during scheme comparison' });
  }
};

module.exports = { getSchemes, getScheme, createScheme, updateScheme, deleteScheme, compareAndRankSchemes };
