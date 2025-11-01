/**
 * OPTIONAL: Update User Model for Gamification
 * 
 * Thêm các fields sau vào User model nếu muốn có gamification đầy đủ
 * 
 * File: /src/models/User.js
 */

// Thêm vào userSchema sau field "updatedAt":

/*

  // ==================== GAMIFICATION FIELDS (OPTIONAL) ====================
  
  // XP System
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Streak System
  currentStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  
  longestStreak: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lastStudyDate: {
    type: Date
  },
  
  // Statistics
  totalStudyTime: {
    type: Number,
    default: 0, // in seconds
    min: 0
  },
  
  totalCards: {
    type: Number,
    default: 0,
    min: 0
  },
  
  masteredCards: {
    type: Number,
    default: 0,
    min: 0
  }

*/

// ==================== HELPER METHODS ====================

// Thêm các methods sau vào User model:

/*

// Method: Calculate level from XP
userSchema.methods.calculateLevel = function() {
  // Level formula: level = floor(XP / 1000) + 1
  // Level 1: 0-999 XP
  // Level 2: 1000-1999 XP
  // Level 3: 2000-2999 XP
  // etc.
  return Math.floor(this.xp / 1000) + 1;
};

// Method: Get XP needed for next level
userSchema.methods.xpForNextLevel = function() {
  const currentLevel = this.calculateLevel();
  const xpForNextLevel = currentLevel * 1000;
  return xpForNextLevel - this.xp;
};

// Method: Add XP and update level
userSchema.methods.addXP = function(amount) {
  this.xp += amount;
  this.level = this.calculateLevel();
  return this.xp;
};

// Method: Update study streak
userSchema.methods.updateStreak = function() {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastStudy = this.lastStudyDate ? new Date(this.lastStudyDate).setHours(0, 0, 0, 0) : null;
  
  if (lastStudy === today) {
    // Already studied today, keep streak
    return this.currentStreak;
  } else if (lastStudy === today - 86400000) {
    // Studied yesterday, increment streak
    this.currentStreak += 1;
  } else {
    // Streak broken, restart
    this.currentStreak = 1;
  }
  
  // Update longest streak
  this.longestStreak = Math.max(this.longestStreak || 0, this.currentStreak);
  this.lastStudyDate = new Date();
  
  return this.currentStreak;
};

// Virtual: Progress to next level
userSchema.virtual('levelProgress').get(function() {
  const currentLevel = this.calculateLevel();
  const xpAtCurrentLevel = (currentLevel - 1) * 1000;
  const xpForNextLevel = currentLevel * 1000;
  const xpInCurrentLevel = this.xp - xpAtCurrentLevel;
  const progress = (xpInCurrentLevel / (xpForNextLevel - xpAtCurrentLevel)) * 100;
  
  return {
    level: currentLevel,
    xp: this.xp,
    xpInLevel: xpInCurrentLevel,
    xpNeeded: xpForNextLevel - this.xp,
    progress: Math.round(progress)
  };
});

*/

// ==================== UPDATE EXISTING USERS ====================

/*

// Script để update existing users với default values
// Chạy 1 lần: node scripts/updateUserGamification.js

const mongoose = require('mongoose');
const User = require('../src/models/User');
require('dotenv').config();

async function updateUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const result = await User.updateMany(
      { xp: { $exists: false } },
      {
        $set: {
          xp: 0,
          level: 1,
          currentStreak: 0,
          longestStreak: 0,
          totalStudyTime: 0,
          totalCards: 0,
          masteredCards: 0
        }
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUsers();

*/

// ==================== NOTES ====================

/**
 * ⚠️ IMPORTANT:
 * 
 * Các fields gamification này là OPTIONAL.
 * 
 * Hệ thống Flashcard đã hoạt động hoàn toàn mà không cần các fields này.
 * 
 * XP và Streak đang được tính và lưu trong StudySession.
 * 
 * Chỉ cần thêm vào User model nếu bạn muốn:
 * 1. Hiển thị XP/Level trong profile
 * 2. Tạo leaderboard dựa trên XP
 * 3. Unlock features dựa trên level
 * 4. Hiển thị streak trên navbar/dashboard
 * 5. Track long-term statistics
 * 
 * Nếu không cần, có thể bỏ qua file này.
 */

console.log('This file contains optional User model updates for gamification.');
console.log('Read the comments inside to understand what to add.');
console.log('These fields are NOT required for the flashcard system to work!');
