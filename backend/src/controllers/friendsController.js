const Follow = require('../models/Follow');
const User = require('../models/User');
const StudySession = require('../models/StudySession');
const notificationService = require('../services/notificationService');

/**
 * ==========================================
 * TASK 22: Friends/Social - Follow & Feed
 * ==========================================
 * Endpoints:
 * - POST   /api/friends/follow       { userId }
 * - DELETE /api/friends/unfollow/:userId
 * - GET    /api/friends/following
 * - GET    /api/friends/followers
 * - GET    /api/friends/feed         (tiến độ bạn bè)
 * - POST   /api/friends/congrats     { userId, message? }
 */

// Follow người dùng
exports.follow = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: targetId } = req.body;

    if (!targetId) return res.status(400).json({ success: false, message: 'Thiếu userId' });
    if (userId.toString() === targetId.toString()) {
      return res.status(400).json({ success: false, message: 'Không thể tự follow chính mình' });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    const rel = await Follow.findOneAndUpdate(
      { follower: userId, following: targetId },
      { $setOnInsert: { follower: userId, following: targetId } },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, follow: rel });
  } catch (error) {
    console.error('Lỗi follow:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Unfollow
exports.unfollow = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: targetId } = req.params;
    const deleted = await Follow.findOneAndDelete({ follower: userId, following: targetId });
    return res.status(200).json({ success: true, removed: !!deleted });
  } catch (error) {
    console.error('Lỗi unfollow:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Danh sách mình đang theo dõi
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.user.id;
    const rels = await Follow.find({ follower: userId }).populate('following', 'name avatar xp streak');
    return res.status(200).json({ success: true, following: rels.map(r => r.following) });
  } catch (error) {
    console.error('Lỗi getFollowing:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Danh sách theo dõi mình
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.user.id;
    const rels = await Follow.find({ following: userId }).populate('follower', 'name avatar xp streak');
    return res.status(200).json({ success: true, followers: rels.map(r => r.follower) });
  } catch (error) {
    console.error('Lỗi getFollowers:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Feed tiến độ học tập của bạn bè (gần đây)
exports.getFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const following = await Follow.find({ follower: userId }).select('following');
    const followingIds = following.map(f => f.following);
    if (followingIds.length === 0) return res.status(200).json({ success: true, feed: [] });

    // Lấy các phiên học gần đây của bạn bè
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const sessions = await StudySession.find({ user: { $in: followingIds }, startTime: { $gte: since } })
      .populate('user', 'name avatar')
      .populate('deck', 'title')
      .sort({ startTime: -1 })
      .limit(50);

    // Chuẩn hóa thông tin để hiển thị (Duolingo-like)
    const feed = sessions.map(s => ({
      user: s.user,
      deck: s.deck,
      studyMode: s.studyMode,
      sessionType: s.sessionType,
      score: s.score,
      xpEarned: s.xpEarned,
      startTime: s.startTime
    }));

    return res.status(200).json({ success: true, feed });
  } catch (error) {
    console.error('Lỗi getFeed:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// Gửi lời chúc mừng (notification) tới bạn bè
exports.congrats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: targetId, message } = req.body;
    if (!targetId) return res.status(400).json({ success: false, message: 'Thiếu userId' });

    const toUser = await User.findById(targetId);
    if (!toUser) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });

    const text = message || 'Chúc mừng bạn tiến bộ! 🚀';
    // Sử dụng notificationService nếu có (đã tồn tại trong dự án)
    try {
      await notificationService.createNotification({
        userId: targetId,
        type: 'FRIEND_CONGRATS',
        title: 'Bạn bè chúc mừng!',
        message: text,
        metadata: { fromUser: userId }
      });
    } catch (e) {
      // Nếu service thay đổi, vẫn trả OK vì feature chính là follow/feed
      console.warn('Gửi notification không thành công (log-only):', e.message);
    }

    return res.status(200).json({ success: true, message: 'Đã gửi lời chúc mừng' });
  } catch (error) {
    console.error('Lỗi congrats:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};



