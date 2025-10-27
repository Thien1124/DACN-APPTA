const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const twoFactorController = require('../controllers/twoFactorController');

/**
 * GET /api/2fa/status
 * Lấy trạng thái 2FA của user
 */
router.get('/status', authenticate, twoFactorController.get2FAStatus);

/**
 * POST /api/2fa/setup
 * Thiết lập 2FA - Tạo QR code và backup codes
 */
router.post('/setup', authenticate, twoFactorController.setup2FA);

/**
 * POST /api/2fa/enable
 * Kích hoạt 2FA sau khi setup
 * Body: { token }
 */
router.post('/enable', authenticate, twoFactorController.enable2FA);

/**
 * POST /api/2fa/verify
 * Xác thực 2FA token (dùng khi đăng nhập)
 * Body: { token } hoặc { backupCode }
 */
router.post('/verify', authenticate, twoFactorController.verify2FA);

/**
 * POST /api/2fa/disable
 * Tắt 2FA
 * Body: { password, token }
 */
router.post('/disable', authenticate, twoFactorController.disable2FA);

module.exports = router;