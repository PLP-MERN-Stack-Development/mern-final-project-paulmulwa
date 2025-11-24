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
