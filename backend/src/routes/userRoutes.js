const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

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
 * Cập nhật thông tin profile
 * Yêu cầu: JWT token
 * Body: { name?, age?, avatar? }
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, age, avatar } = req.body;
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

    // Cập nhật avatar
    if (avatar !== undefined) {
      user.avatar = avatar.trim();
    }

    user.updatedAt = Date.now();
    await user.save();

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

module.exports = router;