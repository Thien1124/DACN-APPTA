const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const User = require('../models/User');
const crypto = require('crypto');
const { logAudit, getIpAddress, getUserAgent } = require('../services/auditService');

/**
 * API Setup 2FA
 * POST /api/2fa/setup
 * Query: ?force=true (optional - để reset setup)
 * 
 * Tạo secret key và QR code để quét bằng Google Authenticator
 */
const setup2FA = async (req, res) => {
  try {
    const user = req.user;
    const { force } = req.query;

    // Kiểm tra đã enable 2FA chưa
    if (user.twoFactorAuth && user.twoFactorAuth.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA đã được kích hoạt. Vui lòng tắt trước khi thiết lập lại.',
        hint: 'Sử dụng API /api/2fa/disable để tắt 2FA trước.'
      });
    }

    // Kiểm tra đã setup rồi nhưng chưa enable (và không có force=true)
    if (user.twoFactorAuth && user.twoFactorAuth.secret && force !== 'true') {
      return res.status(409).json({
        success: false,
        message: '2FA đã được thiết lập trước đó nhưng chưa kích hoạt.',
        hint: 'Nếu bạn muốn thiết lập lại, vui lòng gọi API với ?force=true',
        warning: [
          '⚠️ Thiết lập lại sẽ VÔ HIỆU HÓA secret và QR code cũ',
          '⚠️ Backup codes cũ sẽ KHÔNG còn sử dụng được',
          '⚠️ Vui lòng XÓA 2FA cũ trong Google Authenticator trước khi setup lại'
        ],
        actions: {
          continueSetup: 'POST /api/2fa/setup?force=true',
          enableExisting: 'POST /api/2fa/enable (với mã từ QR code cũ)'
        }
      });
    }

    // Nếu có force=true, log warning
    if (force === 'true' && user.twoFactorAuth && user.twoFactorAuth.secret) {
      console.log(`⚠️ FORCE RESET: User ${user.email} đang thiết lập lại 2FA`);
    }

    // Tạo secret key cho TOTP
    const secret = speakeasy.generateSecret({
      name: `English Master (${user.email})`,
      issuer: 'English Master',
      length: 20
    });

    // Tạo 10 backup codes (mỗi code 8 ký tự)
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      backupCodes.push(code);
    }

    // Hash backup codes trước khi lưu vào database
    const hashedBackupCodes = backupCodes.map(code => 
      crypto.createHash('sha256').update(code).digest('hex')
    );

    // Lưu secret và backup codes (chưa enable)
    user.twoFactorAuth = {
      enabled: false,
      secret: secret.base32,
      backupCodes: hashedBackupCodes
    };
    user.updatedAt = Date.now();
    await user.save();

    // Tạo QR code
    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    // ✅ Ghi audit log
    await logAudit({
      userId: user._id,
      action: 'SETUP_2FA',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: {
        hasSecret: true,
        backupCodesCount: 10,
        forceReset: force === 'true'
      }
    });

    console.log(`✅ User ${user.email} đã setup 2FA (chưa kích hoạt)`);

    res.json({
      success: true,
      message: 'Thiết lập 2FA thành công. Vui lòng quét QR code và xác thực.',
      data: {
        qrCode: qrCodeDataUrl,
        secret: secret.base32,
        backupCodes: backupCodes,
        instructions: [
          '1. Tải ứng dụng Google Authenticator (iOS/Android)',
          '2. Mở app → Nhấn "+" → Chọn "Quét mã QR"',
          '3. Quét QR code bên dưới (hoặc nhập secret thủ công)',
          '4. App sẽ hiển thị mã 6 số (đổi mỗi 30 giây)',
          '5. Nhập mã 6 số vào API POST /api/2fa/enable để kích hoạt',
          '6. ⚠️ LƯU CÁC BACKUP CODES Ở NƠI AN TOÀN (dùng khi mất điện thoại)'
        ],
        nextStep: {
          endpoint: 'POST /api/2fa/enable',
          body: {
            token: '123456 (mã từ Google Authenticator)'
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Lỗi setup 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi thiết lập 2FA',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * API Enable 2FA
 * POST /api/2fa/enable
 * Body: { token }
 * 
 * Xác thực mã 6 số lần đầu và kích hoạt 2FA
 */
const enable2FA = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã xác thực',
        example: {
          token: '123456'
        }
      });
    }

    // Validate token format (6 chữ số)
    if (!/^\d{6}$/.test(token)) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực phải là 6 chữ số'
      });
    }

    const user = await User.findById(req.user._id).select('+twoFactorAuth.secret');

    if (!user.twoFactorAuth || !user.twoFactorAuth.secret) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng setup 2FA trước khi kích hoạt',
        hint: 'Gọi API POST /api/2fa/setup để thiết lập'
      });
    }

    if (user.twoFactorAuth.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA đã được kích hoạt rồi'
      });
    }

    // Verify token từ Google Authenticator
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      // ✅ Ghi audit log - Failed enable
      await logAudit({
        userId: user._id,
        action: 'ENABLE_2FA',
        status: 'FAILED',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        errorMessage: 'Mã xác thực không đúng hoặc đã hết hạn'
      });

      return res.status(400).json({
        success: false,
        message: 'Mã xác thực không đúng hoặc đã hết hạn',
        hint: 'Mã xác thực thay đổi mỗi 30 giây. Vui lòng thử lại với mã mới từ Google Authenticator.'
      });
    }

    // Enable 2FA
    user.twoFactorAuth.enabled = true;
    user.updatedAt = Date.now();
    await user.save();

    // ✅ Ghi audit log - Successful enable
    await logAudit({
      userId: user._id,
      action: 'ENABLE_2FA',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    console.log(`✅ User ${user.email} đã kích hoạt 2FA thành công`);

    res.json({
      success: true,
      message: '2FA đã được kích hoạt thành công!',
      data: {
        enabled: true,
        message: 'Từ giờ bạn cần mã xác thực từ Google Authenticator khi đăng nhập.',
        nextLogin: {
          step1: 'POST /api/auth/login (email + password)',
          step2: 'POST /api/2fa/verify (token hoặc backupCode)'
        }
      }
    });
  } catch (error) {
    console.error('❌ Lỗi enable 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi kích hoạt 2FA'
    });
  }
};

