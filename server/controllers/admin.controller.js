const User = require('../models/User.model');
const Profile = require('../models/Profile.model');
const Scheme = require('../models/Scheme.model');
const EligibilityResult = require('../models/EligibilityResult.model');
const Notification = require('../models/Notification.model');
const Application = require('../models/Application.model');
const Document = require('../models/Document.model');
const AuditLog = require('../models/AuditLog.model');

// Helper to log Admin Actions into AuditLog
const logAudit = async (req, action, targetType, targetId, prevStatus, newStatus, remarks) => {
  try {
    await AuditLog.create({
      user: req.user?._id,
      userName: req.user?.name || 'System Admin',
      role: req.user?.role || 'admin',
      action,
      targetType,
      targetId: String(targetId || ''),
      previousStatus: prevStatus || '',
      newStatus: newStatus || '',
      remarks: remarks || ''
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

// @desc    Get live dynamic dashboard metrics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalSchemes = await Scheme.countDocuments();
    const activeSchemes = await Scheme.countDocuments({ isActive: true });
    
    const totalApplications = await Application.countDocuments();
    const approvedApplications = await Application.countDocuments({ status: 'Approved' });
    const pendingApplications = await Application.countDocuments({ status: { $in: ['Submitted', 'Under Review', 'Correction Submitted', 'In Progress'] } });
    const rejectedApplications = await Application.countDocuments({ status: 'Rejected' });
    
    const totalPartners = await User.countDocuments({ role: 'partner' });

    const totalDocuments = await Document.countDocuments();
    const verifiedDocuments = await Document.countDocuments({ status: 'Verified' });
    const docVerificationRate = totalDocuments > 0 ? Math.round((verifiedDocuments / totalDocuments) * 100) : 100;

    const allSchemes = await Scheme.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalSchemes,
        activeSchemes,
        totalApplications,
        approvedApplications,
        pendingApplications,
        rejectedApplications,
        totalPartners,
        docVerificationRate
      },
      schemes: allSchemes
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving analytics' });
  }
};

// @desc    Get all students with details
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });
    const profiles = await Profile.find();

    const result = await Promise.all(students.map(async (student) => {
      const profile = profiles.find(p => String(p.user) === String(student._id)) || {};
      const appCount = await Application.countDocuments({ user: student._id });
      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        status: student.status || 'Active',
        createdAt: student.createdAt,
        profile: profile,
        applicationsCount: appCount,
        isVerified: profile.isComplete || false
      };
    }));

    res.json({ success: true, students: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving students list' });
  }
};

// @desc    Update student profile & status
// @route   PUT /api/admin/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const { name, email, status, profileData } = req.body;
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const prevStatus = student.status || 'Active';
    if (name) student.name = name;
    if (email) student.email = email;
    if (status) student.status = status;
    await student.save();

    if (profileData) {
      await Profile.findOneAndUpdate(
        { user: student._id },
        { ...profileData, user: student._id },
        { upsert: true, new: true }
      );
    }

    await logAudit(req, 'Updated Student Details', 'Student', student._id, prevStatus, student.status, `Updated profile for ${student.name}`);
    res.json({ success: true, message: 'Student updated successfully', student });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating student' });
  }
};

// @desc    Delete student account
// @route   DELETE /api/admin/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await Profile.findOneAndDelete({ user: req.params.id });
    await Application.deleteMany({ user: req.params.id });
    await Document.deleteMany({ user: req.params.id });

    await logAudit(req, 'Deleted Student Account', 'Student', req.params.id, 'Active', 'Deleted', `Deleted student ${student.name}`);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting student' });
  }
};

// @desc    Get all applications across system
// @route   GET /api/admin/applications
// @access  Private/Admin
const getAllApplicationsAdmin = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('user', 'name email role')
      .populate('scheme')
      .sort({ updatedAt: -1 });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving applications' });
  }
};

