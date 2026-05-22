const Profile = require('../models/Profile.model');
const Scheme = require('../models/Scheme.model');
const EligibilityResult = require('../models/EligibilityResult.model');
const { runEligibilityCheck } = require('../utils/eligibility.utils');

// @desc    Run eligibility check for logged-in user
// @route   POST /api/eligibility/check
// @access  Private
const checkEligibility = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    if (!profile || !profile.isComplete) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile before checking eligibility',
      });
    }

    const requiredFields = [
      'fullName',
      'age',
      'state',
      'gender',
      'category',
      'educationLevel',
      'stream',
      'profession',
      'annualFamilyIncome',
      'cgpaOrPercentage',
    ];
    const missingProfileFields = requiredFields.filter(
      (field) => profile[field] === undefined || profile[field] === null || profile[field] === ''
    );

    if (missingProfileFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile before checking eligibility',
        missingFields: missingProfileFields,
      });
    }

    const schemes = await Scheme.find({ isActive: true });
    if (!schemes.length) {
      return res.status(404).json({ success: false, message: 'No active schemes found' });
    }

    const { results, totalChecked, totalEligible } = runEligibilityCheck(profile, schemes);

    // Save result to DB
    const saved = await EligibilityResult.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        profile: profile._id,
        results: results.map(r => ({
          scheme: r.scheme,
          eligible: r.eligible,
          matchScore: r.matchScore,
          matchedCriteria: r.matchedCriteria,
          missingCriteria: r.missingCriteria,
          missingDocuments: r.missingDocuments,
          eligibilityProbability: r.eligibilityProbability,
          confidenceScore: r.confidenceScore,
          rejectionReasons: r.rejectionReasons,
          suggestions: r.suggestions,
        })),
        totalChecked,
        totalEligible,
        checkedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    // Return with full scheme data populated
    res.json({
      success: true,
      message: `Eligibility check complete. ${totalEligible} schemes found!`,
      data: {
        totalChecked,
        totalEligible,
        totalNotEligible: totalChecked - totalEligible,
        checkedAt: saved.checkedAt,
        results: results.map(r => ({
          ...r.schemeData.toObject(),
          eligible: r.eligible,
          matchScore: r.matchScore,
          matchedCriteria: r.matchedCriteria,
          missingCriteria: r.missingCriteria,
          missingDocuments: r.missingDocuments,
          eligibilityProbability: r.eligibilityProbability,
          confidenceScore: r.confidenceScore,
          rejectionReasons: r.rejectionReasons,
          suggestions: r.suggestions,
        })),
      },
    });
  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ success: false, message: 'Server error during eligibility check' });
  }
};

// @desc    Get last eligibility results
// @route   GET /api/eligibility/results
// @access  Private
const getResults = async (req, res) => {
  try {
    const result = await EligibilityResult.findOne({ user: req.user._id })
      .sort({ checkedAt: -1 })
      .populate('results.scheme');

    if (!result) {
      return res.json({ success: true, data: null, message: 'No results yet. Run eligibility check first.' });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { checkEligibility, getResults };