/**
 * API Verify 2FA
 * POST /api/2fa/verify
 * Body: { token } hoặc { backupCode }
 * 
 * Xác thực mã khi đăng nhập
 */
const verify2FA = async (req, res) => {
  try {
    const { token, backupCode } = req.body;

    if (!token && !backupCode) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mã xác thực hoặc backup code',
        example: {
          option1: { token: '123456' },
          option2: { backupCode: 'A1B2C3D4' }
        }
      });
    }

    const user = await User.findById(req.user._id)
      .select('+twoFactorAuth.secret +twoFactorAuth.backupCodes');

    if (!user.twoFactorAuth || !user.twoFactorAuth.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA chưa được kích hoạt'
      });
    }

    let verified = false;
    let usedBackupCode = false;

    // Verify bằng TOTP token (từ Google Authenticator)
    if (token) {
      // Validate token format
      if (!/^\d{6}$/.test(token)) {
        return res.status(400).json({
          success: false,
          message: 'Mã xác thực phải là 6 chữ số'
        });
      }

      verified = speakeasy.totp.verify({
        secret: user.twoFactorAuth.secret,
        encoding: 'base32',
        token: token,
        window: 2
      });
    }

    // Verify bằng backup code (nếu token không đúng)
    if (!verified && backupCode) {
      const hashedCode = crypto.createHash('sha256').update(backupCode.toUpperCase()).digest('hex');
      const codeIndex = user.twoFactorAuth.backupCodes.indexOf(hashedCode);

      if (codeIndex !== -1) {
        verified = true;
        usedBackupCode = true;
        
        // Xóa backup code đã sử dụng (chỉ dùng được 1 lần)
        user.twoFactorAuth.backupCodes.splice(codeIndex, 1);
        await user.save();
        
        console.log(`⚠️ User ${user.email} đã sử dụng backup code (còn ${user.twoFactorAuth.backupCodes.length}/10 codes)`);
      }
    }

    if (!verified) {
      // ✅ Ghi audit log - Failed verification
      await logAudit({
        userId: user._id,
        action: usedBackupCode ? 'USE_BACKUP_CODE' : 'VERIFY_2FA',
        status: 'FAILED',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        errorMessage: 'Mã xác thực hoặc backup code không đúng'
      });

      return res.status(400).json({
        success: false,
        message: 'Mã xác thực hoặc backup code không đúng',
        hint: token 
          ? 'Mã xác thực thay đổi mỗi 30 giây. Vui lòng thử lại với mã mới.'
          : 'Backup code không đúng hoặc đã được sử dụng.'
      });
    }

    const remainingCodes = user.twoFactorAuth.backupCodes.length;

    // ✅ Ghi audit log - Successful verification
    await logAudit({
      userId: user._id,
      action: usedBackupCode ? 'USE_BACKUP_CODE' : 'VERIFY_2FA',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: {
        usedBackupCode: usedBackupCode,
        backupCodesRemaining: remainingCodes
      }
    });

    res.json({
      success: true,
      message: 'Xác thực 2FA thành công',
      data: {
        verified: true,
        usedBackupCode: usedBackupCode,
        backupCodesRemaining: remainingCodes,
        warning: remainingCodes <= 3 && remainingCodes > 0
          ? `⚠️ Bạn chỉ còn ${remainingCodes} backup codes. Nên tắt và thiết lập lại 2FA để tạo backup codes mới.`
          : remainingCodes === 0
          ? '⚠️ Bạn đã hết backup codes! Vui lòng tắt và thiết lập lại 2FA để tạo backup codes mới.'
          : null
      }
    });
  } catch (error) {
    console.error('❌ Lỗi verify 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xác thực 2FA'
    });
  }
};

