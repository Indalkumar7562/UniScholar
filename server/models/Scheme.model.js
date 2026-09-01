const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Scheme name is required'],
      trim: true,
      unique: true,
    },
    slug: { type: String, unique: true },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: { type: String },
    category: {
      type: String,
      required: true,
      enum: ['General', 'OBC', 'SC', 'ST', 'Minority', 'All'],
    },
    ministry: { type: String, default: 'Ministry of Education' },
    amount: { type: String, required: true },
    amountValue: { type: Number },
    frequency: {
      type: String,
      enum: ['Monthly', 'Yearly', 'One-time'],
      default: 'Yearly',
    },
    eligibilityCriteria: {
      minAge: { type: Number, default: 0 },
      maxAge: { type: Number, default: 100 },
      maxAnnualIncome: { type: Number, default: 9999999 },
      educationLevels: [{ type: String }],
      categories: [{ type: String }],
      states: { type: [String], default: ['All'] },
      genders: { type: [String], default: ['All'] },
      disabilityRequired: { type: Boolean, default: false },
      bplRequired: { type: Boolean, default: false },
      minPercentage: { type: Number, default: 0 },
      streams: { type: [String], default: ['All'] },
      professions: { type: [String], default: ['All'] },
      requiredCriteria: [{ type: String }],
      optionalCriteria: [{ type: String }],
      priorityCriteria: [{ type: String }],
    },
    applicationProcess: { type: String },
    officialLink: { type: String, default: 'https://scholarships.gov.in' },
    lastDateToApply: { type: Date },
    applicationOpenDate: { type: Date, default: Date.now },
    applicationDeadline: { type: Date },
    isVerified: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Draft', 'Expired'],
      default: 'Active',
    },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
    totalApplicants: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug
schemeSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (!this.shortDescription) {
    this.shortDescription = this.description.slice(0, 120) + '...';
  }
  next();
});

module.exports = mongoose.model('Scheme', schemeSchema);
