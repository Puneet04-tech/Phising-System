const mongoose = require('mongoose');

const KeywordSchema = new mongoose.Schema({
  keyword: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  category: {
    type: String,
    enum: ['url', 'email', 'general', 'credential', 'financial', 'urgency', 'verification', 'incentive', 'action', 'suspicious', 'service', 'information'],
    default: 'general'
  },
  points: {
    type: Number,
    default: 10,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    default: ''
  },
  pattern: {
    type: String,
    default: null // Regex pattern for advanced matching
  },
  matchType: {
    type: String,
    enum: ['contains', 'exact', 'regex', 'word'],
    default: 'contains'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  context: {
    type: String,
    default: null // Additional context for when this keyword is suspicious
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
KeywordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
KeywordSchema.index({ category: 1, isActive: 1 });
KeywordSchema.index({ severity: 1, isActive: 1 });

module.exports = mongoose.model('Keyword', KeywordSchema);
