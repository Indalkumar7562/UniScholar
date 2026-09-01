const Application = require('../models/Application.model');
const Scheme = require('../models/Scheme.model');
const Profile = require('../models/Profile.model');
const Document = require('../models/Document.model');
const { checkSchemeEligibility } = require('../utils/eligibility.utils');

// Helper to calculate Application Readiness Score (0 - 100%)
const calculateReadiness = async (userId, scheme) => {
  const profile = await Profile.findOne({ user: userId });
  if (!profile) return 0;

  // 1. Profile Completeness (30%)
  const coreFields = ['fullName', 'age', 'state', 'educationLevel', 'category', 'annualFamilyIncome'];
  let filledCount = 0;
  coreFields.forEach((f) => {
    if (profile[f] !== undefined && profile[f] !== null && profile[f] !== '') filledCount++;
  });
  const profileScore = (filledCount / coreFields.length) * 30;

  // 2. Eligibility Verification Match (30%)
  const eligibility = checkSchemeEligibility(profile, scheme);
  const eligibilityScore = (eligibility.matchScore / 100) * 30;

  // 3. Document Preparation (30%)
  const requiredDocs = scheme.requiredDocuments || [];
  let docsUploaded = 0;
  if (requiredDocs.length > 0) {
    const userDocs = await Document.find({ user: userId });
    const userDocNames = userDocs.map((d) => d.name.toLowerCase());
    requiredDocs.forEach((docName) => {
      const lower = docName.toLowerCase();
      const hasMatch = userDocNames.some((dName) => {
        if (lower.includes('aadhaar')) return dName.includes('aadhaar');
        if (lower.includes('income')) return dName.includes('income');
        if (lower.includes('caste') || lower.includes('category')) return dName.includes('caste') || dName.includes('category');
        if (lower.includes('domicile') || lower.includes('resident')) return dName.includes('domicile') || dName.includes('residence');
        if (lower.includes('marksheet') || lower.includes('marks')) return dName.includes('marksheet') || dName.includes('marks');
        return true;
      });
      if (hasMatch) docsUploaded++;
    });
    const docScore = (docsUploaded / requiredDocs.length) * 30;

    return Math.round(profileScore + eligibilityScore + docScore + 10);
  }

  return Math.round(profileScore + eligibilityScore + 40);
};

// @desc    Get user's application tracker list
// @route   GET /api/applications
// @access  Private
const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.user._id })
      .populate('scheme')
      .sort({ updatedAt: -1 });

    const statusCounts = {
      all: applications.length,
      pending: 0,
      submitted: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
    };

    applications.forEach((app) => {
      if (['Submitted', 'Under Review'].includes(app.status)) {
        if (app.status === 'Submitted') statusCounts.submitted++;
        if (app.status === 'Under Review') statusCounts.underReview++;
      } else if (['Approved'].includes(app.status)) {
        statusCounts.approved++;
      } else if (['Rejected'].includes(app.status)) {
        statusCounts.rejected++;
      } else {
        statusCounts.pending++;
      }
    });

    res.json({
      success: true,
      count: applications.length,
      statusCounts,
      applications,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Server error fetching applications' });
  }
};

// @desc    Start or update an application for a scheme
// @route   POST /api/applications
// @access  Private
const createOrUpdateApplication = async (req, res) => {
  try {
    const { schemeId, status, notes } = req.body;
    if (!schemeId) {
      return res.status(400).json({ success: false, message: 'Scheme ID is required' });
    }

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scholarship scheme not found' });
    }

    const readinessScore = await calculateReadiness(req.user._id, scheme);
    const newStatus = status || 'Application Started';

    const application = await Application.findOneAndUpdate(
      { user: req.user._id, scheme: schemeId },
      {
        user: req.user._id,
        scheme: schemeId,
        status: newStatus,
        notes: notes || '',
        readinessScore,
        lastUpdated: new Date(),
        ...(newStatus === 'Submitted' && { appliedDate: new Date() }),
      },
      { new: true, upsert: true }
    ).populate('scheme');

    // If submitted, increment total applicants on scheme
    if (newStatus === 'Submitted') {
      await Scheme.findByIdAndUpdate(schemeId, { $inc: { totalApplicants: 1 } });
    }

    res.status(201).json({
      success: true,
      message: `Application ${status ? status.toLowerCase() : 'started'} successfully`,
      application,
    });
  } catch (error) {
    console.error('Error creating/updating application:', error);
    res.status(500).json({ success: false, message: 'Server error creating application' });
  }
};

// @desc    Update specific application status
// @route   PUT /api/applications/:id
// @access  Private
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findOne({ _id: req.params.id, user: req.user._id }).populate('scheme');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found' });
    }

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;
    application.lastUpdated = new Date();

    if (status === 'Submitted' && !application.appliedDate) {
      application.appliedDate = new Date();
      await Scheme.findByIdAndUpdate(application.scheme._id, { $inc: { totalApplicants: 1 } });
    }

    if (application.scheme) {
      application.readinessScore = await calculateReadiness(req.user._id, application.scheme);
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Server error updating application' });
  }
};

// @desc    Delete/Withdraw an application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({ success: false, message: 'Server error withdrawing application' });
  }
};

module.exports = {
  getUserApplications,
  createOrUpdateApplication,
  updateApplicationStatus,
  deleteApplication,
};
