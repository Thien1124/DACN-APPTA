const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication
      'REGISTER',
      'LOGIN',
      'LOGOUT',
      'VERIFY_OTP',
      'RESEND_OTP',
      'FORGOT_PASSWORD',
      'RESET_PASSWORD',
      'OAUTH_LOGIN',
      
      // Profile
      'UPDATE_PROFILE',
      'UPLOAD_AVATAR',
      'DELETE_AVATAR',
      'CHANGE_PASSWORD',
      
      // Security
      'ENABLE_2FA',
      'DISABLE_2FA',
      'VERIFY_2FA',
      'VERIFY_2FA_LOGIN', // Task 10: 2FA verification during login
      'USE_BACKUP_CODE',
      'SETUP_2FA',
      
      // Device Management (Task 33)
      'CREATE_DEVICE_SESSION',
      'REVOKE_DEVICE_SESSION',
      'REVOKE_ALL_SESSIONS',
      
      // Test Activities (Task 34)
      'START_TEST',
      'SUBMIT_TEST_ANSWER',
      'COMPLETE_TEST',
      'VIEW_TEST_RESULT',
      'VIEW_TEST_HISTORY',
      
      // Goal Management
      'CREATE_GOAL',
      'UPDATE_GOAL',
      'DELETE_GOAL',
      'COMPLETE_GOAL',
      'UPDATE_GOAL_PROGRESS',
      
      // Achievement Activities
      'UNLOCK_ACHIEVEMENT',
      'VIEW_ACHIEVEMENT',
      
      // Learning Activities (Thêm sau khi có Course/Lesson)
      'START_LESSON',
      'COMPLETE_LESSON',
      'START_PRACTICE',
      'COMPLETE_PRACTICE',
      'SUBMIT_ANSWER',
      'VIEW_VOCABULARY',
      'ADD_FLASHCARD',
      'STUDY_FLASHCARD',
      'REVIEW_FLASHCARD',
      
      //  Actions
      'ADMIN_UPDATE_USER',
      'ADMIN_DELETE_USER',
      'ADMIN_CREATE_COURSE',
      
      // Other
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED'
    ]
  },
  status: {
    type: String,
    required: true,
    enum: ['SUCCESS', 'FAILED', 'PENDING', 'PENDING_2FA'], // Task 10: Added PENDING_2FA for 2FA login flow
    default: 'SUCCESS'
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Object linh hoạt
    required: false
  },
  errorMessage: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 7776000 // TTL: Tự động xóa sau 90 ngày (90 * 24 * 60 * 60)
  }
});

// Compound indexes để tối ưu query
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;