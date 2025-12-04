const { DeviceSession, LoginHistory, TrustedDevice } = require('../models/DeviceSession');
const crypto = require('crypto');
const UAParser = require('ua-parser-js');

/**
 * Parse user agent to extract device information
 * Phân tích user agent để trích xuất thông tin thiết bị
 */
const parseUserAgent = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    deviceName: `${result.browser.name || 'Unknown'} on ${result.os.name || 'Unknown'}`,
    deviceType: result.device.type || 'desktop',
    os: {
      name: result.os.name || 'Unknown',
      version: result.os.version || ''
    },
    browser: {
      name: result.browser.name || 'Unknown',
      version: result.browser.version || ''
    }
  };
};

/**
 * Generate device fingerprint
 * Tạo dấu vân tay thiết bị
 */
const generateDeviceFingerprint = (req) => {
  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    req.ip || ''
  ];
  
  return crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex');
};

/**
 * Generate unique device ID
 * Tạo ID thiết bị duy nhất
 */
const generateDeviceId = (userId, fingerprint) => {
  return crypto
    .createHash('md5')
    .update(`${userId}${fingerprint}${Date.now()}`)
    .digest('hex');
};

/**
 * Detect suspicious activity based on various factors
 * Phát hiện hoạt động đáng ngờ dựa trên nhiều yếu tố
 */
const detectSuspiciousActivity = async (userId, currentSession, allSessions) => {
  const suspiciousReasons = [];
  let riskLevel = 'low';
  let riskScore = 0;
  
  try {
    // Check 1: Multiple active sessions from different locations
    const activeSessions = allSessions.filter(s => s.status === 'active' && s._id.toString() !== currentSession._id.toString());
    
    if (activeSessions.length > 5) {
      suspiciousReasons.push('Too many active sessions');
      riskScore += 20;
    }
    
    // Check 2: Different country login within short time
    const recentSessions = allSessions.filter(s => {
      const timeDiff = (new Date() - new Date(s.createdAt)) / (1000 * 60); // minutes
      return timeDiff < 30;
    });
    
    const countries = [...new Set(recentSessions.map(s => s.location.country).filter(Boolean))];
    if (countries.length > 2) {
      suspiciousReasons.push('Multiple countries in short time');
      riskScore += 30;
      riskLevel = 'high';
    }
    
    // Check 3: Unknown device from unknown location
    const trustedDevice = await TrustedDevice.findOne({
      user: userId,
      'deviceInfo.fingerprint': currentSession.deviceInfo.fingerprint,
      isActive: true
    });
    
    if (!trustedDevice && currentSession.isFirstTime) {
      suspiciousReasons.push('New device from new location');
      riskScore += 15;
    }
    
    // Check 4: Unusual login time (2 AM - 5 AM)
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 5) {
      suspiciousReasons.push('Unusual login time');
      riskScore += 10;
    }
    
    // Check 5: Rapid session creation
    const last10MinSessions = allSessions.filter(s => {
      const timeDiff = (new Date() - new Date(s.createdAt)) / (1000 * 60);
      return timeDiff < 10;
    });
    
    if (last10MinSessions.length > 3) {
      suspiciousReasons.push('Rapid session creation');
      riskScore += 25;
      riskLevel = 'critical';
    }
    
    // Check 6: VPN or proxy detection (simplified)
    const suspiciousIPs = ['10.', '172.', '192.168.']; // Private IPs
    if (suspiciousIPs.some(prefix => currentSession.location.ip.startsWith(prefix))) {
      suspiciousReasons.push('Possible VPN/Proxy usage');
      riskScore += 10;
    }
    
    // Determine risk level based on score
    if (riskScore >= 50) {
      riskLevel = 'critical';
    } else if (riskScore >= 30) {
      riskLevel = 'high';
    } else if (riskScore >= 15) {
      riskLevel = 'medium';
    }
    
    return {
      isSuspicious: riskScore > 0,
      reasons: suspiciousReasons,
      riskLevel,
      riskScore
    };
    
  } catch (error) {
    console.error('Detect suspicious activity error:', error);
    return {
      isSuspicious: false,
      reasons: [],
      riskLevel: 'low',
      riskScore: 0
    };
  }
};

