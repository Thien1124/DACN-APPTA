const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề nhiệm vụ'],
    trim: true,
    maxlength: [100, 'Tiêu đề không được quá 100 ký tự']
  },
  description: {
    type: String,
    required: [true, 'Vui lòng nhập mô tả nhiệm vụ'],
    trim: true,
    maxlength: [500, 'Mô tả không được quá 500 ký tự']
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'achievement'],
    required: [true, 'Vui lòng chọn loại nhiệm vụ']
  },
  requirement: {
    type: {
      type: String,
      enum: ['lesson_complete', 'streak_days', 'xp_earned', 'perfect_score'],
      required: [true, 'Vui lòng chọn loại yêu cầu']
    },
    count: {
      type: Number,
      required: [true, 'Vui lòng nhập số lượng yêu cầu'],
      min: [1, 'Số lượng yêu cầu phải lớn hơn hoặc bằng 1']
    }
  },
  rewards: {
    xp: {
      type: Number,
      default: 0,
      min: [0, 'XP thưởng không được âm']
    },
    gems: {
      type: Number,
      default: 0,
      min: [0, 'Gems thưởng không được âm']
    },
    hearts: {
      type: Number,
      default: 0,
      min: [0, 'Hearts thưởng không được âm']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Tạo index cho các trường thường được tìm kiếm
missionSchema.index({ type: 1, isActive: 1 });

const Mission = mongoose.model('Mission', missionSchema);

module.exports = Mission;