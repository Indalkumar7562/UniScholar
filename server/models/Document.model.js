const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Academic', 'Identity', 'Income', 'Residence', 'Category Certificate', 'Other'],
      default: 'Other',
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    mimeType: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Uploaded', 'Processing', 'Verified', 'Needs Review', 'Rejected'],
      default: 'Uploaded',
    },
    issueDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
    },
    version: {
      type: Number,
      default: 1,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    versionHistory: [
      {
        version: Number,
        filePath: String,
        mimeType: String,
        status: String,
        rejectionReason: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
