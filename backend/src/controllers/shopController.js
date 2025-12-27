const ShopItem = require('../models/ShopItem');
const UserInventory = require('../models/UserInventory');
const User = require('../models/User');
const Heart = require('../models/Heart');

/**
 * Helper function: Thêm outfit mặc định cho user nếu chưa có
 */
const ensureDefaultOutfit = async (userId) => {
  try {
    const defaultOutfit = await ShopItem.findOne({ isDefault: true, type: 'outfit' });
    
    if (!defaultOutfit) return;

    const existingOutfit = await UserInventory.findOne({
      userId,
      itemId: defaultOutfit._id
    });

    if (!existingOutfit) {
      await UserInventory.create({
        userId,
        itemId: defaultOutfit._id,
        purchasedAt: new Date(),
        isActive: true
      });

      const user = await User.findById(userId);
      if (!user.currentOutfit) {
        user.currentOutfit = defaultOutfit._id;
        await user.save();
      }

      console.log('[INFO] Đã thêm outfit mặc định cho user:', userId);
    }
  } catch (error) {
    console.error('[ERROR] Lỗi khi thêm outfit mặc định:', error);
  }
};

/**
 * ==========================================
 * TASK 15: SHOP SYSTEM - Cửa hàng vật phẩm
 * ==========================================
 * 
 * API Test Endpoints:
 * 1. GET /api/shop/items - Lấy danh sách vật phẩm
 * 2. POST /api/shop/purchase - Mua vật phẩm bằng Gems
 * 3. POST /api/shop/use - Sử dụng vật phẩm từ kho đồ
 * 4. GET /api/shop/inventory - Lấy kho đồ của user
 */

/**
 * Lấy danh sách các vật phẩm trong cửa hàng
 * 
 * API Test:
 * GET /api/shop/items?type=heart
 * Headers: Authorization: Bearer {token}
 * Query Params: type (optional) - heart, boost, theme, avatar, other
 * 
 * Response:
 * {
 *   "success": true,
 *   "items": [
 *     {
 *       "_id": "...",
 *       "name": "1 Tim",
 *       "description": "Thêm 1 tim ngay lập tức",
 *       "type": "heart",
 *       "price": {
 *         "gems": 5
 *       },
 *       "effects": {
 *         "hearts": 1
 *       },
 *       "duration": 0,
 *       "isAvailable": true
 *     }
 *   ]
 * }
 */
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

/**
 * Mua vật phẩm từ cửa hàng bằng Gems
 * 
 * API Test:
 * POST /api/shop/purchase
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   "itemId": "60f7b3b3b3b3b3b3b3b3b3b3"
 * }
 * 
 * Response Success:
 * {
 *   "success": true,
 *   "message": "Mua vật phẩm thành công",
 *   "item": { ... },
 *   "userStats": {
 *     "gems": { "amount": 45 },
 *     "hearts": { "current": 5, "max": 5 }
 *   }
 * }
 * 
 * Response Error (không đủ gems):
 * {
 *   "success": false,
 *   "message": "Không đủ gems để mua vật phẩm này"
 * }
 * 
 * Test Cases:
 * 1. Mua vật phẩm tim -> tự động thêm tim, tiêu thụ ngay
 * 2. Mua vật phẩm boost -> lưu vào kho đồ
 * 3. Không đủ gems -> lỗi
 */
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
    
    // Kiểm tra nếu là outfit, user đã sở hữu chưa
    if (item.type === 'outfit') {
      const existingOutfit = await UserInventory.findOne({
        userId,
        itemId,
        isActive: true
      });
      
      if (existingOutfit) {
        return res.status(400).json({ 
          success: false, 
          message: 'Bạn đã sở hữu trang phục này rồi' 
        });
      }
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
    
    // Áp dụng hiệu ứng ngay lập tức nếu là vật phẩm tiêu thụ (tim)
    let heart = null;
    if (item.type === 'heart') {
      heart = await Heart.getOrCreate(userId);
      await heart.addHearts(item.effects.hearts || 0);
      userInventory.usedAt = new Date();
      userInventory.isActive = false;
      await userInventory.save();
    } else {
      // Lấy heart để trả về trong response (nếu không phải tim)
      heart = await Heart.getOrCreate(userId);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Mua vật phẩm thành công',
      item,
      userStats: {
        gems: user.gems,
        hearts: {
          current: heart.current,
          max: heart.max
        }
      }
    });
    
  } catch (error) {
    console.error('Lỗi khi mua vật phẩm:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Sử dụng vật phẩm từ kho đồ
 * 
 * API Test:
 * POST /api/shop/use
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   "inventoryId": "60f7b3b3b3b3b3b3b3b3b3b3"
 * }
 * 
 * Response Success:
 * {
 *   "success": true,
 *   "message": "Đã thêm 1 tim",
 *   "userStats": {
 *     "hearts": { "current": 5, "max": 5 },
 *     "gems": { "amount": 50 }
 *   }
 * }
 * 
 * Response Error (vật phẩm không tồn tại hoặc đã hết hạn):
 * {
 *   "success": false,
 *   "message": "Vật phẩm đã hết hạn sử dụng"
 * }
 */
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
        const heart = await Heart.getOrCreate(userId);
        await heart.addHearts(item.effects.hearts || 0);
        message = `Đã thêm ${item.effects.hearts} tim`;
        break;
        
      case 'boost':
        // Xử lý các loại boost khác nhau
        if (item.effects.xpBoost) {
          // TODO: Lưu thông tin boost XP vào User model
          // Ví dụ: user.boost = { xpBoost: item.effects.xpBoost, expiresAt: ... }
          message = `Đã kích hoạt tăng ${item.effects.xpBoost}% XP`;
        }
        if (item.effects.streakFreeze) {
          // TODO: Lưu thông tin streak freeze vào User model
          // Ví dụ: user.streak.freeze = true, user.streak.freezeExpiresAt = ...
          message = 'Đã kích hoạt bảo vệ streak';
        }
        break;
        
      default:
        message = 'Đã sử dụng vật phẩm';
    }
    
    // Cập nhật trạng thái vật phẩm
    inventoryItem.usedAt = new Date();
    inventoryItem.isActive = item.type !== 'heart'; // Vật phẩm tim sẽ tiêu thụ ngay khi mua
    
    // Cập nhật lại heart sau khi sử dụng
    const heart = await Heart.getOrCreate(userId);
    
    await Promise.all([user.save(), inventoryItem.save()]);
    
    return res.status(200).json({
      success: true,
      message,
      userStats: {
        hearts: {
          current: heart.current,
          max: heart.max
        },
        gems: user.gems
      }
    });
    
  } catch (error) {
    console.error('Lỗi khi sử dụng vật phẩm:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Lấy danh sách vật phẩm trong kho đồ của người dùng
 * 
 * API Test:
 * GET /api/shop/inventory?type=boost
 * Headers: Authorization: Bearer {token}
 * Query Params: type (optional) - lọc theo loại vật phẩm
 * 
 * Response:
 * {
 *   "success": true,
 *   "inventory": [
 *     {
 *       "_id": "...",
 *       "itemId": {
 *         "_id": "...",
 *         "name": "XP Boost 2x",
 *         "type": "boost",
 *         "effects": { "xpBoost": 2 }
 *       },
 *       "purchasedAt": "2025-01-15T10:00:00.000Z",
 *       "expiresAt": null,
 *       "isActive": true
 *     }
 *   ]
 * }
 */
exports.getUserInventory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;
    
    // Đảm bảo user có outfit mặc định
    await ensureDefaultOutfit(userId);
    
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

  /**
 * Lấy số gems hiện tại của người dùng
 * 
 * API Test:
 * GET /api/shop/gems
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "gems": 50
 * }
 */
  exports.getUserGems = async (req, res) => {
    try {
      const userId = req.user.id;
      
      const user = await User.findById(userId).select('gems');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'Không tìm thấy người dùng' 
        });
      }
      
      return res.status(200).json({
        success: true,
        gems: user.gems?.amount || 0
      });
      
    } catch (error) {
      console.error('Lỗi khi lấy gems:', error);
      return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  };

