// Script để thêm outfit mặc định cho tất cả user hiện có
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');
const ShopItem = require('../src/models/ShopItem');
const UserInventory = require('../src/models/UserInventory');
require('../config/database');

async function addDefaultOutfitToAllUsers() {
  try {
    console.log('🔗 Connecting to database...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found');
    }
    
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    
    console.log('✅ Connected to MongoDB');
    
    // Tìm outfit mặc định
    const defaultOutfit = await ShopItem.findOne({ isDefault: true, type: 'outfit' });
    
    if (!defaultOutfit) {
      console.log('❌ Không tìm thấy outfit mặc định. Vui lòng chạy seedShopItems.js trước!');
      process.exit(1);
    }
    
    console.log('✅ Tìm thấy outfit mặc định:', defaultOutfit.name);
    
    // Lấy tất cả users
    const users = await User.find({});
    console.log(`📊 Tìm thấy ${users.length} users`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const user of users) {
      // Kiểm tra user đã có outfit này chưa
      const existingOutfit = await UserInventory.findOne({
        userId: user._id,
        itemId: defaultOutfit._id
      });
      
      if (!existingOutfit) {
        // Thêm vào inventory
        await UserInventory.create({
          userId: user._id,
          itemId: defaultOutfit._id,
          purchasedAt: new Date(),
          isActive: true
        });
        
        // Set làm currentOutfit nếu chưa có
        if (!user.currentOutfit) {
          user.currentOutfit = defaultOutfit._id;
          await user.save();
        }
        
        addedCount++;
        console.log(`✓ Đã thêm outfit cho user: ${user.name} (${user.email || user._id})`);
      } else {
        skippedCount++;
        console.log(`- User ${user.name} đã có outfit này`);
      }
    }
    
    console.log('\n🎉 Hoàn thành!');
    console.log(`✅ Đã thêm: ${addedCount} users`);
    console.log(`⏭️  Bỏ qua: ${skippedCount} users`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addDefaultOutfitToAllUsers();
