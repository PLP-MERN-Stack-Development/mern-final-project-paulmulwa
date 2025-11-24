const express = require('express');
const router = express.Router();
const countyAdminController = require('../controllers/countyAdmin.controller');
const { protect, authorize, checkApproval } = require('../middleware/auth');

// All routes require authentication and County Admin role
router.use(protect);
router.use(authorize('county_admin'));
router.use(checkApproval); // Ensure county admin is approved

// Dashboard Overview
router.get('/dashboard', countyAdminController.getDashboardOverview);

// Parcel Management (CRUD)
router.get('/parcels', countyAdminController.getCountyParcels);
router.post('/parcels', countyAdminController.createCountyParcel);
router.put('/parcels/:id', countyAdminController.updateCountyParcel);
router.delete('/parcels/:id', countyAdminController.deleteCountyParcel);

// Title Deeds
router.get('/title-deeds', countyAdminController.getCountyTitleDeeds);

// Transfer Management
router.get('/transfers', countyAdminController.getCountyTransfers);
router.put('/transfers/:id/stop', countyAdminController.stopTransfer);

// Transfer History
router.get('/parcels/:id/transfer-history', countyAdminController.getParcelTransferHistory);

// Fraud Review
router.get('/fraud-review', countyAdminController.getFraudulentParcels);
router.put('/parcels/:id/remove-fraud-flag', countyAdminController.removeFraudFlag);

// Users in County
router.get('/users', countyAdminController.getCountyUsers);

module.exports = router;