/**
 * API Disable 2FA
 * POST /api/2fa/disable
 * Body: { password, token }
 * 
 * Tắt 2FA (cần password + mã xác thực)
 */
const disable2FA = async (req, res) => {
  try {
    const { password, token } = req.body;

    if (!password || !token) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mật khẩu và mã xác thực',
        example: {
          password: 'yourpassword',
          token: '123456'
        }
      });
    }

    // Validate token format
    if (!/^\d{6}$/.test(token)) {
      return res.status(400).json({
        success: false,
        message: 'Mã xác thực phải là 6 chữ số'
      });
    }

    const user = await User.findById(req.user._id)
      .select('+password +twoFactorAuth.secret');

    if (!user.twoFactorAuth || !user.twoFactorAuth.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA chưa được kích hoạt'
      });
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      // ✅ Ghi audit log - Wrong password
      await logAudit({
        userId: user._id,
        action: 'DISABLE_2FA',
        status: 'FAILED',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        errorMessage: 'Mật khẩu không đúng'
      });

      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không đúng'
      });
    }

    // Verify 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorAuth.secret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      // ✅ Ghi audit log - Wrong 2FA token
      await logAudit({
        userId: user._id,
        action: 'DISABLE_2FA',
        status: 'FAILED',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        errorMessage: 'Mã xác thực không đúng'
      });

      return res.status(400).json({
        success: false,
        message: 'Mã xác thực không đúng'
      });
    }

    // Disable 2FA
    user.twoFactorAuth = {
      enabled: false,
      secret: null,
      backupCodes: []
    };
    user.updatedAt = Date.now();
    await user.save();

    // ✅ Ghi audit log - Successful disable
    await logAudit({
      userId: user._id,
      action: 'DISABLE_2FA',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req)
    });

    console.log(`✅ User ${user.email} đã tắt 2FA`);

    res.json({
      success: true,
      message: '2FA đã được tắt thành công',
      data: {
        enabled: false,
        message: 'Bạn có thể thiết lập lại 2FA bất kỳ lúc nào bằng API POST /api/2fa/setup'
      }
    });
  } catch (error) {
    console.error('❌ Lỗi disable 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tắt 2FA'
    });
  }
};

/**
 * API Get 2FA Status
 * GET /api/2fa/status
 * 
 * Lấy trạng thái 2FA của user
 */
const get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('twoFactorAuth.enabled twoFactorAuth.secret twoFactorAuth.backupCodes');

    const hasSecret = user.twoFactorAuth && user.twoFactorAuth.secret ? true : false;
    const enabled = user.twoFactorAuth ? user.twoFactorAuth.enabled : false;
    const backupCodesCount = user.twoFactorAuth && user.twoFactorAuth.backupCodes 
      ? user.twoFactorAuth.backupCodes.length 
      : 0;

    // Trạng thái
    let status = 'not_setup';
    if (hasSecret && !enabled) {
      status = 'setup_pending';
    } else if (enabled) {
      status = 'enabled';
    }

    res.json({
      success: true,
      data: {
        status: status,
        enabled: enabled,
        backupCodesRemaining: backupCodesCount,
        statusDescription: {
          not_setup: 'Chưa thiết lập 2FA',
          setup_pending: 'Đã thiết lập nhưng chưa kích hoạt',
          enabled: '2FA đã kích hoạt'
        }[status],
        actions: status === 'not_setup' 
          ? { setup: 'POST /api/2fa/setup' }
          : status === 'setup_pending'
          ? { 
              enable: 'POST /api/2fa/enable',
              resetSetup: 'POST /api/2fa/setup?force=true'
            }
          : {
              verify: 'POST /api/2fa/verify',
              disable: 'POST /api/2fa/disable'
            }
      }
    });
  } catch (error) {
    console.error('❌ Lỗi get 2FA status:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy trạng thái 2FA'
    });
  }
};

module.exports = {
  setup2FA,
  enable2FA,
  verify2FA,
  disable2FA,
  get2FAStatus
};