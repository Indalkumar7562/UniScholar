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
  },
  { timestamps: true }
);

// Ensure a user can have at most one application record per scheme
applicationSchema.index({ user: 1, scheme: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
