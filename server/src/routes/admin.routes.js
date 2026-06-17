const express = require('express');
const adminController = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserById);
router.patch('/users/:userId/role', adminController.updateUserRole);
router.delete('/users/:userId', adminController.deleteUser);

// System Analytics
router.get('/analytics', adminController.getSystemAnalytics);

// Detection Logs (system-wide)
router.get('/detection-logs', adminController.getAllDetectionLogs);

// Reports Management
router.get('/reports', adminController.getAllReports);
router.patch('/reports/:reportId/status', adminController.updateReportStatus);

module.exports = router;
