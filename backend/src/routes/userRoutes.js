const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

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
 * Body: { name?, age? }
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, age } = req.body;
    const user = req.user;

    // Cập nhật name
    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Tên phải có ít nhất 2 ký tự'
        });
      }
      user.name = name.trim();
    }

    // Cập nhật age
    if (age !== undefined) {
      const ageNumber = Number(age);
      if (isNaN(ageNumber) || ageNumber < 0 || ageNumber > 120) {
        return res.status(400).json({
          success: false,
          message: 'Tuổi phải từ 0 đến 120'
        });
      }
      user.age = ageNumber;
    }

    user.updatedAt = Date.now();
    await user.save();

    console.log(`User ${user.email} đã cập nhật profile`);

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
    console.error('Lỗi cập nhật profile:', error);
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

    console.log(`User ${user.email} đã upload avatar: ${user.avatar}`);

    res.json({
      success: true,
      message: 'Upload avatar thành công',
      data: {
        avatar: user.avatar,
        avatarUrl: `${req.protocol}://${req.get('host')}${user.avatar}`
      }
    });
  } catch (error) {
    console.error('Lỗi upload avatar:', error);

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

    console.log(`User ${user.email} đã xóa avatar`);

    res.json({
      success: true,
      message: 'Xóa avatar thành công'
    });
  } catch (error) {
    console.error('Lỗi xóa avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa avatar'
    });
  }
});

module.exports = router;