const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
  titleNumber: {
    type: String,
    required: [true, 'Title number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  lrNumber: {
    type: String,
    required: [true, 'LR Number is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerIdNumber: {
    type: String,
    required: false
  },
  ownerKraPin: {
    type: String,
    required: false
  },
  county: {
    type: String,
    required: [true, 'County is required']
  },
  subCounty: {
    type: String,
    required: [true, 'Sub-county is required']
  },
  constituency: {
    type: String,
    required: [true, 'Constituency is required']
  },
  ward: {
    type: String,
    required: [true, 'Ward is required']
  },
  size: {
    value: {
      type: Number,
      required: [true, 'Land size is required'],
      min: 0
    },
    unit: {
      type: String,
      enum: ['acres', 'hectares', 'square_meters'],
      default: 'acres'
    }
  },
  coordinates: {
    latitude: {
      type: Number,
      required: false
    },
    longitude: {
      type: Number,
      required: false
    }
  },
  zoning: {
    type: String,
    enum: ['residential', 'commercial', 'agricultural', 'industrial', 'mixed'],
    required: [true, 'Zoning is required']
  },
  landUse: {
    type: String,
    required: false
  },
  marketValue: {
    type: Number,
    required: false,
    min: 0
  },
  description: {
    type: String,
    required: false
  },
  images: [{
    type: String
  }],
  documents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  status: {
    type: String,
    enum: ['active', 'pending_transfer', 'transferred', 'disputed'],
    default: 'active'
  },
  // Approval workflow
  approvalStatus: {
    type: String,
    enum: ['pending_county_admin', 'pending_nlc_admin', 'approved', 'rejected'],
    default: 'pending_county_admin'
  },
  countyAdminApproval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    remarks: String
  },
  nlcAdminApproval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    remarks: String
  },
  transferHistory: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    },
    transferId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transfer'
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  // Fraud detection fields
  isFraudulent: {
    type: Boolean,
    default: false
  },
  fraudReason: {
    type: String
  },
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  flaggedAt: {
    type: Date
  },
  fraudResolution: {
    type: String
  },
  fraudResolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  fraudResolvedAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
parcelSchema.index({ titleNumber: 1 });
parcelSchema.index({ owner: 1 });
parcelSchema.index({ county: 1, subCounty: 1 });
parcelSchema.index({ status: 1 });

module.exports = mongoose.model('Parcel', parcelSchema);
