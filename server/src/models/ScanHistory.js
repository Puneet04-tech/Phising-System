const mongoose = require('mongoose');

const ScanHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  scanType: { type: String, enum: ['url', 'email'], required: true },

  content: { type: String, required: true },

  result: {
    riskPercentage: { type: Number, required: true },
    threatStatus: { type: String, required: true }, // 'Safe' | 'Suspicious' | 'Malicious'
    recommendation: { type: String, required: true },
  },

  flaggedKeywords: [{ type: String }],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ScanHistory', ScanHistorySchema);
