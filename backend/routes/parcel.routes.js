const express = require('express');
const router = express.Router();
const parcelController = require('../controllers/parcel.controller');
const { protect, authorize, checkApproval } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Public routes (all authenticated users)
router.get('/', parcelController.getAllParcels);
router.get('/search', parcelController.searchParcels);
router.get('/my/parcels', parcelController.getMyParcels);
router.get('/title/:titleNumber', parcelController.getParcelByTitleNumber);
router.get('/:id', parcelController.getParcelById);

// PDF Generation routes
router.get('/:id/title-deed-pdf', parcelController.generateTitleDeedPDF);
router.get('/:id/title-deed-pdf/view', parcelController.viewTitleDeedPDF);
router.get('/:id/transfer-history-pdf', parcelController.generateTransferHistoryPDF);
router.get('/:id/transfer-history', parcelController.getParcelTransferHistory);

// Approval routes
router.get('/pending/approvals', authorize('county_admin', 'nlc_admin', 'super_admin'), parcelController.getPendingParcels);
router.put('/:id/county-approval', authorize('county_admin'), checkApproval, parcelController.countyAdminApproval);
router.put('/:id/nlc-approval', authorize('nlc_admin', 'super_admin'), parcelController.nlcAdminApproval);

// County Admin and NLC Admin routes
router.post('/', authorize('county_admin', 'nlc_admin', 'super_admin'), checkApproval, parcelController.createParcel);
router.put('/:id', authorize('county_admin', 'nlc_admin', 'super_admin'), checkApproval, parcelController.updateParcel);

// NLC Admin only
router.delete('/:id', authorize('nlc_admin', 'super_admin'), parcelController.deleteParcel);

module.exports = router;
