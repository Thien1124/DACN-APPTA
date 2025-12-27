const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên vật phẩm'],
    trim: true,
    maxlength: [100, 'Tên vật phẩm không được quá 100 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả vật phẩm'],
    trim: true,
    maxlength: [500, 'Mô tả không được quá 500 ký tự']
  },
  type: {
    type: String,
    enum: ['heart', 'boost', 'theme', 'avatar', 'outfit', 'other'],
    required: [true, 'Vui lòng chọn loại vật phẩm']
  },
  price: {
    gems: {
      type: Number,
      required: [true, 'Vui lòng nhập giá vật phẩm'],
      min: [0, 'Giá không được âm']
    }
  },
  effects: {
    hearts: {
      type: Number,
      default: 0
    },
    xpBoost: {
      type: Number,
      default: 0
    },
    streakFreeze: {
      type: Boolean,
      default: false
    }
  },
  // Outfit-specific fields
  outfitData: {
    category: {
      type: String,
      enum: ['casual', 'formal', 'sporty', 'fantasy', 'seasonal', 'premium'],
      default: 'casual'
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common'
    },
    color: {
      type: String,
      default: '#1CB0F6'
    },
    iconEmoji: {
      type: String, // Emoji hoặc icon đại diện cho outfit
      default: '👕'
    }
  },
  duration: {
    type: Number, // Thời gian hiệu lực tính bằng giây, 0 = vĩnh viễn
    default: 0
  },
  image: {
    type: String
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Tạo index cho các trường thường được tìm kiếm
shopItemSchema.index({ type: 1, isAvailable: 1 });
shopItemSchema.index({ 'price.gems': 1 });

const ShopItem = mongoose.model('ShopItem', shopItemSchema);

module.exports = ShopItem;