const Parcel = require('../models/Parcel');
const User = require('../models/User');
const Transfer = require('../models/Transfer');
const { generateTitleDeedPDF, generateTransferHistoryPDF } = require('../services/pdfGenerator');

// @desc    Get all parcels
// @route   GET /api/parcels
// @access  Private
exports.getAllParcels = async (req, res, next) => {
  try {
    const { county, subCounty, constituency, ward, owner, status } = req.query;
    
    const query = {};
    if (county) query.county = county;
    if (subCounty) query.subCounty = subCounty;
    if (constituency) query.constituency = constituency;
    if (ward) query.ward = ward;
    if (owner) query.owner = owner;
    if (status) query.status = status;

    const parcels = await Parcel.find(query)
      .populate('owner', 'firstName lastName email nationalId')
      .sort('-createdAt');

    res.json({
      success: true,
      count: parcels.length,
      data: parcels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get parcel by ID
// @route   GET /api/parcels/:id
// @access  Private
exports.getParcelById = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.id)
      .populate('owner', 'firstName lastName email nationalId phoneNumber')
      .populate('documents')
      .populate('transferHistory.from', 'firstName lastName')
      .populate('transferHistory.to', 'firstName lastName');

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    res.json({
      success: true,
      data: parcel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get parcel by title number
// @route   GET /api/parcels/title/:titleNumber
// @access  Private
exports.getParcelByTitleNumber = async (req, res, next) => {
  try {
    const parcel = await Parcel.findOne({ titleNumber: req.params.titleNumber.toUpperCase() })
      .populate('owner', 'firstName lastName email nationalId phoneNumber')
      .populate('documents');

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found with this title number'
      });
    }

    res.json({
      success: true,
      data: parcel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's parcels
// @route   GET /api/parcels/my/parcels
// @access  Private
exports.getMyParcels = async (req, res, next) => {
  try {
    const parcels = await Parcel.find({ owner: req.user._id })
      .populate('documents')
      .sort('-createdAt');

    res.json({
      success: true,
      count: parcels.length,
      data: parcels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create parcel
// @route   POST /api/parcels
// @access  Private/County Admin, NLC Admin
exports.createParcel = async (req, res, next) => {
  try {
    const {
      titleNumber,
      lrNumber,
      ownerId,
      county,
      subCounty,
      constituency,
      ward,
      size,
      coordinates,
      zoning,
      landUse,
      marketValue,
      description
    } = req.body;

    // Check if parcel with title number exists
    const existingParcel = await Parcel.findOne({ titleNumber: titleNumber.toUpperCase() });
    if (existingParcel) {
      return res.status(400).json({
        success: false,
        message: 'Parcel with this title number already exists'
      });
    }

    // Get owner details
    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    // Create parcel
    const parcel = await Parcel.create({
      titleNumber: titleNumber.toUpperCase(),
      lrNumber,
      owner: ownerId,
      ownerName: `${owner.firstName} ${owner.lastName}`,
      county,
      subCounty,
      constituency,
      ward,
      size,
      coordinates,
      zoning,
      landUse,
      marketValue,
      description,
      verifiedBy: req.user._id,
      verifiedAt: Date.now(),
      isVerified: true
    });

    res.status(201).json({
      success: true,
      message: 'Parcel created successfully',
      data: parcel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update parcel
// @route   PUT /api/parcels/:id
// @access  Private/County Admin, NLC Admin
exports.updateParcel = async (req, res, next) => {
  try {
    const parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    res.json({
      success: true,
      message: 'Parcel updated successfully',
      data: parcel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete parcel
// @route   DELETE /api/parcels/:id
// @access  Private/NLC Admin
exports.deleteParcel = async (req, res, next) => {
  try {
    const parcel = await Parcel.findByIdAndDelete(req.params.id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    res.json({
      success: true,
      message: 'Parcel deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search parcels
// @route   GET /api/parcels/search
// @access  Private
exports.searchParcels = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query required'
      });
    }

    const parcels = await Parcel.find({
      $or: [
        { titleNumber: { $regex: q, $options: 'i' } },
        { lrNumber: { $regex: q, $options: 'i' } },
        { ownerName: { $regex: q, $options: 'i' } },
        { county: { $regex: q, $options: 'i' } }
      ]
    }).populate('owner', 'firstName lastName email').limit(20);

    res.json({
      success: true,
      count: parcels.length,
      data: parcels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get parcels pending approval
// @route   GET /api/parcels/pending
// @access  Private/County Admin, NLC Admin
exports.getPendingParcels = async (req, res, next) => {
  try {
    const { role, county } = req.user;
    let query = {};

    if (role === 'county_admin') {
      query = {
        county: county,
        approvalStatus: 'pending_county_admin'
      };
    } else if (role === 'nlc_admin' || role === 'super_admin') {
      query = {
        approvalStatus: 'pending_nlc_admin'
      };
    }

    const parcels = await Parcel.find(query)
      .populate('owner', 'firstName lastName email nationalId')
      .sort('-createdAt');

    res.json({
      success: true,
      count: parcels.length,
      data: parcels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    County Admin approve/reject parcel
// @route   PUT /api/parcels/:id/county-approval
// @access  Private/County Admin
exports.countyAdminApproval = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    // Check if county admin is for the same county
    if (req.user.county !== parcel.county) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve parcels in your county'
      });
    }

    parcel.countyAdminApproval = {
      status,
      approvedBy: req.user._id,
      approvedAt: Date.now(),
      remarks
    };

    if (status === 'approved') {
      parcel.approvalStatus = 'pending_nlc_admin';
    } else if (status === 'rejected') {
      parcel.approvalStatus = 'rejected';
    }

    await parcel.save();

    res.json({
      success: true,
      message: `Parcel ${status} successfully`,
      data: parcel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    NLC Admin approve/reject parcel
// @route   PUT /api/parcels/:id/nlc-approval
// @access  Private/NLC Admin, Super Admin
exports.nlcAdminApproval = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    parcel.nlcAdminApproval = {
      status,
      approvedBy: req.user._id,
      approvedAt: Date.now(),
      remarks
    };

    if (status === 'approved') {
      parcel.approvalStatus = 'approved';
      parcel.isVerified = true;
      parcel.verifiedBy = req.user._id;
      parcel.verifiedAt = Date.now();
    } else if (status === 'rejected') {
      parcel.approvalStatus = 'rejected';
    }

    await parcel.save();

    res.json({
      success: true,
      message: `Parcel ${status} successfully`,
      data: parcel
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Generate Title Deed PDF
// @route   GET /api/parcels/:id/title-deed-pdf
// @access  Private
exports.generateTitleDeedPDF = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.id)
      .populate('owner', 'firstName lastName email nationalId phoneNumber kraPin');

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    const pdfBuffer = await generateTitleDeedPDF(parcel, parcel.owner);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=title-deed-${parcel.titleNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating title deed PDF:', error);
    next(error);
  }
};

// @desc    View Title Deed PDF in browser
// @route   GET /api/parcels/:id/title-deed-pdf/view
// @access  Private
exports.viewTitleDeedPDF = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.id)
      .populate('owner', 'firstName lastName email nationalId phoneNumber kraPin');

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    const pdfBuffer = await generateTitleDeedPDF(parcel, parcel.owner);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=title-deed-${parcel.titleNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error viewing title deed PDF:', error);
    next(error);
  }
};

// @desc    Generate Transfer History PDF
// @route   GET /api/parcels/:id/transfer-history-pdf
// @access  Private
exports.generateTransferHistoryPDF = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    const transfers = await Transfer.find({ parcel: req.params.id })
      .populate('seller', 'firstName lastName email nationalId')
      .populate('buyer', 'firstName lastName email nationalId')
      .sort('createdAt');

    const pdfBuffer = await generateTransferHistoryPDF(parcel, transfers);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=transfer-history-${parcel.titleNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating transfer history PDF:', error);
    next(error);
  }
};

// @desc    Get parcel transfer history with full details
// @route   GET /api/parcels/:id/transfer-history
// @access  Private
exports.getParcelTransferHistory = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    const transfers = await Transfer.find({ parcel: req.params.id })
      .populate('seller', 'firstName lastName email nationalId phoneNumber')
      .populate('buyer', 'firstName lastName email nationalId phoneNumber')
      .populate('parcel', 'titleNumber lrNumber')
      .sort('-createdAt');

    const transferHistory = transfers.map(transfer => ({
      _id: transfer._id,
      transferNumber: transfer.transferNumber,
      previousOwner: {
        name: `${transfer.seller?.firstName || ''} ${transfer.seller?.lastName || ''}`.trim(),
        email: transfer.seller?.email,
        nationalId: transfer.seller?.nationalId,
        phone: transfer.seller?.phoneNumber
      },
      newOwner: {
        name: `${transfer.buyer?.firstName || ''} ${transfer.buyer?.lastName || ''}`.trim(),
        email: transfer.buyer?.email,
        nationalId: transfer.buyer?.nationalId,
        phone: transfer.buyer?.phoneNumber
      },
      dateInitiated: transfer.createdAt,
      dateCompleted: transfer.completedAt,
      status: transfer.status,
      transferReference: transfer.transferNumber,
      remarks: transfer.remarks || '',
      timeline: transfer.timeline || []
    }));

    res.json({
      success: true,
      count: transferHistory.length,
      data: {
        parcel: {
          titleNumber: parcel.titleNumber,
          lrNumber: parcel.lrNumber,
          currentOwner: parcel.ownerName
        },
        transfers: transferHistory
      }
    });
  } catch (error) {
    console.error('Error fetching transfer history:', error);
    next(error);
  }
};


// PDF Generation Functions for Parcel Controller

// Add these to the end of parcel.controller.js

// @desc    Generate Title Deed PDF
// @route   GET /api/parcels/:id/title-deed-pdf
// @access  Private
exports.generateTitleDeedPDF = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.id)
      .populate('owner', 'firstName lastName email nationalId phoneNumber kraPin');

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    const pdfBuffer = await generateTitleDeedPDF(parcel, parcel.owner);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=title-deed-${parcel.titleNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating title deed PDF:', error);
    next(error);
  }
};

// @desc    View Title Deed PDF in browser
// @route   GET /api/parcels/:id/title-deed-pdf/view
// @access  Private
exports.viewTitleDeedPDF = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.id)
      .populate('owner', 'firstName lastName email nationalId phoneNumber kraPin');

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    const pdfBuffer = await generateTitleDeedPDF(parcel, parcel.owner);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=title-deed-${parcel.titleNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error viewing title deed PDF:', error);
    next(error);
  }
};

// @desc    Generate Transfer History PDF
// @route   GET /api/parcels/:id/transfer-history-pdf
// @access  Private
exports.generateTransferHistoryPDF = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    const transfers = await Transfer.find({ parcel: req.params.id })
      .populate('seller', 'firstName lastName email nationalId')
      .populate('buyer', 'firstName lastName email nationalId')
      .sort('createdAt');

    const pdfBuffer = await generateTransferHistoryPDF(parcel, transfers);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=transfer-history-${parcel.titleNumber}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating transfer history PDF:', error);
    next(error);
  }
};

// @desc    Get parcel transfer history with full details
// @route   GET /api/parcels/:id/transfer-history
// @access  Private
exports.getParcelTransferHistory = async (req, res, next) => {
  try {
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    const transfers = await Transfer.find({ parcel: req.params.id })
      .populate('seller', 'firstName lastName email nationalId phoneNumber')
      .populate('buyer', 'firstName lastName email nationalId phoneNumber')
      .populate('parcel', 'titleNumber lrNumber')
      .sort('-createdAt');

    const transferHistory = transfers.map(transfer => ({
      _id: transfer._id,
      transferNumber: transfer.transferNumber,
      previousOwner: {
        name: `${transfer.seller?.firstName || ''} ${transfer.seller?.lastName || ''}`.trim(),
        email: transfer.seller?.email,
        nationalId: transfer.seller?.nationalId,
        phone: transfer.seller?.phoneNumber
      },
      newOwner: {
        name: `${transfer.buyer?.firstName || ''} ${transfer.buyer?.lastName || ''}`.trim(),
        email: transfer.buyer?.email,
        nationalId: transfer.buyer?.nationalId,
        phone: transfer.buyer?.phoneNumber
      },
      dateInitiated: transfer.createdAt,
      dateCompleted: transfer.completedAt,
      status: transfer.status,
      transferReference: transfer.transferNumber,
      remarks: transfer.remarks || '',
      timeline: transfer.timeline || []
    }));

    res.json({
      success: true,
      count: transferHistory.length,
      data: {
        parcel: {
          titleNumber: parcel.titleNumber,
          lrNumber: parcel.lrNumber,
          currentOwner: parcel.ownerName
        },
        transfers: transferHistory
      }
    });
  } catch (error) {
    console.error('Error fetching transfer history:', error);
    next(error);
  }
};

