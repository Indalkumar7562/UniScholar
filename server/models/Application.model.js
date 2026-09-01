const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scheme',
      required: true,
    },
    status: {
      type: String,
      enum: [
        'Not Started',
        'Documents Pending',
        'Ready to Apply',
        'Application Started',
        'Submitted',
        'Under Review',
        'Correction Submitted',
        'Re-verification Pending',
        'Approved',
        'Rejected',
      ],
      default: 'Application Started',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    
    // Stage-Wise Rejection & Recovery Extensions
    rejectedAtStage: {
      type: String,
      enum: [
        'submission',
        'document_verification',
        'eligibility_verification',
        'institute_verification',
        'provider_review',
        'final_approval',
        'disbursement',
        null
      ],
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    rejectionCategory: {
      type: String,
      enum: ['document_issue', 'eligibility_issue', 'institute_issue', 'provider_issue', 'criteria_issue', 'none'],
      default: 'none',
    },
    affectedDocument: {
      type: String,
      default: '',
    },
    isCorrectable: {
      type: Boolean,
      default: true,
    },
    suggestedAction: {
      type: String,
      default: '',
    },
    suggestedActionType: {
      type: String,
      enum: ['replace_document', 'review_profile', 'update_institute', 'find_scholarships', 'view_reason', 'none'],
      default: 'none',
    },
    rejectionHistory: [
      {
        stage: { type: String },
        date: { type: Date, default: Date.now },
        reason: { type: String },
        affectedItem: { type: String },
        actionTaken: { type: String },
        dateResolved: { type: Date },
        isCorrectable: { type: Boolean, default: true }
      }
    ]
  },
  { timestamps: true }
);

// Ensure a user can have at most one application record per scheme
applicationSchema.index({ user: 1, scheme: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
