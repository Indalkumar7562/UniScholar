const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Personal Details
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [5, 'Age must be at least 5'],
      max: [100, 'Age cannot exceed 100'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Prefer not to say',
    },
    state: {
      type: String,
      required: [true, 'State is required'],
    },
    district: {
      type: String,
      trim: true,
      default: '',
    },
    mobileNumber: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },

    // Education Details
    educationLevel: {
      type: String,
      required: [true, 'Education level is required'],
      enum: ['Below 10th', '10th Pass', '12th Pass', 'Diploma', 'Graduation', 'Post Graduation', 'PhD'],
    },
    stream: {
      type: String,
      enum: ['Science', 'Commerce', 'Arts', 'Diploma', 'Engineering', 'Medical', 'ITI', 'Other', 'Not Applicable'],
      default: 'Not Applicable',
    },
    collegeName: {
      type: String,
      trim: true,
      default: '',
    },
    cgpaOrPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    currentYearOrSemester: {
      type: String,
      trim: true,
      default: '',
    },

    // Profession Details
    profession: {
      type: String,
      enum: ['Student', 'Farmer', 'Government Employee', 'Private Employee', 'Unemployed', 'Self-employed', 'Labour Worker', 'Business Owner'],
      default: 'Student',
    },

    // Financial Details
    annualFamilyIncome: {
      type: Number,
      required: [true, 'Annual family income is required'],
      min: [0, 'Income cannot be negative'],
    },
    bplStatus: {
      type: Boolean,
      default: false,
    },

    // Social Details
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['General', 'OBC', 'SC', 'ST', 'Minority'],
    },
    minorityStatus: {
      type: Boolean,
      default: false,
    },
    disabilityStatus: {
      type: Boolean,
      default: false,
    },

    // Document Uploads (simulated URLs/paths)
    documentUploads: {
      aadhaar: { type: String, default: '' },
      incomeCertificate: { type: String, default: '' },
      casteCertificate: { type: String, default: '' },
      domicile: { type: String, default: '' },
      marksheet: { type: String, default: '' },
      disabilityCertificate: { type: String, default: '' },
    },

    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Auto-set isComplete based on core fields
profileSchema.pre('save', function (next) {
  this.isComplete = !!(
    this.fullName &&
    this.age &&
    this.state &&
    this.educationLevel &&
    this.category &&
    this.annualFamilyIncome !== undefined
  );
  next();
});

module.exports = mongoose.model('Profile', profileSchema);
