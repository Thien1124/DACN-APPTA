const User = require('../models/User');

// Giảm số tim khi người dùng trả lời sai
exports.useHeart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    
    // Kiểm tra số tim hiện tại
    if (user.hearts.current <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn đã hết tim, vui lòng chờ hoặc mua thêm tim' 
      });
    }
    
    // Giảm số tim
    user.hearts.current -= 1;
    await user.save();
    
    return res.status(200).json({ 
      success: true, 
      hearts: user.hearts,
      message: 'Đã sử dụng 1 tim' 
    });
    
  } catch (error) {
    console.error('Lỗi khi sử dụng tim:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Nạp lại tim theo thời gian
exports.refillHearts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    
    const now = new Date();
    const lastRefill = new Date(user.hearts.lastRefillDate);
    
    // Tính số giờ đã trôi qua kể từ lần nạp tim cuối
    const hoursPassed = Math.floor((now - lastRefill) / (1000 * 60 * 60));
    
    // Mỗi giờ nạp 1 tim, tối đa đến giới hạn tim
    if (hoursPassed > 0 && user.hearts.current < user.hearts.max) {
      const heartsToAdd = Math.min(hoursPassed, user.hearts.max - user.hearts.current);
      user.hearts.current += heartsToAdd;
      user.hearts.lastRefillDate = now;
      await user.save();
    }
    
    // Tính thời gian còn lại để nạp tim tiếp theo
    let nextRefillMinutes = 0;
    if (user.hearts.current < user.hearts.max) {
      const minutesPassed = Math.floor((now - lastRefill) / (1000 * 60)) % 60;
      nextRefillMinutes = 60 - minutesPassed;
    }
    
    return res.status(200).json({ 
      success: true, 
      hearts: user.hearts,
      nextRefillMinutes
    });
    
  } catch (error) {
    console.error('Lỗi khi nạp tim:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Mua thêm tim bằng gems
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
    
    // Giá mỗi tim là 5 gems
    const cost = amount * 5;
    
    // Kiểm tra số gems hiện có
    if (user.gems.amount < cost) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không đủ gems để mua tim' 
      });
    }
    
    // Trừ gems và cộng tim
    user.gems.amount -= cost;
    user.hearts.current = Math.min(user.hearts.current + amount, user.hearts.max);
    
    await user.save();
    
    return res.status(200).json({ 
      success: true, 
      hearts: user.hearts,
      gems: user.gems,
      message: `Đã mua thành công ${amount} tim` 
    });
    
  } catch (error) {
    console.error('Lỗi khi mua tim:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};