// @desc    Update application stage & status by Admin
// @route   PUT /api/admin/applications/:id/stage
// @access  Private/Admin
const updateApplicationStageAdmin = async (req, res) => {
  try {
    const { status, rejectedAtStage, rejectionReason, affectedDocument, isCorrectable, suggestedAction, remarks } = req.body;
    const app = await Application.findById(req.params.id).populate('scheme user');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    const prevStatus = app.status;
    if (status) app.status = status;
    if (remarks) app.notes = remarks;
    app.lastUpdated = new Date();

    if (status === 'Rejected') {
      if (!rejectionReason || rejectionReason.trim() === '') {
        return res.status(400).json({ success: false, message: 'Rejection reason is mandatory.' });
      }
      app.rejectedAtStage = rejectedAtStage || 'document_verification';
      app.rejectedAt = new Date();
      app.rejectionReason = rejectionReason;
      app.affectedDocument = affectedDocument || 'Document';
      app.isCorrectable = isCorrectable !== undefined ? isCorrectable : true;
      app.suggestedAction = suggestedAction || 'Review details and re-upload required document.';

      app.rejectionHistory.push({
        stage: app.rejectedAtStage,
        date: new Date(),
        reason: rejectionReason,
        affectedItem: app.affectedDocument,
        actionTaken: remarks || 'Admin Rejection Action',
        isCorrectable: app.isCorrectable
      });
    }

    await app.save();
    await logAudit(req, `Updated Application Status to ${status}`, 'Application', app._id, prevStatus, status, remarks || rejectionReason);

    res.json({ success: true, message: 'Application status updated successfully', application: app });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating application stage' });
  }
};

// @desc    Get all documents
// @route   GET /api/admin/documents
// @access  Private/Admin
const getAllDocumentsAdmin = async (req, res) => {
  try {
    const documents = await Document.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving documents' });
  }
};

// @desc    Verify or Reject Document
// @route   PUT /api/admin/documents/:id/verify
// @access  Private/Admin
const verifyDocumentAdmin = async (req, res) => {
  try {
    const { status, rejectionReason, remarks } = req.body;
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (status === 'Rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
      return res.status(400).json({ success: false, message: 'Rejection reason is mandatory.' });
    }

    const prevStatus = doc.status;
    doc.status = status;
    doc.isVerified = status === 'Verified';
    if (rejectionReason) doc.rejectionReason = rejectionReason;
    await doc.save();

    await logAudit(req, `${status} Document: ${doc.name}`, 'Document', doc._id, prevStatus, status, remarks || rejectionReason);
    res.json({ success: true, message: `Document marked as ${status}`, document: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying document' });
  }
};

// @desc    Get all partners
// @route   GET /api/admin/partners
// @access  Private/Admin
const getAllPartnersAdmin = async (req, res) => {
  try {
    const partners = await User.find({ role: 'partner' }).sort({ createdAt: -1 });
    res.json({ success: true, partners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving partners' });
  }
};

// @desc    Update Partner Status
// @route   PUT /api/admin/partners/:id/status
// @access  Private/Admin
const updatePartnerStatusAdmin = async (req, res) => {
  try {
    const { partnerStatus, remarks } = req.body;
    const partner = await User.findById(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });

    const prevStatus = partner.partnerStatus || 'Pending Approval';
    partner.partnerStatus = partnerStatus;
    await partner.save();

    await logAudit(req, `Updated Partner Status to ${partnerStatus}`, 'Partner', partner._id, prevStatus, partnerStatus, remarks);
    res.json({ success: true, message: `Partner status updated to ${partnerStatus}`, partner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating partner status' });
  }
};

// @desc    Get system audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogsAdmin = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, auditLogs: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving audit logs' });
  }
};

// @desc    Export analytics reports as CSV
// @route   GET /api/admin/reports/export
// @access  Private/Admin
const exportAdminReport = async (req, res) => {
  try {
    const studentsCount = await User.countDocuments({ role: 'student' });
    const schemesCount = await Scheme.countDocuments();
    const appCount = await Application.countDocuments();
    
    let csv = `Universal Scholarship System - Welfare Analytics Report\n`;
    csv += `Exported At,${new Date().toISOString()}\n\n`;
    csv += `Metric,Value\n`;
    csv += `Total Enrolled Students,${studentsCount}\n`;
    csv += `Total Scholarship Schemes,${schemesCount}\n`;
    csv += `Total Applications Processed,${appCount}\n`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="uss_analytics_report.csv"');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export report' });
  }
};

module.exports = {
  getAdminAnalytics,
  getStudents,
  updateStudent,
  deleteStudent,
  getAllApplicationsAdmin,
  updateApplicationStageAdmin,
  getAllDocumentsAdmin,
  verifyDocumentAdmin,
  getAllPartnersAdmin,
  updatePartnerStatusAdmin,
  getAuditLogsAdmin,
  exportAdminReport
};
