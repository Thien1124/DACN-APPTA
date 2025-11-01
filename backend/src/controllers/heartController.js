const Heart = require('../models/Heart');
const User = require('../models/User');

/**
 * ==========================================
 * TASK 14: HEART SYSTEM - Giới hạn số lần sai
 * ==========================================
 * 
 * API Test Endpoints:
 * 1. POST /api/hearts/use - Sử dụng tim (khi trả lời sai)
 * 2. GET /api/hearts/refill - Kiểm tra và nạp tim tự động
 * 3. POST /api/hearts/buy - Mua thêm tim bằng Gems
 */

/**
 * Giảm số tim khi người dùng trả lời sai
 * 
 * API Test:
 * POST /api/hearts/use
 * Headers: Authorization: Bearer {token}
 * Body: (không cần)
 * 
 * Response Success:
 * {
 *   "success": true,
 *   "hearts": {
 *     "current": 4,
 *     "max": 5,
 *     "nextRecoveryAt": "2025-01-15T10:30:00.000Z"
 *   },
 *   "message": "Đã sử dụng 1 tim"
 * }
 * 
 * Response Error (hết tim):
 * {
 *   "success": false,
 *   "message": "Bạn đã hết tim, vui lòng chờ hoặc mua thêm tim"
 * }
 */
exports.useHeart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Lấy hoặc tạo Heart record cho user (tự động kiểm tra phục hồi)
    const heart = await Heart.getOrCreate(userId);
    
    // Sử dụng tim (tự động giảm current)
    const success = await heart.useHeart();
    
    if (!success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn đã hết tim, vui lòng chờ hoặc mua thêm tim',
        hearts: {
          current: heart.current,
          max: heart.max,
          nextRecoveryAt: heart.nextRecoveryAt
        }
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      hearts: {
        current: heart.current,
        max: heart.max,
        nextRecoveryAt: heart.nextRecoveryAt,
        recoveryTime: heart.recoveryTime
      },
      message: 'Đã sử dụng 1 tim' 
    });
    
  } catch (error) {
    console.error('Lỗi khi sử dụng tim:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Kiểm tra và nạp lại tim tự động theo thời gian
 * 
 * API Test:
 * GET /api/hearts/refill
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "hearts": {
 *     "current": 5,
 *     "max": 5,
 *     "nextRecoveryAt": null,
 *     "recoveryTime": 30
 *   },
 *   "timeUntilNextHeart": 0  // Số phút còn lại để phục hồi tim tiếp theo
 * }
 */
exports.refillHearts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Lấy Heart record (tự động kiểm tra và phục hồi tim)
    const heart = await Heart.getOrCreate(userId);
    
    // Tính thời gian còn lại để phục hồi tim tiếp theo (phút)
    let timeUntilNextHeart = 0;
    if (heart.nextRecoveryAt && heart.current < heart.max) {
      const now = new Date();
      const diffMs = heart.nextRecoveryAt.getTime() - now.getTime();
      timeUntilNextHeart = Math.max(0, Math.ceil(diffMs / (1000 * 60))); // Chuyển sang phút
    }
    
    return res.status(200).json({ 
      success: true, 
      hearts: {
        current: heart.current,
        max: heart.max,
        nextRecoveryAt: heart.nextRecoveryAt,
        recoveryTime: heart.recoveryTime
      },
      timeUntilNextHeart
    });
    
  } catch (error) {
    console.error('Lỗi khi nạp tim:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Mua thêm tim bằng Gems
 * 
 * API Test:
 * POST /api/hearts/buy
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   "amount": 1  // Số tim muốn mua (1 tim = 5 gems)
 * }
 * 
 * Response Success:
 * {
 *   "success": true,
 *   "hearts": {
 *     "current": 5,
 *     "max": 5
 *   },
 *   "gems": {
 *     "amount": 45
 *   },
 *   "message": "Đã mua thành công 1 tim",
 *   "cost": 5
 * }
 * 
 * Response Error (không đủ gems):
 * {
 *   "success": false,
 *   "message": "Không đủ gems để mua tim",
 *   "required": 5,
 *   "current": 3
 * }
 */
exports.buyHearts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Số lượng tim không hợp lệ' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    
    // Lấy Heart record
    const heart = await Heart.getOrCreate(userId);
    
    // Giá mỗi tim là 5 gems
    const cost = amount * 5;
    
    // Kiểm tra số gems hiện có
    if (!user.gems || !user.gems.amount || user.gems.amount < cost) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không đủ gems để mua tim',
        required: cost,
        current: user.gems?.amount || 0
      });
    }
    
    // Trừ gems
    user.gems.amount -= cost;
    await user.save();
    
    // Thêm tim (tự động kiểm tra phục hồi trước)
    await heart.addHearts(amount);
    
    return res.status(200).json({ 
      success: true, 
      hearts: {
        current: heart.current,
        max: heart.max
      },
      gems: user.gems,
      message: `Đã mua thành công ${amount} tim`,
      cost
    });
    
  } catch (error) {
    console.error('Lỗi khi mua tim:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};