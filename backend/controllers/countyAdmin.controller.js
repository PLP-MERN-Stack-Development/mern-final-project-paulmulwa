const Parcel = require('../models/Parcel');
const User = require('../models/User');
const Transfer = require('../models/Transfer');
const { generateTitleDeedPDF } = require('../services/pdfGenerator');

// @desc    Get County Admin Dashboard Overview
// @route   GET /api/county-admin/dashboard
// @access  Private (County Admin)
exports.getDashboardOverview = async (req, res, next) => {
  try {
    const adminCounty = req.user.county;

    // Get statistics for the assigned county only
    const totalParcels = await Parcel.countDocuments({ county: adminCounty });
    const activeParcels = await Parcel.countDocuments({ county: adminCounty, status: 'active' });
    const pendingTransfers = await Transfer.countDocuments({ 
      'parcel.county': adminCounty,
      status: { $in: ['pending', 'buyer_accepted'] }
    });
    const completedTransfers = await Transfer.countDocuments({ 
      'parcel.county': adminCounty,
      status: 'completed'
    });
    const flaggedParcels = await Parcel.countDocuments({ 
      county: adminCounty,
      isFraudulent: true
    });

    // Recent activity in the county
    const recentTransfers = await Transfer.find({ 'parcel.county': adminCounty })
      .sort('-createdAt')
      .limit(10)
      .populate('seller', 'firstName lastName')
      .populate('buyer', 'firstName lastName')
      .populate('parcel', 'titleNumber county');

    res.json({
      success: true,
      data: {
        county: adminCounty,
        statistics: {
          totalParcels,
          activeParcels,
          pendingTransfers,
          completedTransfers,
          flaggedParcels
        },
        recentActivity: recentTransfers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all parcels in County Admin's assigned county
// @route   GET /api/county-admin/parcels
// @access  Private (County Admin)
exports.getCountyParcels = async (req, res, next) => {
  try {
    const adminCounty = req.user.county;
    const { status, subCounty, constituency, ward, search } = req.query;

    const query = { county: adminCounty };
    
    if (status) query.status = status;
    if (subCounty) query.subCounty = subCounty;
    if (constituency) query.constituency = constituency;
    if (ward) query.ward = ward;
    
    // Search by title number, LR number, or owner name
    if (search) {
      query.$or = [
        { titleNumber: { $regex: search, $options: 'i' } },
        { lrNumber: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } }
      ];
    }

    const parcels = await Parcel.find(query)
      .populate('owner', 'firstName lastName email nationalId phoneNumber')
      .sort('-createdAt');

    res.json({
      success: true,
      county: adminCounty,
      count: parcels.length,
      data: parcels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new parcel in County Admin's assigned county
// @route   POST /api/county-admin/parcels
// @access  Private (County Admin)
exports.createCountyParcel = async (req, res, next) => {
  try {
    const adminCounty = req.user.county;

    // Verify the parcel county matches admin's county
    if (req.body.county && req.body.county !== adminCounty) {
      return res.status(403).json({
        success: false,
        message: `You can only create parcels in ${adminCounty}`
      });
    }

    // Force the county to be the admin's county
    req.body.county = adminCounty;

    // Verify the owner exists
    const owner = await User.findById(req.body.owner);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner user not found'
      });
    }

    // Set owner details
    req.body.ownerName = `${owner.firstName} ${owner.lastName}`;
    req.body.ownerIdNumber = owner.nationalId;
    req.body.ownerKraPin = owner.kraPin;

    const parcel = await Parcel.create(req.body);

    // Populate owner details
    await parcel.populate('owner', 'firstName lastName email nationalId phoneNumber');

    res.status(201).json({
      success: true,
      message: 'Parcel created successfully',
      data: parcel
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Title number already exists'
      });
    }
    next(error);
  }
};

// @desc    Update parcel in County Admin's assigned county
// @route   PUT /api/county-admin/parcels/:id
// @access  Private (County Admin)
exports.updateCountyParcel = async (req, res, next) => {
  try {
    const adminCounty = req.user.county;

    // Find the parcel
    let parcel = await Parcel.findById(req.params.id);
    
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    // Verify the parcel belongs to admin's county
    if (parcel.county !== adminCounty) {
      return res.status(403).json({
        success: false,
        message: `You can only update parcels in ${adminCounty}`
      });
    }

    // Prevent changing county
    if (req.body.county && req.body.county !== adminCounty) {
      return res.status(403).json({
        success: false,
        message: 'Cannot change parcel county'
      });
    }

    // If owner is being changed, verify new owner exists
    if (req.body.owner && req.body.owner !== parcel.owner.toString()) {
      const newOwner = await User.findById(req.body.owner);
      if (!newOwner) {
        return res.status(404).json({
          success: false,
          message: 'New owner user not found'
        });
      }
      req.body.ownerName = `${newOwner.firstName} ${newOwner.lastName}`;
      req.body.ownerIdNumber = newOwner.nationalId;
      req.body.ownerKraPin = newOwner.kraPin;
    }

    parcel = await Parcel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email nationalId phoneNumber');

    res.json({
      success: true,
      message: 'Parcel updated successfully',
      data: parcel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete parcel in County Admin's assigned county
// @route   DELETE /api/county-admin/parcels/:id
// @access  Private (County Admin)
exports.deleteCountyParcel = async (req, res, next) => {
  try {
    const adminCounty = req.user.county;

    const parcel = await Parcel.findById(req.params.id);
    
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    // Verify the parcel belongs to admin's county
    if (parcel.county !== adminCounty) {
      return res.status(403).json({
        success: false,
        message: `You can only delete parcels in ${adminCounty}`
      });
    }

    // Check if parcel has pending transfers
    const pendingTransfer = await Transfer.findOne({
      parcel: parcel._id,
      status: { $in: ['pending', 'buyer_accepted', 'county_approved'] }
    });

    if (pendingTransfer) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete parcel with pending transfers'
      });
    }

    // Soft delete by setting status to 'deleted'
    parcel.status = 'deleted';
    parcel.isActive = false;
    await parcel.save();

    res.json({
      success: true,
      message: 'Parcel deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get title deeds in County Admin's assigned county
// @route   GET /api/county-admin/title-deeds
// @access  Private (County Admin)
exports.getCountyTitleDeeds = async (req, res, next) => {
  try {
    const adminCounty = req.user.county;

    const parcels = await Parcel.find({ 
      county: adminCounty,
      status: { $ne: 'deleted' }
    })
      .populate('owner', 'firstName lastName email nationalId kraPin')
      .select('titleNumber lrNumber owner county subCounty constituency ward size ownerName status')
      .sort('-createdAt');

    res.json({
      success: true,
      county: adminCounty,
      count: parcels.length,
      data: parcels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transfers in County Admin's assigned county
// @route   GET /api/county-admin/transfers
// @access  Private (County Admin)
exports.getCountyTransfers = async (req, res, next) => {
  try {
    const adminCounty = req.user.county;
    const { status } = req.query;

    const query = { 'parcel.county': adminCounty };
    if (status) query.status = status;

    const transfers = await Transfer.find(query)
      .populate('seller', 'firstName lastName email nationalId')
      .populate('buyer', 'firstName lastName email nationalId')
      .populate('parcel', 'titleNumber lrNumber county subCounty')
      .sort('-createdAt');

    res.json({
      success: true,
      county: adminCounty,
      count: transfers.length,
      data: transfers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stop/Flag a transfer as fraudulent
// @route   PUT /api/county-admin/transfers/:id/stop
// @access  Private (County Admin)
exports.stopTransfer = async (req, res, next) => {
  try {
    const adminCounty = req.user.county;
    const { reason, isFraudulent } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Reason for stopping transfer is required'
      });
    }

    const transfer = await Transfer.findById(req.params.id)
      .populate('parcel');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Verify transfer is in admin's county
    if (transfer.parcel.county !== adminCounty) {
      return res.status(403).json({
        success: false,
        message: `You can only manage transfers in ${adminCounty}`
      });
    }

    // Update transfer status
    transfer.status = 'county_rejected';
    transfer.countyRemarks = reason;
    transfer.countyApprovedBy = req.user._id;
    transfer.countyApprovedAt = Date.now();

    // Add to actions history
    transfer.actions.push({
      action: 'stopped',
      performedBy: req.user._id,
      performedByRole: 'county_admin',
      remarks: reason,
      timestamp: Date.now()
    });

    await transfer.save();

    // If flagged as fraudulent, mark the parcel
    if (isFraudulent) {
      const parcel = await Parcel.findById(transfer.parcel._id);
      parcel.isFraudulent = true;
      parcel.fraudReason = reason;
      parcel.flaggedBy = req.user._id;
      parcel.flaggedAt = Date.now();
      parcel.status = 'disputed';
      await parcel.save();
    } else {
      // Return parcel to active status
      await Parcel.findByIdAndUpdate(transfer.parcel._id, {
        status: 'active'
      });
    }

    // TODO: Send notifications to buyer and seller

    res.json({
      success: true,
      message: 'Transfer stopped successfully',
      data: transfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transfer history for a parcel
// @route   GET /api/county-admin/parcels/:id/transfer-history
// @access  Private (County Admin)
exports.getParcelTransferHistory = async (req, res, next) => {
  try {
    const adminCounty = req.user.county;

    const parcel = await Parcel.findById(req.params.id);
    
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    // Verify parcel is in admin's county
    if (parcel.county !== adminCounty) {
      return res.status(403).json({
        success: false,
        message: `You can only view parcels in ${adminCounty}`
      });
    }

    const transfers = await Transfer.find({ parcel: parcel._id })
      .populate('seller', 'firstName lastName email nationalId')
      .populate('buyer', 'firstName lastName email nationalId')
      .populate('actions.performedBy', 'firstName lastName role')
      .sort('-createdAt');

    res.json({
      success: true,
      parcel: {
        id: parcel._id,
        titleNumber: parcel.titleNumber,
        currentOwner: parcel.ownerName,
        county: parcel.county
      },
      transfers: transfers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get fraudulent/flagged parcels in county
// @route   GET /api/county-admin/fraud-review
// @access  Private (County Admin)
exports.getFraudulentParcels = async (req, res, next) => {
  try {
    const adminCounty = req.user.county;

    const parcels = await Parcel.find({ 
      county: adminCounty,
      $or: [
        { isFraudulent: true },
        { status: 'disputed' }
      ]
    })
      .populate('owner', 'firstName lastName email nationalId')
      .populate('flaggedBy', 'firstName lastName')
      .sort('-flaggedAt');

    res.json({
      success: true,
      county: adminCounty,
      count: parcels.length,
      data: parcels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove fraud flag from parcel
// @route   PUT /api/county-admin/parcels/:id/remove-fraud-flag
// @access  Private (County Admin)
exports.removeFraudFlag = async (req, res, next) => {
  try {
    const adminCounty = req.user.county;
    const { resolution } = req.body;

    const parcel = await Parcel.findById(req.params.id);
    
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    // Verify parcel is in admin's county
    if (parcel.county !== adminCounty) {
      return res.status(403).json({
        success: false,
        message: `You can only manage parcels in ${adminCounty}`
      });
    }

    parcel.isFraudulent = false;
    parcel.fraudResolution = resolution;
    parcel.fraudResolvedBy = req.user._id;
    parcel.fraudResolvedAt = Date.now();
    parcel.status = 'active';

    await parcel.save();

    res.json({
      success: true,
      message: 'Fraud flag removed successfully',
      data: parcel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users in County Admin's county
// @route   GET /api/county-admin/users
// @access  Private (County Admin)
exports.getCountyUsers = async (req, res, next) => {
  try {
    // Get all users who own parcels in this county
    const adminCounty = req.user.county;

    const parcels = await Parcel.find({ county: adminCounty })
      .populate('owner', 'firstName lastName email nationalId kraPin phoneNumber')
      .select('owner titleNumber');

    // Extract unique owners
    const ownerMap = new Map();
    parcels.forEach(parcel => {
      if (parcel.owner && !ownerMap.has(parcel.owner._id.toString())) {
        ownerMap.set(parcel.owner._id.toString(), {
          ...parcel.owner.toObject(),
          parcelCount: 1
        });
      } else if (parcel.owner) {
        const existing = ownerMap.get(parcel.owner._id.toString());
        existing.parcelCount += 1;
      }
    });

    const users = Array.from(ownerMap.values());

    res.json({
      success: true,
      county: adminCounty,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
