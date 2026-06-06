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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
