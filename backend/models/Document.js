const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    enum: [
      'national_id',
      'kra_pin',
      'title_deed',
      'sale_agreement',
      'proof_of_ownership',
      'survey_map',
      'other'
    ],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Parcel', 'Transfer', 'User'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  remarks: String
}, {
  timestamps: true
});

documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ 'relatedTo.model': 1, 'relatedTo.id': 1 });

module.exports = mongoose.model('Document', documentSchema);
