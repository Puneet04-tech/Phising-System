const express = require('express');
const { scanUrl, scanEmail } = require('../controllers/scan.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Protected scan endpoints
router.post('/url', requireAuth, scanUrl);
router.post('/email', requireAuth, scanEmail);

module.exports = router;
