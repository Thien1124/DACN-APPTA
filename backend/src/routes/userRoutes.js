const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { logAudit, getIpAddress, getUserAgent } = require('../services/auditService');

/**
 * GET /api/users/profile
 * Lấy thông tin profile của user hiện tại
 * Yêu cầu: JWT token
 */
router.get('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Thông tin profile',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        age: req.user.age,
        avatar: req.user.avatar,
        role: req.user.role,
        isActive: req.user.isActive,
        emailVerified: req.user.emailVerified,
        provider: req.user.provider,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    }
  });
});

/**
 * PUT /api/users/profile
 * Task 8: Cập nhật thông tin profile
 * Yêu cầu: JWT token
 * Body: { name?, age?, currentPassword?, newPassword? }
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, age, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    let changedFields = [];

    // Cập nhật name
    if (name !== undefined && name !== user.name) {
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Tên phải có ít nhất 2 ký tự'
        });
      }
      user.name = name.trim();
      changedFields.push('name');
    }

    // Cập nhật age
    if (age !== undefined && age !== user.age) {
      const ageNumber = Number(age);
      if (isNaN(ageNumber) || ageNumber < 0 || ageNumber > 120) {
        return res.status(400).json({
          success: false,
          message: 'Tuổi phải từ 0 đến 120'
        });
      }
      user.age = ageNumber;
      changedFields.push('age');
    }

    // Đổi mật khẩu
    if (currentPassword && newPassword) {
      const isPasswordValid = await user.comparePassword(currentPassword);
      
      if (!isPasswordValid) {
        // ✅ Ghi audit log - Failed password change
        await logAudit({
          userId: user._id,
          action: 'CHANGE_PASSWORD',
          status: 'FAILED',
          ipAddress: getIpAddress(req),
          userAgent: getUserAgent(req),
          errorMessage: 'Mật khẩu hiện tại không đúng'
        });

        return res.status(401).json({
          success: false,
          message: 'Mật khẩu hiện tại không đúng'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
        });
      }

      user.password = newPassword;
      changedFields.push('password');

      // ✅ Ghi audit log - Successful password change
      await logAudit({
        userId: user._id,
        action: 'CHANGE_PASSWORD',
        status: 'SUCCESS',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req)
      });

      console.log(`✅ User ${user.email} đã đổi mật khẩu thành công`);
    }

    user.updatedAt = Date.now();
    await user.save();

    // ✅ Ghi audit log - Profile update (nếu có thay đổi không phải password)
    if (changedFields.length > 0 && !changedFields.includes('password')) {
      await logAudit({
        userId: user._id,
        action: 'UPDATE_PROFILE',
        status: 'SUCCESS',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        details: {
          changedFields: changedFields
        }
      });

      console.log(`✅ User ${user.email} đã cập nhật profile: ${changedFields.join(', ')}`);
    }

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          avatar: user.avatar,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('❌ Lỗi cập nhật profile:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật profile'
    });
  }
});

/**
 * POST /api/users/avatar
 * Task 9: Upload và cập nhật avatar
 * Yêu cầu: JWT token
 * Form-data: avatar (file)
 */
router.post('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh để upload'
      });
    }

    const user = req.user;

    // Xóa avatar cũ nếu có (chỉ xóa local file, không xóa URL OAuth)
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const oldAvatarPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
        console.log('Đã xóa avatar cũ:', oldAvatarPath);
      }
    }

    // Cập nhật avatar mới
    user.avatar = `/uploads/avatars/${req.file.filename}`;
    user.updatedAt = Date.now();
    await user.save();

    // ✅ Ghi audit log
    await logAudit({
      userId: user._id,
      action: 'UPLOAD_AVATAR',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: user.avatar
      }
    });

    console.log(`✅ User ${user.email} đã upload avatar: ${user.avatar}`);

    res.json({
      success: true,
      message: 'Upload avatar thành công',
      data: {
        avatar: user.avatar,
        avatarUrl: `${req.protocol}://${req.get('host')}${user.avatar}`
      }
    });
  } catch (error) {
    console.error('❌ Lỗi upload avatar:', error);

    // ✅ Ghi audit log - Failed upload
    if (req.user) {
      await logAudit({
        userId: req.user._id,
        action: 'UPLOAD_AVATAR',
        status: 'FAILED',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        errorMessage: error.message
      });
    }

    // Xóa file đã upload nếu có lỗi
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/avatars', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi upload avatar'
    });
  }
});