/**
 * Create new device session
 * Tạo phiên thiết bị mới
 */
const createDeviceSession = async (userId, jwtToken, req, expiresInDays = 30) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    
    // Parse device info
    const deviceInfo = parseUserAgent(userAgent);
    const fingerprint = generateDeviceFingerprint(req);
    const deviceId = generateDeviceId(userId, fingerprint);
    
    // Generate session token
    const sessionToken = DeviceSession.generateSessionToken();
    
    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    
    // Create session
    const session = new DeviceSession({
      user: userId,
      deviceInfo: {
        deviceId,
        ...deviceInfo,
        fingerprint
      },
      location: {
        ip,
        // Note: In production, use a geolocation service like MaxMind or IP-API
        country: 'Vietnam', // Placeholder
        city: 'Ho Chi Minh City', // Placeholder
        timezone: 'Asia/Ho_Chi_Minh'
      },
      sessionToken,
      jwtToken,
      status: 'active',
      expiresAt,
      userAgent,
      metadata: {
        loginMethod: req.body?.loginMethod || 'password'
      }
    });
    
    // Check if device is trusted
    const trustedDevice = await TrustedDevice.findOne({
      user: userId,
      'deviceInfo.fingerprint': fingerprint,
      isActive: true
    });
    
    if (trustedDevice) {
      session.isTrusted = true;
      session.isFirstTime = false;
      await trustedDevice.updateLastUsed(ip, session.location.city);
    } else {
      session.requiresVerification = true;
    }
    
    await session.save();
    
    // Check for suspicious activity
    const allUserSessions = await DeviceSession.find({ 
      user: userId,
      status: { $in: ['active', 'suspicious'] }
    }).sort({ createdAt: -1 });
    
    const suspiciousCheck = await detectSuspiciousActivity(userId, session, allUserSessions);
    
    if (suspiciousCheck.isSuspicious && suspiciousCheck.riskLevel !== 'low') {
      await session.markAsSuspicious(suspiciousCheck.reasons, suspiciousCheck.riskLevel);
    }
    
    // Log login history
    await LoginHistory.create({
      user: userId,
      email: req.body?.email || '',
      status: 'success',
      deviceInfo: session.deviceInfo,
      location: session.location,
      userAgent,
      loginMethod: session.metadata.loginMethod,
      isSuspicious: suspiciousCheck.isSuspicious,
      suspiciousReasons: suspiciousCheck.reasons,
      riskScore: suspiciousCheck.riskScore
    });
    
    return session;
    
  } catch (error) {
    console.error('Create device session error:', error);
    throw error;
  }
};

/**
 * Get all active sessions for a user
 * Lấy tất cả phiên hoạt động của người dùng
 */
const getUserSessions = async (userId, includeExpired = false) => {
  try {
    const query = { user: userId };
    
    if (!includeExpired) {
      query.status = { $in: ['active', 'suspicious'] };
      query.expiresAt = { $gt: new Date() };
    }
    
    const sessions = await DeviceSession.find(query)
      .sort({ lastActivityAt: -1 })
      .select('-jwtToken -refreshToken') // Don't expose tokens
      .lean();
    
    return sessions;
    
  } catch (error) {
    console.error('Get user sessions error:', error);
    throw error;
  }
};

/**
 * Get current session by token
 * Lấy phiên hiện tại theo token
 */
const getSessionByToken = async (sessionToken) => {
  try {
    const session = await DeviceSession.findOne({ 
      sessionToken,
      status: 'active',
      expiresAt: { $gt: new Date() }
    });
    
    return session;
    
  } catch (error) {
    console.error('Get session by token error:', error);
    throw error;
  }
};

/**
 * Update session activity
 * Cập nhật hoạt động phiên
 */
