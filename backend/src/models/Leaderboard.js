const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Bảng xếp hạng phải thuộc về một người dùng']
  },
  xpTotal: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  weeklyXP: {
    type: Number,
    default: 0
  },
  monthlyXP: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware trước khi lưu để cập nhật updatedAt
leaderboardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

module.exports = Leaderboard;