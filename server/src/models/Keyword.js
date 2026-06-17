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
    enum: ['url', 'email', 'general'],
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
  isActive: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('Keyword', KeywordSchema);