const updateSessionActivity = async (sessionId, action = 'activity', ip = '') => {
  try {
    const session = await DeviceSession.findById(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    await session.updateActivity(action, ip);
    return session;
    
  } catch (error) {
    console.error('Update session activity error:', error);
    throw error;
  }
};

/**
 * Revoke a specific session (remote logout)
 * Thu hồi một phiên cụ thể (đăng xuất từ xa)
 */
const revokeSession = async (userId, sessionId, reason = 'Manual revocation by user') => {
  try {
     (`[DEBUG] Revoking session: ${sessionId} for user: ${userId}`);
    
    // First, check if session exists (without user filter for debugging)
    const sessionExists = await DeviceSession.findById(sessionId);
    
    if (!sessionExists) {
      console.error(`[ERROR] Session ${sessionId} does not exist in database`);
      throw new Error(`Session not found with ID: ${sessionId}`);
    }
    
     (`[DEBUG] Session found: ${sessionExists._id}, belongs to user: ${sessionExists.user}`);
    
    // Check if session belongs to the user
    if (sessionExists.user.toString() !== userId.toString()) {
      console.error(`[ERROR] Session ${sessionId} belongs to user ${sessionExists.user}, not ${userId}`);
      throw new Error('Session does not belong to this user');
    }
    
    // Check if already revoked
    if (sessionExists.status === 'revoked') {
      console.warn(`[WARN] Session ${sessionId} is already revoked`);
      return sessionExists; // Return existing revoked session
    }
    
    // Revoke the session
    await sessionExists.revoke(reason);
     (`[SUCCESS] Session ${sessionId} revoked successfully`);
    
    return sessionExists;
    
  } catch (error) {
    console.error('Revoke session error:', error);
    throw error;
  }
};

/**
 * Revoke all sessions except current
 * Thu hồi tất cả phiên trừ phiên hiện tại
 */
const revokeAllSessionsExceptCurrent = async (userId, currentSessionId) => {
  try {
    const sessions = await DeviceSession.find({
      user: userId,
      _id: { $ne: currentSessionId },
      status: { $in: ['active', 'suspicious'] }
    });
    
    const revokePromises = sessions.map(session => 
      session.revoke('Revoked by user - Logout all devices')
    );
    
    await Promise.all(revokePromises);
    
    return { revokedCount: sessions.length };
    
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    throw error;
  }
};

/**
 * Revoke all sessions (complete logout)
 * Thu hồi tất cả phiên (đăng xuất hoàn toàn)
 */
const revokeAllSessions = async (userId, reason = 'User initiated logout from all devices') => {
  try {
    const sessions = await DeviceSession.find({
      user: userId,
      status: { $in: ['active', 'suspicious'] }
    });
    
    const revokePromises = sessions.map(session => session.revoke(reason));
    await Promise.all(revokePromises);
    
    return { revokedCount: sessions.length };
    
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    throw error;
  }
};

/**
 * Verify and trust a device
 * Xác minh và tin tưởng thiết bị
 */
const verifyDevice = async (userId, sessionId, verificationCode = '') => {
  try {
    const session = await DeviceSession.findOne({
      _id: sessionId,
      user: userId
    });
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    // In production, verify the code sent via email/SMS
    // For now, just mark as verified
    
    await session.verifyDevice();
    
    // Add to trusted devices
    const existingTrusted = await TrustedDevice.findOne({
      user: userId,
      'deviceInfo.fingerprint': session.deviceInfo.fingerprint
    });
    
    if (!existingTrusted) {
      await TrustedDevice.create({
        user: userId,
        deviceInfo: session.deviceInfo,
        lastLoginIp: session.location.ip,
        lastLoginLocation: session.location.city
      });
    } else if (!existingTrusted.isActive) {
      existingTrusted.isActive = true;
      existingTrusted.trustLevel = 'full';
      existingTrusted.revokedAt = null;
      existingTrusted.revokeReason = null;
      await existingTrusted.save();
    }
    
    return session;
    
  } catch (error) {
    console.error('Verify device error:', error);
    throw error;
  }
};

/**
 * Get trusted devices
 * Lấy danh sách thiết bị đáng tin cậy
 */
const getTrustedDevices = async (userId) => {
  try {
    const devices = await TrustedDevice.find({
      user: userId,
      isActive: true
    }).sort({ lastUsedAt: -1 });
    
    return devices;
    
  } catch (error) {
    console.error('Get trusted devices error:', error);
    throw error;
  }
};

/**
 * Revoke trust for a device
 * Thu hồi lòng tin cho thiết bị
 */
const revokeTrustedDevice = async (userId, deviceId, reason = '') => {
  try {
    const device = await TrustedDevice.findOne({
      _id: deviceId,
      user: userId
    });
    
    if (!device) {
      throw new Error('Trusted device not found');
    }
    
    await device.revokeTrust(reason);
    
    // Also revoke all active sessions from this device
    const sessions = await DeviceSession.find({
      user: userId,
      'deviceInfo.fingerprint': device.deviceInfo.fingerprint,
      status: 'active'
    });
    
    const revokePromises = sessions.map(s => s.revoke(`Device trust revoked: ${reason}`));
    await Promise.all(revokePromises);
    
    return device;
    
  } catch (error) {
    console.error('Revoke trusted device error:', error);
    throw error;
  }
};

/**
 * Get login history
 * Lấy lịch sử đăng nhập
 */
const getLoginHistory = async (userId, limit = 50, filters = {}) => {
  try {
    const query = { user: userId };
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.isSuspicious !== undefined) {
      query.isSuspicious = filters.isSuspicious;
    }
    
    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
    }
    
    const history = await LoginHistory.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return history;
    
  } catch (error) {
    console.error('Get login history error:', error);
    throw error;
  }
};

