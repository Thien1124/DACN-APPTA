const mongoose = require('mongoose');

const userInventorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopItem',
    required: true
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Tạo index cho các trường thường được tìm kiếm
userInventorySchema.index({ userId: 1, isActive: 1 });
userInventorySchema.index({ userId: 1, itemId: 1 });

const UserInventory = mongoose.model('UserInventory', userInventorySchema);

module.exports = UserInventory;