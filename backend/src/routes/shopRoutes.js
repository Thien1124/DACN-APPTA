const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { protect } = require('../middleware/authMiddleware');

// Lấy danh sách các vật phẩm trong cửa hàng
router.get('/items', protect, shopController.getShopItems);

// Lấy số gems hiện tại
router.get('/gems', protect, shopController.getUserGems);

// Mua vật phẩm từ cửa hàng
router.post('/purchase', protect, shopController.purchaseItem);

// Sử dụng vật phẩm từ kho đồ
router.post('/use', protect, shopController.useItem);

// Lấy danh sách vật phẩm trong kho đồ của người dùng
router.get('/inventory', protect, shopController.getUserInventory);

// Trang bị outfit
router.post('/equip-outfit', protect, shopController.equipOutfit);

// Lấy outfit hiện tại
router.get('/current-outfit', protect, shopController.getCurrentOutfit);

module.exports = router;