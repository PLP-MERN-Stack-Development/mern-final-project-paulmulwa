const Transfer = require('../models/Transfer');
const Parcel = require('../models/Parcel');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper function to create notification
const createNotification = async (recipientId, type, title, message, relatedModel, relatedId, io, link = null) => {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    link,
    relatedTo: { model: relatedModel, id: relatedId }
  });

  // Emit socket event
  if (io) {
    io.to(recipientId.toString()).emit('notification', {
      type,
      title,
      message,
      link,
      createdAt: notification.createdAt
    });
  }

  return notification;
};

// @desc    Initiate land transfer
// @route   POST /api/transfers
// @access  Private/Seller
exports.initiateTransfer = async (req, res, next) => {
  try {
    const { parcelId, buyerName, buyerNationalId, buyerKraPin, agreedPrice } = req.body;

    // Verify parcel exists and belongs to seller
    const parcel = await Parcel.findById(parcelId);
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }

    if (parcel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not the owner of this parcel'
      });
    }

    if (parcel.status === 'pending_transfer') {
      return res.status(400).json({
        success: false,
        message: 'This parcel already has a pending transfer'
      });
    }

    // Find buyer by National ID and KRA PIN
    const buyer = await User.findOne({ 
      nationalId: buyerNationalId,
      kraPin: buyerKraPin.toUpperCase()
    });

    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found with provided National ID and KRA PIN. Please ensure the recipient is registered in the system.'
      });
    }

    if (buyer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot transfer land to yourself'
      });
    }

    // Create transfer request
    const transfer = await Transfer.create({
      parcel: parcelId,
      seller: req.user._id,
      buyer: buyer._id,
      buyerName,
      buyerNationalId,
      buyerKraPin: buyerKraPin.toUpperCase(),
      agreedPrice,
      status: 'pending_recipient_review',
      timeline: [{
        action: 'Transfer sent to recipient',
        performedBy: req.user._id,
        remarks: `Transfer sent by ${req.user.firstName} ${req.user.lastName}`
      }]
    });

    // Update parcel status
    parcel.status = 'pending_transfer';
    await parcel.save();

    // Notify buyer
    const io = req.app.get('io');
    await createNotification(
      buyer._id,
      'transfer_initiated',
      'Land Transfer Received',
      `${req.user.firstName} ${req.user.lastName} has sent you a land transfer request for ${parcel.titleNumber}. Please review and accept or reject.`,
      'Transfer',
      transfer._id,
      io,
      '/user/transfers/incoming'
    );

    // Notify county admins in the parcel's county
    const countyAdmins = await User.find({ 
      role: 'county_admin',
      county: parcel.county,
      isApproved: true
    });

    for (const admin of countyAdmins) {
      await createNotification(
        admin._id,
        'system_alert',
        'New Transfer Request',
        `New land transfer request for ${parcel.titleNumber} in ${parcel.county}`,
        'Transfer',
        transfer._id,
        io
      );
    }

    const populatedTransfer = await Transfer.findById(transfer._id)
      .populate('parcel')
      .populate('seller', 'firstName lastName email')
      .populate('buyer', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Transfer sent successfully. The recipient will be notified to review and respond.',
      data: populatedTransfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transfers
// @route   GET /api/transfers
// @access  Private
exports.getAllTransfers = async (req, res, next) => {
  try {
    const { status, county } = req.query;
    
    let query = {};

    // Role-based filtering - ONLY users involved in the transfer can see it
    if (req.user.role === 'user') {
      // Regular users can ONLY see transfers where they are sender OR recipient
      query.$or = [
        { seller: req.user._id },
        { buyer: req.user._id }
      ];
    } else if (req.user.role === 'county_admin') {
      // County admin sees only transfers in their county (for observation)
      const parcels = await Parcel.find({ county: req.user.county }).select('_id');
      const parcelIds = parcels.map(p => p._id);
      query.parcel = { $in: parcelIds };
    }
    // NLC Admin and Super Admin can see all transfers (for oversight)

    if (status) query.status = status;

    const transfers = await Transfer.find(query)
      .populate('parcel')
      .populate('seller', 'firstName lastName email')
      .populate('buyer', 'firstName lastName email')
      .populate('countyVerification.verifiedBy', 'firstName lastName')
      .populate('nlcApproval.approvedBy', 'firstName lastName')
      .sort('-createdAt');

    res.json({
      success: true,
      count: transfers.length,
      data: transfers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transfer by ID
// @route   GET /api/transfers/:id
// @access  Private
exports.getTransferById = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('parcel')
      .populate('seller', 'firstName lastName email nationalId phoneNumber')
      .populate('buyer', 'firstName lastName email nationalId phoneNumber')
      .populate('documents')
      .populate('timeline.performedBy', 'firstName lastName role')
      .populate('countyVerification.verifiedBy', 'firstName lastName')
      .populate('nlcApproval.approvedBy', 'firstName lastName');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Check authorization - ONLY involved users and admins (for observation) can view
    // When seller/buyer are populated, they're objects with _id property
    const sellerId = transfer.seller._id ? transfer.seller._id.toString() : transfer.seller.toString();
    const buyerId = transfer.buyer._id ? transfer.buyer._id.toString() : transfer.buyer.toString();
    
    const isInvolvedUser = 
      sellerId === req.user._id.toString() ||
      buyerId === req.user._id.toString();
    
    const isAdmin = 
      req.user.role === 'county_admin' ||
      req.user.role === 'nlc_admin' ||
      req.user.role === 'super_admin';

    if (!isInvolvedUser && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transfer. Only the sender and recipient can access this transfer.'
      });
    }

    res.json({
      success: true,
      data: transfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    County Admin verifies transfer
// @route   PUT /api/transfers/:id/county-verify
// @access  Private/County Admin
// @desc    County Admin views transfer (observation only)
// @route   GET /api/transfers/:id/county-view
// @access  Private/County Admin
exports.countyVerifyTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id).populate('parcel');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // County admins can only view, not modify transfers
    return res.status(403).json({
      success: false,
      message: 'County admins can view transfers for oversight but cannot modify them. Transfers are completed directly between users.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    NLC Admin views transfer (observation only)
// @route   GET /api/transfers/:id/nlc-view
// @access  Private/NLC Admin
exports.nlcApproveTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id).populate('parcel');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // NLC admins can only view, not modify transfers
    return res.status(403).json({
      success: false,
      message: 'NLC admins can view transfers for oversight but cannot modify them. Transfers are completed directly between users.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel transfer
// @route   PUT /api/transfers/:id/cancel
// @access  Private/Seller, NLC Admin
exports.cancelTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Only seller or NLC admin can cancel
    if (transfer.seller.toString() !== req.user._id.toString() && req.user.role !== 'nlc_admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this transfer'
      });
    }

    if (['completed', 'cancelled'].includes(transfer.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed or already cancelled transfer'
      });
    }

    transfer.status = 'cancelled';
    transfer.cancelledAt = Date.now();
    transfer.cancelledBy = req.user._id;
    transfer.timeline.push({
      action: 'Transfer cancelled',
      performedBy: req.user._id,
      remarks: req.body.reason || 'No reason provided'
    });

    await transfer.save();

    // Update parcel status
    const parcel = await Parcel.findById(transfer.parcel);
    parcel.status = 'active';
    await parcel.save();

    // Notify buyer
    const io = req.app.get('io');
    await createNotification(
      transfer.buyer,
      'system_alert',
      'Transfer Cancelled',
      `The transfer for parcel ${parcel.titleNumber} has been cancelled`,
      'Transfer',
      transfer._id,
      io
    );

    res.json({
      success: true,
      message: 'Transfer cancelled successfully',
      data: transfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Recipient accepts transfer
// @route   PUT /api/transfers/:id/accept
// @access  Private (Recipient only)
exports.acceptTransfer = async (req, res, next) => {
  try {
    const Parcel = require('../models/Parcel');
    const User = require('../models/User');
    
    const transfer = await Transfer.findById(req.params.id)
      .populate('parcel')
      .populate('seller', 'firstName lastName email')
      .populate('buyer', 'firstName lastName email');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Only the buyer (recipient) can accept
    // Check if buyer exists
    if (!transfer.buyer) {
      return res.status(400).json({
        success: false,
        message: 'Transfer buyer information is missing'
      });
    }

    // When buyer is populated, it's an object with _id property, otherwise it's an ObjectId
    // Get the buyer ID - handle both populated and unpopulated cases
    let buyerId;
    if (transfer.buyer._id) {
      buyerId = transfer.buyer._id.toString();
    } else if (transfer.buyer.toString) {
      buyerId = transfer.buyer.toString();
    } else {
      buyerId = String(transfer.buyer);
    }
    
    // Get current user ID - handle both _id and id properties
    let currentUserId;
    if (req.user._id) {
      currentUserId = req.user._id.toString();
    } else if (req.user.id) {
      currentUserId = String(req.user.id);
    } else {
      currentUserId = String(req.user);
    }
    
    console.log('=== AUTHORIZATION DEBUG ===');
    console.log('transfer.buyer:', transfer.buyer);
    console.log('transfer.buyer._id:', transfer.buyer._id);
    console.log('Buyer ID:', buyerId);
    console.log('req.user:', req.user);
    console.log('req.user._id:', req.user._id);
    console.log('req.user.id:', req.user.id);
    console.log('Current User ID:', currentUserId);
    console.log('Match:', buyerId === currentUserId);
    console.log('=========================');
    
    if (buyerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can accept this transfer'
      });
    }

    // Check if transfer is in correct status
    if (transfer.status !== 'pending_recipient_review') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept transfer in ${transfer.status} status`
      });
    }

    // Update transfer status to completed
    transfer.status = 'completed';
    transfer.recipientReview = {
      reviewedAt: Date.now(),
      status: 'accepted',
      remarks: req.body.remarks || 'Accepted by recipient'
    };
    transfer.completedAt = Date.now();
    transfer.timeline.push({
      action: 'Transfer accepted and completed',
      performedBy: req.user._id,
      remarks: req.body.remarks || 'Recipient accepted the transfer. Ownership transferred.'
    });

    await transfer.save();

    // Update parcel ownership
    const parcel = await Parcel.findById(transfer.parcel._id);
    parcel.owner = transfer.buyer._id;
    parcel.ownerDetails = {
      name: `${transfer.buyer.firstName} ${transfer.buyer.lastName}`,
      nationalId: transfer.buyer.nationalId,
      kraPin: transfer.buyer.kraPin,
      email: transfer.buyer.email
    };
    parcel.status = 'active';
    
    // Add to ownership history
    if (!parcel.ownershipHistory) {
      parcel.ownershipHistory = [];
    }
    parcel.ownershipHistory.push({
      previousOwner: transfer.seller._id,
      newOwner: transfer.buyer._id,
      transferDate: Date.now(),
      transferNumber: transfer.transferNumber,
      transferId: transfer._id
    });

    await parcel.save();

    // Notify seller
    const io = req.app.get('io');
    await createNotification(
      transfer.seller._id,
      'transfer_approved',
      'Transfer Completed',
      `${transfer.buyer.firstName} ${transfer.buyer.lastName} has accepted the transfer for ${transfer.parcel.titleNumber}. Ownership has been transferred.`,
      'Transfer',
      transfer._id,
      io
    );

    // Notify county admin for record keeping (observation only)
    const countyAdmins = await User.find({
      role: 'county_admin',
      county: transfer.parcel.county,
      isApproved: true
    });

    for (const admin of countyAdmins) {
      await createNotification(
        admin._id,
        'system_alert',
        'Transfer Completed in Your County',
        `Transfer ${transfer.transferNumber} for parcel ${transfer.parcel.titleNumber} has been completed between users.`,
        'Transfer',
        transfer._id,
        io
      );
    }

    // Notify NLC for national record keeping (observation only)
    const nlcAdmins = await User.find({ role: 'nlc_admin' });
    for (const admin of nlcAdmins) {
      await createNotification(
        admin._id,
        'system_alert',
        'Transfer Completed',
        `Transfer ${transfer.transferNumber} for parcel ${transfer.parcel.titleNumber} in ${transfer.parcel.county} has been completed.`,
        'Transfer',
        transfer._id,
        io
      );
    }

    res.json({
      success: true,
      message: 'Transfer accepted and completed successfully. You are now the owner of this parcel.',
      data: transfer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Recipient rejects transfer
// @route   PUT /api/transfers/:id/reject
// @access  Private (Recipient only)
exports.rejectTransfer = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for rejection'
      });
    }

    const transfer = await Transfer.findById(req.params.id)
      .populate('parcel')
      .populate('seller', 'firstName lastName email');

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    // Only the buyer (recipient) can reject
    if (transfer.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can reject this transfer'
      });
    }

    // Check if transfer is in correct status
    if (transfer.status !== 'pending_recipient_review') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject transfer in ${transfer.status} status`
      });
    }

    // Update transfer status
    transfer.status = 'rejected';
    transfer.recipientReview = {
      reviewedAt: Date.now(),
      status: 'rejected',
      remarks: reason
    };
    transfer.rejectionReason = reason;
    transfer.timeline.push({
      action: 'Transfer rejected by recipient',
      performedBy: req.user._id,
      remarks: reason
    });

    await transfer.save();

    // Update parcel status back to active
    const Parcel = require('../models/Parcel');
    const parcel = await Parcel.findById(transfer.parcel._id);
    parcel.status = 'active';
    await parcel.save();

    // Notify seller
    const io = req.app.get('io');
    await createNotification(
      transfer.seller._id,
      'transfer_rejected',
      'Transfer Rejected',
      `${req.user.firstName} ${req.user.lastName} has rejected the transfer for ${transfer.parcel.titleNumber}. Reason: ${reason}`,
      'Transfer',
      transfer._id,
      io
    );

    res.json({
      success: true,
      message: 'Transfer rejected successfully',
      data: transfer
    });
  } catch (error) {
    next(error);
  }
};
