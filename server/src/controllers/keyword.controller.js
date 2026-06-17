const Keyword = require('../models/Keyword');

/**
 * Get all keywords with filtering
 */
async function getAllKeywords(req, res, next) {
  try {
    const { category = '', isActive = '' } = req.query;
    
    const query = {};
    
    if (category && ['url', 'email', 'general'].includes(category)) {
      query.category = category;
    }
    
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }
    
    const keywords = await Keyword.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'Keywords fetched successfully',
      keywords
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get keyword by ID
 */
async function getKeywordById(req, res, next) {
  try {
    const { keywordId } = req.params;
    
    const keyword = await Keyword.findById(keywordId)
      .populate('createdBy', 'name email');
    
    if (!keyword) {
      return res.status(404).json({ message: 'Keyword not found' });
    }
    
    res.json({
      message: 'Keyword fetched successfully',
      keyword
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new keyword
 */
async function createKeyword(req, res, next) {
  try {
    const { keyword, category, points, description } = req.body;
    
    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({ message: 'Keyword is required' });
    }
    
    // Check if keyword already exists
    const existingKeyword = await Keyword.findOne({ keyword: keyword.toLowerCase().trim() });
    
    if (existingKeyword) {
      return res.status(400).json({ message: 'Keyword already exists' });
    }
    
    const newKeyword = await Keyword.create({
      keyword: keyword.toLowerCase().trim(),
      category: category || 'general',
      points: points || 10,
      description: description || '',
      createdBy: req.user.id
    });
    
    res.status(201).json({
      message: 'Keyword created successfully',
      keyword: newKeyword
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update keyword
 */
async function updateKeyword(req, res, next) {
  try {
    const { keywordId } = req.params;
    const { keyword, category, points, description, isActive } = req.body;
    
    const updateData = {};
    
    if (keyword !== undefined) {
      updateData.keyword = keyword.toLowerCase().trim();
    }
    
    if (category !== undefined) {
      updateData.category = category;
    }
    
    if (points !== undefined) {
      updateData.points = points;
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }
    
    const updatedKeyword = await Keyword.findByIdAndUpdate(
      keywordId,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!updatedKeyword) {
      return res.status(404).json({ message: 'Keyword not found' });
    }
    
    res.json({
      message: 'Keyword updated successfully',
      keyword: updatedKeyword
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete keyword
 */
async function deleteKeyword(req, res, next) {
  try {
    const { keywordId } = req.params;
    
    const keyword = await Keyword.findByIdAndDelete(keywordId);
    
    if (!keyword) {
      return res.status(404).json({ message: 'Keyword not found' });
    }
    
    res.json({
      message: 'Keyword deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get active keywords for scoring (used by riskScoring service)
 */
async function getActiveKeywords(req, res, next) {
  try {
    const { category } = req.query;
    
    const query = { isActive: true };
    
    if (category && ['url', 'email', 'general'].includes(category)) {
      query.category = category;
    }
    
    const keywords = await Keyword.find(query).select('keyword category points');
    
    res.json({
      message: 'Active keywords fetched successfully',
      keywords
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllKeywords,
  getKeywordById,
  createKeyword,
  updateKeyword,
  deleteKeyword,
  getActiveKeywords
};
