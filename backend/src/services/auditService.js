const AuditLog = require('../models/AuditLog');

/**
 * Ghi log audit
 * @param {Object} params
 * @param {String} params.userId - ID của user
 * @param {String} params.action - Hành động (enum trong AuditLog model)
 * @param {String} params.status - SUCCESS | FAILED | PENDING
 * @param {String} params.ipAddress - IP address của request
 * @param {String} params.userAgent - User agent của browser
 * @param {Object} params.details - Chi tiết bổ sung
 * @param {String} params.errorMessage - Thông báo lỗi nếu có
 */
const logAudit = async ({
  userId,
  action,
  status = 'SUCCESS',
  ipAddress = null,
  userAgent = null,
  details = null,
  errorMessage = null
}) => {
  try {
    const auditLog = new AuditLog({
      userId,
      action,
      status,
      ipAddress,
      userAgent,
      details,
      errorMessage
    });

    await auditLog.save();
    
    const statusIcon = status === 'SUCCESS' ? '✅' : status === 'FAILED' ? '❌' : '⏳';
     (`📝 Audit Log: ${statusIcon} ${action} - User: ${userId}`);
    
    return auditLog;
  } catch (error) {
    // Không throw error để không ảnh hưởng đến flow chính
    console.error('Lỗi ghi audit log:', error);
    return null;
  }
};

/**
 * Helper để lấy IP address từ request
 */
const getIpAddress = (req) => {
  return req.ip 
    || req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.connection?.remoteAddress 
    || req.socket?.remoteAddress 
    || 'unknown';
};

/**
 * Helper để lấy User Agent từ request
 */
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

/**
 * Helper để parse User Agent (Optional - cần cài thêm ua-parser-js)
 */
const parseUserAgent = (userAgent) => {
  try {
    // Nếu muốn parse chi tiết, cài: npm install ua-parser-js
    // const UAParser = require('ua-parser-js');
    // const parser = new UAParser(userAgent);
    // return parser.getResult();
    
    // Hiện tại chỉ return raw
    return userAgent;
  } catch (error) {
    return userAgent;
  }
};

module.exports = {
  logAudit,
  getIpAddress,
  getUserAgent,
  parseUserAgent
};