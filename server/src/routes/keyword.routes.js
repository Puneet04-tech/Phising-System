const express = require('express');
const keywordController = require('../controllers/keyword.controller');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// Public endpoint for getting active keywords (used by riskScoring)
router.get('/active', keywordController.getActiveKeywords);

// All other keyword routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

router.get('/', keywordController.getAllKeywords);
router.get('/:keywordId', keywordController.getKeywordById);
router.post('/', keywordController.createKeyword);
router.patch('/:keywordId', keywordController.updateKeyword);
router.delete('/:keywordId', keywordController.deleteKeyword);

module.exports = router;
