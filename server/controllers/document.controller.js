const Document = require('../models/Document.model');
const Profile = require('../models/Profile.model');
const fs = require('fs');
const path = require('path');

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: documents.length, documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, message: 'Server error fetching documents' });
  }
};

// @desc    Upload a new document
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { category, customName } = req.body;
    const documentName = customName || req.file.originalname;

    // Save to Database
    const filePath = `/uploads/${req.file.filename}`;
    const document = await Document.create({
      user: req.user._id,
      name: documentName,
      originalName: req.file.originalname,
      category: category || 'Other',
      filePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });

    // Check if we can sync to User Profile documentUploads
    const profile = await Profile.findOne({ user: req.user._id });
    if (profile) {
      let isSynced = false;
      const lowerName = documentName.toLowerCase();
      
      // Mapping categories/names to profile slots
      if (category === 'Identity' || lowerName.includes('aadhaar')) {
        profile.documentUploads.aadhaar = filePath;
        isSynced = true;
      } else if (category === 'Income' || lowerName.includes('income')) {
        profile.documentUploads.incomeCertificate = filePath;
        isSynced = true;
      } else if (category === 'Academic' || lowerName.includes('marksheet') || lowerName.includes('result') || lowerName.includes('exam')) {
        if (lowerName.includes('10th') || lowerName.includes('10')) {
          profile.documentUploads.marksheet10th = filePath;
        } else if (lowerName.includes('12th') || lowerName.includes('12')) {
          profile.documentUploads.marksheet12th = filePath;
        } else if (lowerName.includes('college') || lowerName.includes('degree') || lowerName.includes('sem') || lowerName.includes('university')) {
          profile.documentUploads.marksheetCollege = filePath;
        } else {
          profile.documentUploads.marksheetOther = filePath;
        }
        profile.documentUploads.marksheet = filePath;
        isSynced = true;
      } else if (category === 'Residence' || lowerName.includes('domicile') || lowerName.includes('residence')) {

        profile.documentUploads.domicile = filePath;
        isSynced = true;
      } else if (category === 'Category Certificate' || lowerName.includes('caste') || lowerName.includes('category')) {
        profile.documentUploads.casteCertificate = filePath;
        isSynced = true;
      } else if (lowerName.includes('disability') || lowerName.includes('pwd')) {
        profile.documentUploads.disabilityCertificate = filePath;
        isSynced = true;
      }

      if (isSynced) {
        await profile.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ success: false, message: 'Server error during document upload' });
  }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found or unauthorized' });
    }

    // Delete file from disk
    const absolutePath = path.join(__dirname, '..', document.filePath);
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch (err) {
        console.error('Failed to delete file from disk:', err.message);
      }
    }

    // Clean up profile documentUploads link if it matches
    const profile = await Profile.findOne({ user: req.user._id });
    if (profile) {
      let isSynced = false;
      const targetPath = document.filePath;
      
      if (profile.documentUploads.aadhaar === targetPath) {
        profile.documentUploads.aadhaar = '';
        isSynced = true;
      }
      if (profile.documentUploads.incomeCertificate === targetPath) {
        profile.documentUploads.incomeCertificate = '';
        isSynced = true;
      }
      if (profile.documentUploads.marksheet === targetPath) {
        profile.documentUploads.marksheet = '';
        isSynced = true;
      }
      if (profile.documentUploads.marksheet10th === targetPath) {
        profile.documentUploads.marksheet10th = '';
        isSynced = true;
      }
      if (profile.documentUploads.marksheet12th === targetPath) {
        profile.documentUploads.marksheet12th = '';
        isSynced = true;
      }
      if (profile.documentUploads.marksheetCollege === targetPath) {
        profile.documentUploads.marksheetCollege = '';
        isSynced = true;
      }
      if (profile.documentUploads.marksheetOther === targetPath) {
        profile.documentUploads.marksheetOther = '';
        isSynced = true;
      }
      if (profile.documentUploads.domicile === targetPath) {
        profile.documentUploads.domicile = '';
        isSynced = true;
      }
      if (profile.documentUploads.casteCertificate === targetPath) {
        profile.documentUploads.casteCertificate = '';
        isSynced = true;
      }
      if (profile.documentUploads.disabilityCertificate === targetPath) {
        profile.documentUploads.disabilityCertificate = '';
        isSynced = true;
      }

      if (isSynced) {
        await profile.save();
      }
    }

    await Document.deleteOne({ _id: req.params.id });

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ success: false, message: 'Server error deleting document' });
  }
};

module.exports = {
  getDocuments,
  uploadDocument,
  deleteDocument,
};
