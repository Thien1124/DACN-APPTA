const LearningPath = require('../models/LearningPath');
const Deck = require('../models/Deck');
const Lesson = require('../models/Lesson');

/**
 * ==========================================
 * TASK 20: LỘ TRÌNH THEO MỤC TIÊU (Roadmap)
 * ==========================================
 * Endpoints:
 * - POST /api/roadmap/generate
 * - GET  /api/roadmap/current
 * - POST /api/roadmap/progress
 */

/**
 * Tạo lộ trình học theo mục tiêu
 * 
 * API Test:
 * POST /api/roadmap/generate
 * Headers: Authorization: Bearer {token}
 * Body: {
 *   "goalType": "TOEIC_CORE_650",
 *   "targetScore": 650,
 *   "targetDate": "2025-03-31",
 *   "weeks": 8
 * }
 */
exports.generateRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const { goalType, targetScore, targetDate, weeks = 8 } = req.body;

    if (!goalType) {
      return res.status(400).json({ success: false, message: 'Vui lòng truyền goalType' });
    }

    // Hủy kích hoạt lộ trình cũ nếu có
    await LearningPath.updateMany({ user: userId, isActive: true }, { isActive: false });

    // Lấy Deck phù hợp theo goal (ví dụ: tag chứa TOEIC)
    let candidateDecks = await Deck.find({ title: { $regex: 'TOEIC', $options: 'i' } }).select('title');
    if (!candidateDecks || candidateDecks.length === 0) {
      // Fallback: lấy 8 deck đầu bất kỳ
      candidateDecks = await Deck.find({}).select('title').limit(8);
    }

    const totalWeeks = parseInt(weeks);
    const plan = [];
    let weekIndex = 1;
    let dayIndex = 1;

    // Phân bổ deck theo tuần/ngày (giống Duolingo style: mỗi ngày 1-2 đơn vị nhỏ)
    for (const deck of candidateDecks) {
      plan.push({ type: 'deck', refId: deck._id, title: deck.title, weekIndex, dayIndex, estimatedMinutes: 25 });
      dayIndex += 1;
      if (dayIndex > 6) { // 6 ngày học + 1 ngày review/ nghỉ
        // Thêm ngày review
        plan.push({ type: 'practice', refId: deck._id, title: `Review ${deck.title}`, weekIndex, dayIndex: 7, estimatedMinutes: 20 });
        weekIndex += 1;
        dayIndex = 1;
        if (weekIndex > totalWeeks) break;
      }
      if (weekIndex > totalWeeks) break;
    }

    const learningPath = await LearningPath.create({
      user: userId,
      goalType,
      targetScore,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      totalWeeks,
      plan,
      progress: { totalUnits: plan.length, completedUnits: 0, percent: 0 }
    });

    return res.status(201).json({ success: true, roadmap: learningPath });
  } catch (error) {
    console.error('Lỗi khi tạo lộ trình:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Lấy lộ trình hiện tại
 * 
 * API Test:
 * GET /api/roadmap/current
 * Headers: Authorization: Bearer {token}
 */
exports.getCurrentRoadmap = async (req, res) => {
  try {
    const userId = req.user.id;
    const roadmap = await LearningPath.findOne({ user: userId, isActive: true });
    if (!roadmap) return res.status(200).json({ success: true, roadmap: null });
    return res.status(200).json({ success: true, roadmap });
  } catch (error) {
    console.error('Lỗi khi lấy lộ trình:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Cập nhật tiến độ một unit trong lộ trình
 * 
 * API Test:
 * POST /api/roadmap/progress
 * Headers: Authorization: Bearer {token}
 * Body: { "unitIndex": 3, "completed": true }
 */
exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { unitIndex, completed } = req.body;
    const roadmap = await LearningPath.findOne({ user: userId, isActive: true });
    if (!roadmap) return res.status(404).json({ success: false, message: 'Không có lộ trình hiện tại' });

    if (unitIndex == null || unitIndex < 0 || unitIndex >= roadmap.plan.length) {
      return res.status(400).json({ success: false, message: 'unitIndex không hợp lệ' });
    }

    roadmap.plan[unitIndex].completed = !!completed;
    roadmap.plan[unitIndex].completedAt = completed ? new Date() : undefined;

    const completedUnits = roadmap.plan.filter(u => u.completed).length;
    roadmap.progress.completedUnits = completedUnits;
    roadmap.progress.percent = Math.round((completedUnits / roadmap.progress.totalUnits) * 100);

    await roadmap.save();
    return res.status(200).json({ success: true, roadmap });
  } catch (error) {
    console.error('Lỗi khi cập nhật tiến độ lộ trình:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};


