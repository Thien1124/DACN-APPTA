const mongoose = require('mongoose');

/**
 * Model lưu các token đã logout (blacklist)
 * Token sẽ tự động bị xóa khi hết hạn (TTL index)
 */
const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // TTL: 1 ngày (24 * 60 * 60 = 86400 giây)
  }
});

// Index để tối ưu query
tokenBlacklistSchema.index({ token: 1, expiresAt: 1 });

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = TokenBlacklist;