const mongoose = require('mongoose');

/**
 * GoogleIntegration - Lưu token/thiết lập Google Calendar (Task 21)
 */
const googleIntegrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  accessToken: {
    type: String,
    select: false
  },
  refreshToken: {
    type: String,
    select: false
  },
  tokenExpiry: {
    type: Date
  },

  calendarId: {
    type: String
  },

  connectedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

googleIntegrationSchema.index({ user: 1 });

const GoogleIntegration = mongoose.model('GoogleIntegration', googleIntegrationSchema);

module.exports = GoogleIntegration;