/**
 * Trang bị outfit đã mua
 * 
 * API Test:
 * POST /api/shop/equip-outfit
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   "outfitId": "60f7b3b3b3b3b3b3b3b3b3b3"
 * }
 * 
 * Response Success:
 * {
 *   "success": true,
 *   "message": "Đã trang bị outfit thành công",
 *   "currentOutfit": {
 *     "_id": "...",
 *     "name": "Kimono Nhật Bản",
 *     "outfitData": {
 *       "category": "fantasy",
 *       "rarity": "epic",
 *       "color": "#E91E63",
 *       "iconEmoji": "👘"
 *     }
 *   }
 * }
 * 
 * Response Error:
 * {
 *   "success": false,
 *   "message": "Bạn chưa sở hữu outfit này"
 * }
 */
exports.equipOutfit = async (req, res) => {
  try {
    const userId = req.user.id;
    const { outfitId } = req.body;

    // Không cho phép tháo outfit (luôn phải có 1 outfit)
    if (outfitId === null || outfitId === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Bạn phải luôn mặc một trang phục. Hãy chọn trang phục khác để thay thế.'
      });
    }

    // Kiểm tra outfit có tồn tại không
    const outfit = await ShopItem.findById(outfitId);
    
    if (!outfit || outfit.type !== 'outfit') {
      return res.status(404).json({ 
        success: false, 
        message: 'Outfit không tồn tại' 
      });
    }

    // Kiểm tra user đã mua outfit này chưa
    const ownedOutfit = await UserInventory.findOne({
      userId,
      itemId: outfitId,
      isActive: true
    });

    if (!ownedOutfit) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn chưa sở hữu outfit này. Vui lòng mua trước khi trang bị.' 
      });
    }

    // Cập nhật currentOutfit của user
    const user = await User.findById(userId);
    user.currentOutfit = outfitId;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Đã trang bị outfit thành công',
      currentOutfit: outfit
    });
    
  } catch (error) {
    console.error('Lỗi khi trang bị outfit:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Lấy outfit hiện tại đang mặc
 * 
 * API Test:
 * GET /api/shop/current-outfit
 * Headers: Authorization: Bearer {token}
 * 
 * Response:
 * {
 *   "success": true,
 *   "currentOutfit": {
 *     "_id": "...",
 *     "name": "Kimono Nhật Bản",
 *     "outfitData": {...}
 *   }
 * }
 */
exports.getCurrentOutfit = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Đảm bảo user có outfit mặc định
    await ensureDefaultOutfit(userId);
    
    const user = await User.findById(userId).populate('currentOutfit');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }
    
    return res.status(200).json({
      success: true,
      currentOutfit: user.currentOutfit || null
    });
    
  } catch (error) {
    console.error('Lỗi khi lấy outfit hiện tại:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};
