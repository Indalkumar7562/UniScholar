const Application = require('../models/Application.model');
const Scheme = require('../models/Scheme.model');
const Profile = require('../models/Profile.model');
const Document = require('../models/Document.model');
const { checkSchemeEligibility } = require('../utils/eligibility.utils');

// Helper to calculate Application Readiness Score (0 - 100%)
const calculateReadiness = async (userId, scheme) => {
  const profile = await Profile.findOne({ user: userId });
  if (!profile) return 0;

  const coreFields = ['fullName', 'age', 'state', 'educationLevel', 'category', 'annualFamilyIncome'];
  let filledCount = 0;
  coreFields.forEach((f) => {
    if (profile[f] !== undefined && profile[f] !== null && profile[f] !== '') filledCount++;
  });
  const profileScore = (filledCount / coreFields.length) * 30;

  const eligibility = checkSchemeEligibility(profile, scheme);
  const eligibilityScore = (eligibility.matchScore / 100) * 30;

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
    let applications = await Application.find({ user: req.user._id })
      .populate('scheme')
      .sort({ updatedAt: -1 });

    // Seed realistic sample applications for student if empty
    if (applications.length === 0) {
      const schemes = await Scheme.find({ isActive: true }).limit(3);
      if (schemes.length >= 3) {
        const seed1 = await Application.create({
          user: req.user._id,
          scheme: schemes[0]._id,
          status: 'Rejected',
          appliedDate: new Date(Date.now() - 14 * 86400000),
          lastUpdated: new Date(Date.now() - 2 * 86400000),
          readinessScore: 78,
          rejectedAtStage: 'document_verification',
          rejectedAt: new Date(Date.now() - 2 * 86400000),
          rejectionReason: 'The uploaded income certificate is expired (issued > 1 year ago).',
          rejectionCategory: 'document_issue',
          affectedDocument: 'Income Certificate',
          isCorrectable: true,
          suggestedAction: 'Upload a current Income Certificate issued within the valid financial year.',
          suggestedActionType: 'replace_document',
          rejectionHistory: [
            {
              stage: 'submission',
              date: new Date(Date.now() - 14 * 86400000),
              reason: 'Application submitted successfully.',
              affectedItem: 'Application Form',
              actionTaken: 'Initial Submission',
              isCorrectable: true
            },
            {
              stage: 'document_verification',
              date: new Date(Date.now() - 2 * 86400000),
              reason: 'The uploaded income certificate is expired (issued > 1 year ago).',
              affectedItem: 'Income Certificate',
              actionTaken: 'Document Verification Audit Failed',
              isCorrectable: true
            }
          ]
        });

        const seed2 = await Application.create({
          user: req.user._id,
          scheme: schemes[1]._id,
          status: 'Rejected',
          appliedDate: new Date(Date.now() - 20 * 86400000),
          lastUpdated: new Date(Date.now() - 5 * 86400000),
          readinessScore: 65,
          rejectedAtStage: 'eligibility_verification',
          rejectedAt: new Date(Date.now() - 5 * 86400000),
          rejectionReason: 'Annual family income (₹7,20,000) exceeds the maximum scheme limit of ₹6,00,000.',
          rejectionCategory: 'eligibility_issue',
          affectedDocument: 'Annual Family Income Profile Field',
          isCorrectable: false,
          suggestedAction: 'Explore scholarships with a higher annual family income ceiling.',
          suggestedActionType: 'find_scholarships',
          rejectionHistory: [
            {
              stage: 'submission',
              date: new Date(Date.now() - 20 * 86400000),
              reason: 'Application submitted successfully.',
              affectedItem: 'Application Form',
              actionTaken: 'Initial Submission',
              isCorrectable: true
            },
            {
              stage: 'document_verification',
              date: new Date(Date.now() - 10 * 86400000),
              reason: 'Documents verified cleanly.',
              affectedItem: 'Documents',
              actionTaken: 'Passed',
              isCorrectable: true
            },
            {
              stage: 'eligibility_verification',
              date: new Date(Date.now() - 5 * 86400000),
              reason: 'Annual family income (₹7,20,000) exceeds the maximum scheme limit of ₹6,00,000.',
              affectedItem: 'Family Income Criteria',
              actionTaken: 'Eligibility Verification Failed',
              isCorrectable: false
            }
          ]
        });

        const seed3 = await Application.create({
          user: req.user._id,
          scheme: schemes[2]._id,
          status: 'Approved',
          appliedDate: new Date(Date.now() - 30 * 86400000),
          lastUpdated: new Date(Date.now() - 1 * 86400000),
          readinessScore: 100,
          rejectedAtStage: null,
          isCorrectable: true
        });

        applications = await Application.find({ user: req.user._id })
          .populate('scheme')
          .sort({ updatedAt: -1 });
      }
    }

    const statusCounts = {
      all: applications.length,
      pending: 0,
      submitted: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      correctionSubmitted: 0
    };

    applications.forEach((app) => {
      if (['Submitted', 'Under Review'].includes(app.status)) {
        if (app.status === 'Submitted') statusCounts.submitted++;
        if (app.status === 'Under Review') statusCounts.underReview++;
      } else if (app.status === 'Approved') {
        statusCounts.approved++;
      } else if (app.status === 'Rejected') {
        statusCounts.rejected++;
      } else if (app.status === 'Correction Submitted') {
        statusCounts.correctionSubmitted++;
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
    const { schemeId, status, notes, rejectedAtStage, rejectionReason, affectedDocument, isCorrectable, suggestedAction, suggestedActionType } = req.body;
    if (!schemeId) {
      return res.status(400).json({ success: false, message: 'Scheme ID is required' });
    }

    const scheme = await Scheme.findById(schemeId);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scholarship scheme not found' });
    }

    const readinessScore = await calculateReadiness(req.user._id, scheme);
    const newStatus = status || 'Application Started';

    const updateFields = {
      user: req.user._id,
      scheme: schemeId,
      status: newStatus,
      notes: notes || '',
      readinessScore,
      lastUpdated: new Date(),
      ...(newStatus === 'Submitted' && { appliedDate: new Date() }),
    };

    if (newStatus === 'Rejected') {
      updateFields.rejectedAtStage = rejectedAtStage || 'document_verification';
      updateFields.rejectedAt = new Date();
      updateFields.rejectionReason = rejectionReason || 'Information or document criteria did not satisfy verification audit.';
      updateFields.affectedDocument = affectedDocument || 'Document / Profile Field';
      updateFields.isCorrectable = isCorrectable !== undefined ? isCorrectable : true;
      updateFields.suggestedAction = suggestedAction || 'Review and update required details.';
      updateFields.suggestedActionType = suggestedActionType || 'replace_document';
    }

    const application = await Application.findOneAndUpdate(
      { user: req.user._id, scheme: schemeId },
      updateFields,
      { new: true, upsert: true }
    ).populate('scheme');

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

// @desc    Submit correction / re-verification for rejected application
// @route   PUT /api/applications/:id/resolve-rejection
// @access  Private
const resolveRejection = async (req, res) => {
  try {
    const { actionNote, updatedDocumentName } = req.body;
    const application = await Application.findOne({ _id: req.params.id, user: req.user._id }).populate('scheme');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found' });
    }

    // Preserve rejection history entry
    const historyItem = {
      stage: application.rejectedAtStage || 'document_verification',
      date: application.rejectedAt || application.lastUpdated || new Date(),
      reason: application.rejectionReason || 'Verification issue',
      affectedItem: application.affectedDocument || 'Document',
      actionTaken: actionNote || `Re-submitted updated ${updatedDocumentName || 'document'}`,
      dateResolved: new Date(),
      isCorrectable: application.isCorrectable
    };

    application.rejectionHistory.push(historyItem);
    application.status = 'Correction Submitted';
    application.notes = actionNote || 'Correction submitted for re-verification';
    application.lastUpdated = new Date();

    await application.save();

    res.json({
      success: true,
      message: '✓ Correction submitted successfully. Re-verification in progress.',
      application,
    });
  } catch (error) {
    console.error('Error resolving rejection:', error);
    res.status(500).json({ success: false, message: 'Server error resolving rejection' });
  }
};

// @desc    Update specific application status
// @route   PUT /api/applications/:id
// @access  Private
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, notes, rejectedAtStage, rejectionReason, affectedDocument, isCorrectable, suggestedAction, suggestedActionType } = req.body;
    const application = await Application.findOne({ _id: req.params.id, user: req.user._id }).populate('scheme');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found' });
    }

    if (status) application.status = status;
    if (notes !== undefined) application.notes = notes;
    application.lastUpdated = new Date();

    if (status === 'Rejected') {
      application.rejectedAtStage = rejectedAtStage || 'document_verification';
      application.rejectedAt = new Date();
      application.rejectionReason = rejectionReason || 'Verification audit issue.';
      application.affectedDocument = affectedDocument || 'Document';
      application.isCorrectable = isCorrectable !== undefined ? isCorrectable : true;
      application.suggestedAction = suggestedAction || 'Review profile or replace document.';
      application.suggestedActionType = suggestedActionType || 'replace_document';
    }

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
  resolveRejection,
  updateApplicationStatus,
  deleteApplication,
};
