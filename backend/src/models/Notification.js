const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      // Test Results
      'TEST_COMPLETED',
      'TEST_PASSED',
      'TEST_FAILED',
      'TEST_GRADED',
      
      // Learning Progress
      'LESSON_COMPLETED',
      'COURSE_COMPLETED',
      'ACHIEVEMENT_UNLOCKED',
      'LEVEL_UP',
      'STREAK_MILESTONE',
      
      // System Updates
      'SYSTEM_UPDATE',
      'NEW_COURSE',
      'NEW_FEATURE',
      'MAINTENANCE',
      
      // Account
      'WELCOME',
      'ACCOUNT_VERIFIED',
      'PASSWORD_CHANGED',
      'PROFILE_UPDATED',
      
      // Social
      'NEW_FOLLOWER',
      'NEW_COMMENT',
      'MENTION',
      
      // Reminders
      'STUDY_REMINDER',
      'PRACTICE_REMINDER',
      'REVIEW_REMINDER'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Dữ liệu bổ sung (testId, courseId, etc.)
    required: false
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    required: false
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL'
  },
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: {
      type: Date,
      required: false
    }
  },
  actionUrl: {
    type: String,
    required: false
  },
  expiresAt: {
    type: Date,
    required: false,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });

// TTL index - Tự động xóa notification sau 90 ngày
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Virtual: isExpired
notificationSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Method: markAsRead
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;