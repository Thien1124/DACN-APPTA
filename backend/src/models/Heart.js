const mongoose = require('mongoose');

/**
 * Model Heart - Quản lý tim/năng lượng của người dùng
 * Tim được sử dụng để giới hạn số lần làm bài tập/bài kiểm tra
 * Tim sẽ tự động phục hồi theo thời gian
 */
const heartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Số tim hiện tại
  current: {
    type: Number,
    default: 5,
    min: 0,
    max: 5
  },
  
  // Số tim tối đa
  max: {
    type: Number,
    default: 5,
    min: 1
  },
  
  // Thời gian phục hồi mỗi tim (phút)
  recoveryTime: {
    type: Number,
    default: 30, // 30 phút cho mỗi tim
    min: 1
  },
  
  // Thời điểm tim cuối cùng được sử dụng
  lastUsedAt: {
    type: Date,
    default: Date.now
  },
  
  // Thời điểm tim cuối cùng được phục hồi
  lastRecoveredAt: {
    type: Date,
    default: Date.now
  },
  
  // Thời điểm tim tiếp theo sẽ được phục hồi
  nextRecoveryAt: {
    type: Date
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
heartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Tính toán thời gian phục hồi tim tiếp theo
  if (this.current < this.max) {
    const recoveryTimeMs = this.recoveryTime * 60 * 1000; // Chuyển phút thành ms
    this.nextRecoveryAt = new Date(Date.now() + recoveryTimeMs);
  } else {
    this.nextRecoveryAt = null; // Đã đầy tim
  }
  
  next();
});

// Method: Sử dụng tim
heartSchema.methods.useHeart = async function() {
  if (this.current <= 0) {
    return false; // Không đủ tim
  }
  
  // Kiểm tra xem có tim nào đã được phục hồi chưa
  await this.checkRecovery();
  
  if (this.current > 0) {
    this.current -= 1;
    this.lastUsedAt = new Date();
    
    // Cập nhật thời gian phục hồi tim tiếp theo
    if (this.current < this.max) {
      const recoveryTimeMs = this.recoveryTime * 60 * 1000;
      this.nextRecoveryAt = new Date(Date.now() + recoveryTimeMs);
    }
    
    await this.save();
    return true;
  }
  
  return false;
};

// Method: Kiểm tra và phục hồi tim
heartSchema.methods.checkRecovery = async function() {
  const now = new Date();
  const recoveryTimeMs = this.recoveryTime * 60 * 1000;
  const timeSinceLastRecovery = now - this.lastRecoveredAt;
  
  if (this.current < this.max && timeSinceLastRecovery >= recoveryTimeMs) {
    // Tính số tim có thể phục hồi
    const heartsToRecover = Math.min(
      Math.floor(timeSinceLastRecovery / recoveryTimeMs),
      this.max - this.current
    );
    
    if (heartsToRecover > 0) {
      this.current += heartsToRecover;
      this.lastRecoveredAt = new Date();
      
      // Nếu vẫn chưa đầy tim, cập nhật thời gian phục hồi tiếp theo
      if (this.current < this.max) {
        this.nextRecoveryAt = new Date(now.getTime() + recoveryTimeMs);
      } else {
        this.nextRecoveryAt = null; // Đã đầy tim
      }
    }
  }
  
  return this.current;
};

// Method: Thêm tim
heartSchema.methods.addHearts = async function(amount) {
  // Kiểm tra phục hồi trước
  await this.checkRecovery();
  
  this.current = Math.min(this.current + amount, this.max);
  
  if (this.current >= this.max) {
    this.nextRecoveryAt = null; // Đã đầy tim
  }
  
  return this.save();
};

// Method: Đặt lại tim về tối đa
heartSchema.methods.refill = async function() {
  this.current = this.max;
  this.lastRecoveredAt = new Date();
  this.nextRecoveryAt = null; // Đã đầy tim
  
  return this.save();
};

// Static: Lấy hoặc tạo mới heart cho user
heartSchema.statics.getOrCreate = async function(userId) {
  let heart = await this.findOne({ user: userId });
  
  if (!heart) {
    heart = await this.create({
      user: userId,
      current: 5,
      max: 5
    });
  } else {
    // Kiểm tra phục hồi tim
    await heart.checkRecovery();
  }
  
  return heart;
};

const Heart = mongoose.model('Heart', heartSchema);

module.exports = Heart;