const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize, isSuperAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Super Admin only routes - NLC Admin Management
router.post('/nlc-admin', isSuperAdmin, userController.createNLCAdmin);
router.get('/nlc-admins', isSuperAdmin, userController.getAllNLCAdmins);
router.put('/nlc-admin/:id', isSuperAdmin, userController.updateNLCAdmin);
router.delete('/nlc-admin/:id', isSuperAdmin, userController.deleteNLCAdmin);

// NLC Admin and Super Admin routes
router.get('/', authorize('nlc_admin', 'super_admin'), userController.getAllUsers);
router.get('/pending-admins', authorize('nlc_admin', 'super_admin'), userController.getPendingAdmins);
router.post('/county-admin', authorize('nlc_admin', 'super_admin'), userController.createCountyAdmin);
router.put('/:id/approve', authorize('nlc_admin', 'super_admin'), userController.approveCountyAdmin);
router.put('/:id/deactivate', authorize('nlc_admin', 'super_admin'), userController.deactivateUser);

// General routes
router.get('/search/national-id/:nationalId', userController.getUserByNationalId);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);

module.exports = router;
