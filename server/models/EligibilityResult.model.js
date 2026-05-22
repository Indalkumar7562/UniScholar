const mongoose = require('mongoose');

const eligibilityResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    results: [
      {
        scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' },
        eligible: { type: Boolean, required: true },
        matchScore: { type: Number, default: 0 },
        matchedCriteria: [{ type: String }],
        missingCriteria: [{ type: String }],
        missingDocuments: [{ type: String }],
        eligibilityProbability: { type: Number, default: 0 },
        confidenceScore: { type: Number, default: 0 },
        rejectionReasons: [{ type: String }],
        suggestions: [{ type: String }],
      },
    ],
    totalChecked: { type: Number, default: 0 },
    totalEligible: { type: Number, default: 0 },
    checkedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EligibilityResult', eligibilityResultSchema);
