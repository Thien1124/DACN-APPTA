const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Device Session Schema
 * Tracks user login sessions across multiple devices
 * Schema theo dõi phiên đăng nhập của người dùng trên nhiều thiết bị
 */
const DeviceSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Device Information
  deviceInfo: {
    deviceId: {
      type: String,
      required: true,
      index: true
    },
    deviceName: {
      type: String,
      default: 'Unknown Device'
    },
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet', 'unknown'],
      default: 'unknown'
    },
    os: {
      name: String, // Windows, macOS, Linux, iOS, Android
      version: String
    },
    browser: {
      name: String, // Chrome, Firefox, Safari, Edge
      version: String
    },
    // Device fingerprint for tracking
    fingerprint: {
      type: String,
      index: true
    }
  },
  
  // Location Information
  location: {
    ip: {
      type: String,
      required: true
    },
    country: String,
    countryCode: String,
    region: String,
    city: String,
    timezone: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Session Information
  sessionToken: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  jwtToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    index: true
  },
  
  // Session Status
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked', 'suspicious'],
    default: 'active',
    index: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  revokedAt: Date,
  
  // Security Flags
  isTrusted: {
    type: Boolean,
    default: false
  },
  isFirstTime: {
    type: Boolean,
    default: true
  },
  requiresVerification: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  
  // Suspicious Activity Tracking
  suspiciousActivity: {
    isSuspicious: {
      type: Boolean,
      default: false
    },
    reasons: [String],
    detectedAt: Date,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    }
  },
  
  // Activity Log
  activityLog: [{
    action: {
      type: String,
      enum: ['login', 'refresh', 'activity', 'logout', 'revoke', 'suspicious_detected']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    location: String,
    details: String
  }],
  
  // Metadata
  userAgent: String,
  metadata: {
    loginMethod: {
      type: String,
      enum: ['password', 'google', 'facebook', 'apple', '2fa'],
      default: 'password'
    },
    loginCount: {
      type: Number,
      default: 1
    },
    lastLoginIp: String,
    lastLoginLocation: String
  }
}, {
  timestamps: true
});

// Indexes for performance
DeviceSessionSchema.index({ user: 1, status: 1 });
DeviceSessionSchema.index({ user: 1, 'deviceInfo.deviceId': 1 });
DeviceSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
DeviceSessionSchema.index({ 'suspiciousActivity.isSuspicious': 1, status: 1 });

// Generate session token
DeviceSessionSchema.statics.generateSessionToken = function() {
  return crypto.randomBytes(32).toString('hex');
};

// Check if session is valid
DeviceSessionSchema.methods.isValid = function() {
  return this.status === 'active' && 
         this.expiresAt > new Date() &&
         !this.suspiciousActivity.isSuspicious;
};

// Update last activity
DeviceSessionSchema.methods.updateActivity = function(action = 'activity', ip = '', details = '') {
  this.lastActivityAt = new Date();
  this.activityLog.push({
    action,
    timestamp: new Date(),
    ip,
    details
  });
  return this.save();
};

// Mark as suspicious
DeviceSessionSchema.methods.markAsSuspicious = function(reasons = [], riskLevel = 'medium') {
  this.suspiciousActivity = {
    isSuspicious: true,
    reasons,
    detectedAt: new Date(),
    riskLevel
  };
  this.status = 'suspicious';
  this.activityLog.push({
    action: 'suspicious_detected',
    timestamp: new Date(),
    details: reasons.join(', ')
  });
  return this.save();
};

// Revoke session
DeviceSessionSchema.methods.revoke = function(reason = 'Manual revocation') {
  this.status = 'revoked';
  this.revokedAt = new Date();
  this.activityLog.push({
    action: 'revoke',
    timestamp: new Date(),
    details: reason
  });
  return this.save();
};

// Verify device
DeviceSessionSchema.methods.verifyDevice = function() {
  this.isTrusted = true;
  this.isFirstTime = false;
  this.requiresVerification = false;
  this.verifiedAt = new Date();
  return this.save();
};

/**
 * Login History Schema
 * Tracks all login attempts (successful and failed)
 * Schema theo dõi tất cả lần đăng nhập (thành công và thất bại)
 */
const LoginHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  
  // Login Status
  status: {
    type: String,
    enum: ['success', 'failed', 'blocked'],
    required: true,
    index: true
  },
  failureReason: String,
  
  // Device & Location
  deviceInfo: {
    deviceId: String,
    deviceName: String,
    deviceType: String,
    os: {
      name: String,
      version: String
    },
    browser: {
      name: String,
      version: String
    }
  },
  location: {
    ip: {
      type: String,
      required: true
    },
    country: String,
    city: String,
    timezone: String
  },
  
  // Security
  isSuspicious: {
    type: Boolean,
    default: false
  },
  suspiciousReasons: [String],
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Metadata
  userAgent: String,
  loginMethod: {
    type: String,
    enum: ['password', 'google', 'facebook', 'apple', '2fa'],
    default: 'password'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
LoginHistorySchema.index({ user: 1, timestamp: -1 });
LoginHistorySchema.index({ email: 1, status: 1, timestamp: -1 });
LoginHistorySchema.index({ 'location.ip': 1, timestamp: -1 });

/**
 * Trusted Device Schema
 * Stores verified trusted devices
 * Schema lưu trữ các thiết bị đáng tin cậy đã xác minh
 */
const TrustedDeviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  deviceInfo: {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    deviceName: String,
    deviceType: String,
    os: {
      name: String,
      version: String
    },
    browser: {
      name: String,
      version: String
    },
    fingerprint: String
  },
  
  // Trust Information
  trustedAt: {
    type: Date,
    default: Date.now
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  },
  trustLevel: {
    type: String,
    enum: ['full', 'partial', 'revoked'],
    default: 'full'
  },
  
  // Usage Stats
  loginCount: {
    type: Number,
    default: 1
  },
  lastLoginIp: String,
  lastLoginLocation: String,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  revokedAt: Date,
  revokeReason: String,
  
  // Metadata
  notes: String
}, {
  timestamps: true
});

// Indexes
TrustedDeviceSchema.index({ user: 1, 'deviceInfo.deviceId': 1 });
TrustedDeviceSchema.index({ user: 1, isActive: 1 });

// Update last used
TrustedDeviceSchema.methods.updateLastUsed = function(ip = '', location = '') {
  this.lastUsedAt = new Date();
  this.loginCount += 1;
  if (ip) this.lastLoginIp = ip;
  if (location) this.lastLoginLocation = location;
  return this.save();
};

// Revoke trust
TrustedDeviceSchema.methods.revokeTrust = function(reason = '') {
  this.trustLevel = 'revoked';
  this.isActive = false;
  this.revokedAt = new Date();
  this.revokeReason = reason;
  return this.save();
};

const DeviceSession = mongoose.model('DeviceSession', DeviceSessionSchema);
const LoginHistory = mongoose.model('LoginHistory', LoginHistorySchema);
const TrustedDevice = mongoose.model('TrustedDevice', TrustedDeviceSchema);

module.exports = {
  DeviceSession,
  LoginHistory,
  TrustedDevice
};
