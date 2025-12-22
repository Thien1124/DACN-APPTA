const path = require('path');
// Load biến môi trường
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const User = require('../src/models/User');
const Leaderboard = require('../src/models/Leaderboard');

async function seed() {
  try {
    // 1. Kết nối DB
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Xóa dữ liệu xếp hạng cũ để làm mới
    await Leaderboard.deleteMany({});
    console.log('🧹 Cleared old leaderboard data');
    
    // 3. Lấy tất cả User
    const users = await User.find({});
    
    if (users.length === 0) {
        console.log('⚠️ Không tìm thấy User nào.');
        process.exit(0);
    }

    const leaderboardEntries = [];
    
    for (const user of users) {
      // --- SỬA ĐỔI: LẤY DỮ LIỆU THẬT, KHÔNG RANDOM ---
      
      // 1. Lấy XP thật (nếu không có thì = 0)
      const currentXP = (user.xp && user.xp.total) ? user.xp.total : 0;
      
      // 2. Lấy Streak thật (nếu không có thì = 0)
      const streak = (user.streak && user.streak.count) ? user.streak.count : 0;

      // 3. Lấy Level thật (hoặc tính lại nếu chưa có)
      const level = (user.xp && user.xp.level) ? user.xp.level : (Math.floor(Math.sqrt(currentXP / 100)) + 1);

      // 4. Xử lý Weekly/Monthly XP
      // Vì bảng User không lưu lịch sử tuần/tháng, ta có 2 lựa chọn:
      // - Option A: Set = 0 (An toàn nhất, bắt đầu tính từ tuần này)
      // - Option B: Set = currentXP (Coi như toàn bộ XP kiếm được là trong tuần này - dùng để test hiển thị)
      // Ở đây tôi chọn 0 để đúng với nguyên tắc "có nhiêu lấy nhiêu" (User chưa có history thì là 0)
      const weeklyXP = 0; 
      const monthlyXP = 0;

      leaderboardEntries.push({
        user: user._id,
        xpTotal: currentXP,
        weeklyXP: weeklyXP, 
        monthlyXP: monthlyXP,
        streak: streak,
        level: level,
        lastActive: user.streak?.lastActivityDate || new Date()
      });
      
      console.log(`Synced user: ${user.name || user.username} | XP: ${currentXP}`);
    }

    // 5. Lưu vào DB
    if (leaderboardEntries.length > 0) {
      await Leaderboard.insertMany(leaderboardEntries);
      console.log(`🎉 Đã đồng bộ thành công ${leaderboardEntries.length} người dùng vào bảng xếp hạng!`);
    } else {
      console.log('ℹ️ Không có dữ liệu để đồng bộ.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

seed();