/**
 * Get suspicious sessions
 * Lấy các phiên đáng ngờ
 */
const getSuspiciousSessions = async (userId) => {
  try {
    const sessions = await DeviceSession.find({
      user: userId,
      'suspiciousActivity.isSuspicious': true,
      status: { $in: ['active', 'suspicious'] }
    }).sort({ 'suspiciousActivity.detectedAt': -1 });
    
    return sessions;
    
  } catch (error) {
    console.error('Get suspicious sessions error:', error);
    throw error;
  }
};

/**
 * Clean up expired sessions
 * Dọn dẹp các phiên hết hạn
 */
const cleanupExpiredSessions = async () => {
  try {
    const result = await DeviceSession.updateMany(
      {
        expiresAt: { $lt: new Date() },
        status: 'active'
      },
      {
        $set: { status: 'expired' }
      }
    );
    
    return { expiredCount: result.modifiedCount };
    
  } catch (error) {
    console.error('Cleanup expired sessions error:', error);
    throw error;
  }
};

/**
 * Get session statistics
 * Lấy thống kê phiên
 */
const getSessionStatistics = async (userId) => {
  try {
    const [activeSessions, suspiciousSessions, trustedDevices, recentLogins] = await Promise.all([
      DeviceSession.countDocuments({
        user: userId,
        status: 'active',
        expiresAt: { $gt: new Date() }
      }),
      DeviceSession.countDocuments({
        user: userId,
        'suspiciousActivity.isSuspicious': true,
        status: { $in: ['active', 'suspicious'] }
      }),
      TrustedDevice.countDocuments({
        user: userId,
        isActive: true
      }),
      LoginHistory.countDocuments({
        user: userId,
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      })
    ]);
    
    return {
      activeSessions,
      suspiciousSessions,
      trustedDevices,
      recentLogins
    };
    
  } catch (error) {
    console.error('Get session statistics error:', error);
    throw error;
  }
};

module.exports = {
  createDeviceSession,
  getUserSessions,
  getSessionByToken,
  updateSessionActivity,
  revokeSession,
  revokeAllSessionsExceptCurrent,
  revokeAllSessions,
  verifyDevice,
  getTrustedDevices,
  revokeTrustedDevice,
  getLoginHistory,
  getSuspiciousSessions,
  cleanupExpiredSessions,
  getSessionStatistics,
  detectSuspiciousActivity,
  parseUserAgent,
  generateDeviceFingerprint
};
