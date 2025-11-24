const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  transferNumber: {
    type: String,
    required: false,
    unique: true,
    uppercase: true
  },
  parcel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parcel',
    required: [true, 'Parcel is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerNationalId: {
    type: String,
    required: true
  },
  buyerKraPin: {
    type: String,
    required: true
  },
  agreedPrice: {
    type: Number,
    required: false,
    min: 0
  },
  status: {
    type: String,
    enum: [
      'pending_recipient_review',
      'accepted',
      'rejected',
      'completed',
      'cancelled'
    ],
    default: 'pending_recipient_review'
  },
  recipientReview: {
    reviewedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    remarks: String
  },
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  countyAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  countyVerification: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_review']
    },
    remarks: String,
    documentsVerified: Boolean,
    identityVerified: Boolean,
    landDetailsVerified: Boolean
  },
  nlcAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  nlcApproval: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected']
    },
    remarks: String
  },
  timeline: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }],
  // Actions history for fraud detection and admin interventions
  actions: [{
    action: {
      type: String,
      enum: ['initiated', 'accepted', 'rejected', 'stopped', 'county_approved', 'county_rejected', 'nlc_approved', 'nlc_rejected', 'completed', 'cancelled']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedByRole: {
      type: String,
      enum: ['user', 'county_admin', 'nlc_admin', 'super_admin']
    },
    remarks: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  rejectionReason: String,
  completedAt: Date,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // County admin fields
  countyRemarks: String,
  countyApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  countyApprovedAt: Date
}, {
  timestamps: true
});

// Generate transfer number before saving
transferSchema.pre('save', async function(next) {
  if (!this.transferNumber) {
    const count = await mongoose.model('Transfer').countDocuments();
    this.transferNumber = `TRF${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Indexes
transferSchema.index({ transferNumber: 1 });
transferSchema.index({ seller: 1 });
transferSchema.index({ buyer: 1 });
transferSchema.index({ status: 1 });
transferSchema.index({ parcel: 1 });

module.exports = mongoose.model('Transfer', transferSchema);
