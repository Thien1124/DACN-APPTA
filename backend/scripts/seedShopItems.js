// backend/scripts/seedShopItems.js

// ✅ Load environment variables first (resolve path relative to this script)
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const ShopItem = require('../src/models/ShopItem');
// Require database config
require('../config/database');

const shopItems = [
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
  {
    name: 'Streak Freeze',
    description: 'Bảo vệ streak của bạn 1 ngày',
    type: 'powerup',
    price: { gems: 50 },
    effects: { streakFreeze: 1 },
    isAvailable: true
  }
];

async function seedShopItems() {
  try {
    console.log('🔗 Connecting to database...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    // ✅ Check if MONGODB_URI exists (note: it's MONGODB_URI, not MONGO_URI)
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found. Please check your .env file in the root directory.');
    }
    
    // ✅ Wait for database connection or connect directly
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, connecting directly...');
      await mongoose.connect(process.env.MONGODB_URI);
    } else {
      console.log('Database already connected');
    }
    
    console.log('✅ Connected to MongoDB');
    
    // Clear existing items
    await ShopItem.deleteMany({});
    console.log('🧹 Cleared existing shop items');
    
    // Insert new items
    await ShopItem.insertMany(shopItems);
    console.log(`✅ Inserted ${shopItems.length} shop items`);
    
    console.log('🎉 Shop items seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding shop items:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

seedShopItems();

export const shopService = {
  // ...existing code...

  getGems: async () => {
    try {
      const response = await api.get('/shop/gems');
      // Normalize different backend shapes to a plain number
      const data = response?.data || {};
      const amount =
        (data.gems && typeof data.gems === 'object' && typeof data.gems.amount === 'number') ? data.gems.amount
        : (typeof data.gems === 'number' ? data.gems
        : (data.userStats && data.userStats.gems && typeof data.userStats.gems.amount === 'number') ? data.userStats.gems.amount
        : 0);
      return amount;
    } catch (error) {
      console.error('Error fetching gems:', error);
      return 0;
    }
  },

  // ...existing code...
};