/**
 * DELETE /api/users/avatar
 * Xóa avatar
 * Yêu cầu: JWT token
 */
router.delete('/avatar', authenticate, async (req, res) => {
  try {
    const user = req.user;

    if (!user.avatar) {
      return res.status(400).json({
        success: false,
        message: 'Bạn chưa có avatar để xóa'
      });
    }

    const oldAvatar = user.avatar;

    // Xóa file avatar (chỉ xóa local file)
    if (user.avatar.startsWith('/uploads/')) {
      const avatarPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
        console.log('Đã xóa avatar:', avatarPath);
      }
    }

    // Xóa avatar trong database
    user.avatar = null;
    user.updatedAt = Date.now();
    await user.save();

    // ✅ Ghi audit log
    await logAudit({
      userId: user._id,
      action: 'DELETE_AVATAR',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: {
        deletedAvatar: oldAvatar
      }
    });

    console.log(`✅ User ${user.email} đã xóa avatar`);

    res.json({
      success: true,
      message: 'Xóa avatar thành công'
    });
  } catch (error) {
    console.error('❌ Lỗi xóa avatar:', error);

    // ✅ Ghi audit log - Failed
    await logAudit({
      userId: req.user._id,
      action: 'DELETE_AVATAR',
      status: 'FAILED',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      errorMessage: error.message
    });

    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa avatar'
    });
  }
});

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.role && req.query.role !== 'all') {
      query.role = req.query.role;
    }

    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách người dùng'
    });
  }
});

/**
 * PATCH /api/users/:id/toggle-active
 * Toggle user active status (admin only)
 */
router.patch('/:id/toggle-active', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const previousStatus = user.isActive;
    user.isActive = !user.isActive;
    await user.save();

    // ✅ Ghi audit log
    await logAudit({
      userId: req.user._id, // Admin user
      action: user.isActive ? 'ACCOUNT_UNLOCKED' : 'ACCOUNT_LOCKED',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: {
        targetUserId: user._id,
        targetUserEmail: user.email,
        previousStatus: previousStatus,
        newStatus: user.isActive,
        adminAction: true
      }
    });

    // ✅ Ghi log cho user bị thay đổi
    await logAudit({
      userId: user._id, // Target user
      action: user.isActive ? 'ACCOUNT_UNLOCKED' : 'ACCOUNT_LOCKED',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: {
        changedByAdmin: req.user.email,
        previousStatus: previousStatus,
        newStatus: user.isActive
      }
    });

    console.log(`✅ Admin ${req.user.email} đã ${user.isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản ${user.email}`);

    res.json({
      success: true,
      message: `Đã ${user.isActive ? 'kích hoạt' : 'vô hiệu hóa'} tài khoản`,
      data: user
    });
  } catch (error) {
    console.error('❌ Lỗi toggle active:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thay đổi trạng thái người dùng'
    });
  }
});

/**
 * PATCH /api/users/:id/change-role
 * Change user role (admin only)
 */
router.patch('/:id/change-role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role không hợp lệ'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    // ✅ Ghi audit log cho admin
    await logAudit({
      userId: req.user._id,
      action: 'ADMIN_UPDATE_USER',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: {
        action: 'change_role',
        targetUserId: user._id,
        targetUserEmail: user.email,
        previousRole: previousRole,
        newRole: role
      }
    });

    console.log(`✅ Admin ${req.user.email} đã đổi role của ${user.email} từ ${previousRole} → ${role}`);

    res.json({
      success: true,
      message: 'Đã thay đổi role người dùng',
      data: user
    });
  } catch (error) {
    console.error('❌ Lỗi change role:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể thay đổi role người dùng'
    });
  }
});

/**
 * DELETE /api/users/:id
 * Delete user (admin only)
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép admin xóa chính mình
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản của chính mình'
      });
    }

    const deletedUserInfo = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    // Xóa avatar file nếu có
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      const avatarPath = path.join(__dirname, '../../', user.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await user.deleteOne();

    // ✅ Ghi audit log
    await logAudit({
      userId: req.user._id,
      action: 'ADMIN_DELETE_USER',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: {
        deletedUser: deletedUserInfo
      }
    });

    console.log(`✅ Admin ${req.user.email} đã xóa user ${deletedUserInfo.email}`);

    res.json({
      success: true,
      message: 'Đã xóa người dùng'
    });
  } catch (error) {
    console.error('❌ Lỗi xóa user:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể xóa người dùng'
    });
  }
});

module.exports = router;