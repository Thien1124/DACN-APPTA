const ShopItem = require('../models/ShopItem');
const UserInventory = require('../models/UserInventory');
const User = require('../models/User');

// Lấy danh sách các vật phẩm trong cửa hàng
exports.getShopItems = async (req, res) => {
  try {
    const { type } = req.query;
    
    // Tìm kiếm vật phẩm theo loại hoặc tất cả
    const query = { isAvailable: true };
    if (type) {
      query.type = type;
    }
    
    const shopItems = await ShopItem.find(query).sort({ 'price.gems': 1 });
    
    return res.status(200).json({
      success: true,
      items: shopItems
    });
    
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vật phẩm:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Mua vật phẩm từ cửa hàng
exports.purchaseItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.body;
    
    // Kiểm tra vật phẩm có tồn tại không
    const item = await ShopItem.findById(itemId);
    
    if (!item || !item.isAvailable) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vật phẩm không tồn tại hoặc không có sẵn' 
      });
    }
    
    // Kiểm tra người dùng
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }
    
    // Kiểm tra số gems
    if (user.gems.amount < item.price.gems) {
      return res.status(400).json({ 
        success: false, 
        message: 'Không đủ gems để mua vật phẩm này' 
      });
    }
    
    // Trừ gems
    user.gems.amount -= item.price.gems;
    await user.save();
    
    // Tạo bản ghi trong kho đồ người dùng
    const userInventory = new UserInventory({
      userId,
      itemId,
      purchasedAt: new Date()
    });
    
    // Nếu vật phẩm có thời hạn sử dụng
    if (item.duration > 0) {
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + item.duration);
      userInventory.expiresAt = expiryDate;
    }
    
    await userInventory.save();
    
    // Áp dụng hiệu ứng ngay lập tức nếu là vật phẩm tiêu thụ
    if (item.type === 'heart') {
      user.hearts.current = Math.min(user.hearts.current + item.effects.hearts, user.hearts.max);
      await user.save();
      userInventory.usedAt = new Date();
      userInventory.isActive = false;
      await userInventory.save();
    }
    
    return res.status(200).json({
      success: true,
      message: 'Mua vật phẩm thành công',
      item,
      userStats: {
        gems: user.gems,
        hearts: user.hearts
      }
    });
    
  } catch (error) {
    console.error('Lỗi khi mua vật phẩm:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Sử dụng vật phẩm từ kho đồ
exports.useItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { inventoryId } = req.body;
    
    // Kiểm tra vật phẩm trong kho đồ
    const inventoryItem = await UserInventory.findOne({
      _id: inventoryId,
      userId,
      isActive: true
    }).populate('itemId');
    
    if (!inventoryItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy vật phẩm trong kho đồ hoặc vật phẩm đã được sử dụng' 
      });
    }
    
    // Kiểm tra hạn sử dụng
    if (inventoryItem.expiresAt && new Date() > inventoryItem.expiresAt) {
      inventoryItem.isActive = false;
      await inventoryItem.save();
      return res.status(400).json({ 
        success: false, 
        message: 'Vật phẩm đã hết hạn sử dụng' 
      });
    }
    
    const item = inventoryItem.itemId;
    const user = await User.findById(userId);
    
    // Áp dụng hiệu ứng của vật phẩm
    let message = 'Đã sử dụng vật phẩm thành công';
    
    switch (item.type) {
      case 'heart':
        user.hearts.current = Math.min(user.hearts.current + item.effects.hearts, user.hearts.max);
        message = `Đã thêm ${item.effects.hearts} tim`;
        break;
        
      case 'boost':
        // Xử lý các loại boost khác nhau
        if (item.effects.xpBoost) {
          // Lưu thông tin boost XP (cần thêm trường trong User model)
          message = `Đã kích hoạt tăng ${item.effects.xpBoost}% XP`;
        }
        if (item.effects.streakFreeze) {
          // Lưu thông tin streak freeze (cần thêm trường trong User model)
          message = 'Đã kích hoạt bảo vệ streak';
        }
        break;
        
      default:
        message = 'Đã sử dụng vật phẩm';
    }
    
    // Cập nhật trạng thái vật phẩm
    inventoryItem.usedAt = new Date();
    inventoryItem.isActive = item.type !== 'heart'; // Vật phẩm tim sẽ tiêu thụ ngay
    
    await Promise.all([user.save(), inventoryItem.save()]);
    
    return res.status(200).json({
      success: true,
      message,
      userStats: {
        hearts: user.hearts,
        gems: user.gems
      }
    });
    
  } catch (error) {
    console.error('Lỗi khi sử dụng vật phẩm:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Lấy danh sách vật phẩm trong kho đồ của người dùng
exports.getUserInventory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;
    
    // Tìm kiếm vật phẩm trong kho đồ
    const query = { userId, isActive: true };
    
    const inventory = await UserInventory.find(query)
      .populate('itemId')
      .sort({ purchasedAt: -1 });
    
    // Lọc theo loại nếu có yêu cầu
    let filteredInventory = inventory;
    if (type) {
      filteredInventory = inventory.filter(item => item.itemId.type === type);
    }
    
    return res.status(200).json({
      success: true,
      inventory: filteredInventory
    });
    
  } catch (error) {
    console.error('Lỗi khi lấy kho đồ người dùng:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};