const express = require('express');
const {
  scanUrl,
  scanEmail,
  getMyHistory,
  getMyStats,
} = require('../controllers/scan.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Protected scan endpoints
router.post('/url', requireAuth, scanUrl);
router.post('/email', requireAuth, scanEmail);

// Protected dashboard endpoints
router.get('/history', requireAuth, getMyHistory);
router.get('/stats', requireAuth, getMyStats);

module.exports = router;
