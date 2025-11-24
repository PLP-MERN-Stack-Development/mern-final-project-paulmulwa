const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const { protect, authorize, checkApproval } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Routes
router.post('/', documentController.uploadDocument);
router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocumentById);
router.put('/:id/verify', authorize('county_admin', 'nlc_admin'), checkApproval, documentController.verifyDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
