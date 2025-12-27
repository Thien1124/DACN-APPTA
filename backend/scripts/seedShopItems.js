// backend/scripts/seedShopItems.js

// ✅ Load environment variables first (resolve path relative to this script)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const ShopItem = require('../src/models/ShopItem');
// Require database config
require('../config/database');

const shopItems = [
  // Default Outfit - Miễn phí cho mọi user
  {
    name: 'Trang Phục Chibi Mặc Định',
    description: 'Trang phục mặc định dễ thương cho mọi người',
    type: 'outfit',
    price: { gems: 0 },
    effects: {},
    outfitData: {
      category: 'casual',
      rarity: 'common',
      color: '#58CC02',
      iconEmoji: '👶'
    },
    image: 'chibi.png',
    isAvailable: false, // Không hiển thị trong shop
    isDefault: true
  },

  // Hearts
  {
    name: '1 Trái Tim',
    description: 'Khôi phục 1 trái tim ngay lập tức',
    type: 'heart',
    price: { gems: 5 },
    effects: { hearts: 1 },
    isAvailable: true
  },
  {
    name: '5 Trái Tim',
    description: 'Khôi phục 5 trái tim ngay lập tức',
    type: 'heart',
    price: { gems: 20 },
    effects: { hearts: 5 },
    isAvailable: true
  },
  
  // Powerups
  {
    name: 'Streak Freeze',
    description: 'Bảo vệ streak của bạn 1 ngày',
    type: 'boost',
    price: { gems: 50 },
    effects: { streakFreeze: 1 },
    isAvailable: true
  },

  // Outfits - Common
  {
    name: 'Áo Thun Xanh Cơ Bản',
    description: 'Trang phục học tập hàng ngày',
    type: 'outfit',
    price: { gems: 100 },
    effects: {},
    outfitData: {
      category: 'casual',
      rarity: 'common',
      color: '#1CB0F6',
      iconEmoji: '👕'
    },
    isAvailable: true
  },
  {
    name: 'Quần Jean Đơn Giản',
    description: 'Thoải mái cho mọi hoạt động',
    type: 'outfit',
    price: { gems: 80 },
    effects: {},
    outfitData: {
      category: 'casual',
      rarity: 'common',
      color: '#4A90E2',
      iconEmoji: '👖'
    },
    isAvailable: true
  },

  // Outfits - Rare
  {
    name: 'Bộ Đồ Thể Thao',
    description: 'Trang phục năng động cho người học năng suất',
    type: 'outfit',
    price: { gems: 250 },
    effects: {},
    outfitData: {
      category: 'sporty',
      rarity: 'rare',
      color: '#FF6B6B',
      iconEmoji: '🏃'
    },
    isAvailable: true
  },
  {
    name: 'Vest Lịch Lãm',
    description: 'Phong cách chuyên nghiệp cho người học nghiêm túc',
    type: 'outfit',
    price: { gems: 300 },
    effects: {},
    outfitData: {
      category: 'formal',
      rarity: 'rare',
      color: '#2C3E50',
      iconEmoji: '🎩'
    },
    isAvailable: true
  },

  // Outfits - Epic
  {
    name: 'Kimono Nhật Bản',
    description: 'Trang phục truyền thống Nhật Bản sang trọng',
    type: 'outfit',
    price: { gems: 500 },
    effects: {},
    outfitData: {
      category: 'fantasy',
      rarity: 'epic',
      color: '#E91E63',
      iconEmoji: '👘'
    },
    isAvailable: true
  },
  {
    name: 'Bộ Đồ Ninja',
    description: 'Stealth mode để tập trung học tập',
    type: 'outfit',
    price: { gems: 600 },
    effects: {},
    outfitData: {
      category: 'fantasy',
      rarity: 'epic',
      color: '#424242',
      iconEmoji: '🥷'
    },
    isAvailable: true
  },

  // Outfits - Legendary
  {
    name: 'Bộ Giáp Vàng Huyền Thoại',
    description: 'Dành cho những chiến binh học tập vĩ đại nhất',
    type: 'outfit',
    price: { gems: 1000 },
    effects: {},
    outfitData: {
      category: 'premium',
      rarity: 'legendary',
      color: '#FFD700',
      iconEmoji: '🛡️'
    },
    isAvailable: true
  },
  {
    name: 'Áo Choàng Phù Thủy',
    description: 'Năng lực ma thuật để chinh phục ngôn ngữ',
    type: 'outfit',
    price: { gems: 1200 },
    effects: {},
    outfitData: {
      category: 'fantasy',
      rarity: 'legendary',
      color: '#9C27B0',
      iconEmoji: '🧙'
    },
    isAvailable: true
  },

  // Seasonal Outfits
  {
    name: 'Bộ Đồ Giáng Sinh',
    description: 'Tinh thần lễ hội mùa đông',
    type: 'outfit',
    price: { gems: 400 },
    effects: {},
    outfitData: {
      category: 'seasonal',
      rarity: 'epic',
      color: '#C92A2A',
      iconEmoji: '🎅'
    },
    isAvailable: true
  }
];

async function seedShopItems() {
  try {
     ('🔗 Connecting to database...');
     ('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    // ✅ Check if MONGODB_URI exists (note: it's MONGODB_URI, not MONGO_URI)
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found. Please check your .env file in the root directory.');
    }
    
    // ✅ Wait for database connection or connect directly
    if (mongoose.connection.readyState !== 1) {
       ('Database not connected, connecting directly...');
      await mongoose.connect(process.env.MONGODB_URI);
    } else {
       ('Database already connected');
    }
    
     ('✅ Connected to MongoDB');
    
    // Clear existing items
    await ShopItem.deleteMany({});
     ('🧹 Cleared existing shop items');
    
    // Insert new items
    await ShopItem.insertMany(shopItems);
     (`✅ Inserted ${shopItems.length} shop items`);
    
     ('🎉 Shop items seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding shop items:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

seedShopItems();