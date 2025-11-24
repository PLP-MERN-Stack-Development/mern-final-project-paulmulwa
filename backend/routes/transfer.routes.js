const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const transferController = require('../controllers/transfer.controller');
const { protect, authorize, checkApproval } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

// All routes require authentication
router.use(protect);

// Validation for initiating transfer
const initiateTransferValidation = [
  body('parcelId').notEmpty().withMessage('Parcel ID is required'),
  body('buyerName').notEmpty().withMessage('Recipient Name is required'),
  body('buyerNationalId').notEmpty().withMessage('Recipient National ID is required'),
  body('buyerKraPin').notEmpty().withMessage('Recipient KRA PIN is required'),
  body('agreedPrice').optional().isNumeric().withMessage('Agreed price must be a number')
];

// Routes
router.post('/', initiateTransferValidation, validate, transferController.initiateTransfer);
router.get('/', transferController.getAllTransfers);
router.get('/:id', transferController.getTransferById);

// Recipient routes
router.put('/:id/accept', transferController.acceptTransfer);
router.put('/:id/reject', [
  body('reason').notEmpty().withMessage('Rejection reason is required')
], validate, transferController.rejectTransfer);

// County Admin routes
router.put('/:id/county-verify', 
  authorize('county_admin'), 
  checkApproval,
  transferController.countyVerifyTransfer
);

// NLC Admin routes
router.put('/:id/nlc-approve', 
  authorize('nlc_admin'),
  transferController.nlcApproveTransfer
);

// Cancel transfer
router.put('/:id/cancel', transferController.cancelTransfer);

module.exports = router;
