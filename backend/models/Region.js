const mongoose = require('mongoose');

const regionSchema = new mongoose.Schema({
  county: {
    type: String,
    required: true
  },
  subCounties: [{
    name: String,
    constituencies: [{
      name: String,
      wards: [String]
    }]
  }]
}, {
  timestamps: true
});

regionSchema.index({ county: 1 });

module.exports = mongoose.model('Region', regionSchema);
