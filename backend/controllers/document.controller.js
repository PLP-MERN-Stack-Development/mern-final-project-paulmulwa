const Document = require('../models/Document');
const upload = require('../middleware/upload');

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
exports.uploadDocument = [
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { documentType, relatedModel, relatedId } = req.body;

      const document = await Document.create({
        documentType,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user._id,
        relatedTo: {
          model: relatedModel,
          id: relatedId
        }
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: document
      });
    } catch (error) {
      next(error);
    }
  }
];

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private
exports.getAllDocuments = async (req, res, next) => {
  try {
    const { relatedModel, relatedId } = req.query;
    
    const query = {};
    if (relatedModel) query['relatedTo.model'] = relatedModel;
    if (relatedId) query['relatedTo.id'] = relatedId;

    const documents = await Document.find(query)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName')
      .sort('-createdAt');

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
exports.getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('uploadedBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify document
// @route   PUT /api/documents/:id/verify
// @access  Private/County Admin, NLC Admin
exports.verifyDocument = async (req, res, next) => {
  try {
    const { isVerified, remarks } = req.body;

    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    document.isVerified = isVerified;
    document.verifiedBy = req.user._id;
    document.verifiedAt = Date.now();
    document.remarks = remarks;

    await document.save();

    res.json({
      success: true,
      message: `Document ${isVerified ? 'verified' : 'rejected'} successfully`,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Only uploader or admin can delete
    if (document.uploadedBy.toString() !== req.user._id.toString() && 
        !['county_admin', 'nlc_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this document'
      });
    }

    await document.deleteOne();

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
