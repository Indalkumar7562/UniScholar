const Scheme = require('../models/Scheme.model');

// @desc    Get all schemes with filtering & search
// @route   GET /api/schemes
// @access  Public
const getSchemes = async (req, res) => {
  try {
    const { search, category, state, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    if (category && category !== 'All') query.category = category;
    if (state && state !== 'All') {
      query.$or = [
        { 'eligibilityCriteria.states': 'All' },
        { 'eligibilityCriteria.states': state },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [schemes, total] = await Promise.all([
      Scheme.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Scheme.countDocuments(query),
    ]);

    res.json({
      success: true,
      schemes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single scheme
// @route   GET /api/schemes/:id
// @access  Public
const getScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
    res.json({ success: true, scheme });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create scheme (Admin only)
// @route   POST /api/schemes
// @access  Private/Admin
const createScheme = async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    res.status(201).json({ success: true, message: 'Scheme created', scheme });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Scheme name already exists' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update scheme (Admin only)
// @route   PUT /api/schemes/:id
// @access  Private/Admin
const updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
    res.json({ success: true, message: 'Scheme updated', scheme });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete scheme (Admin only)
// @route   DELETE /api/schemes/:id
// @access  Private/Admin
const deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
    res.json({ success: true, message: 'Scheme deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getSchemes, getScheme, createScheme, updateScheme, deleteScheme };
