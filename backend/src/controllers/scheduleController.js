const StudySchedule = require('../models/StudySchedule');

/**
 * ==========================================
 * TASK 21: LỊCH HỌC (WEEKLY/MONTHLY)
 * ==========================================
 * Endpoints:
 * - POST /api/schedule
 * - GET  /api/schedule
 * - PUT  /api/schedule/:id
 * - DELETE /api/schedule/:id
 */

// Validate item time HH:mm
function isTimeStrValid(t) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

exports.createSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, timezone, pattern = 'weekly', items = [], startDate, endDate } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng truyền danh sách items (lịch học)'});
    }

    for (const it of items) {
      if (typeof it.dayOfWeek !== 'number' || it.dayOfWeek < 0 || it.dayOfWeek > 6) {
        return res.status(400).json({ success: false, message: 'dayOfWeek phải từ 0-6'});
      }
      if (!isTimeStrValid(it.startTime) || !isTimeStrValid(it.endTime)) {
        return res.status(400).json({ success: false, message: 'startTime/endTime phải định dạng HH:mm'});
      }
    }

    const schedule = await StudySchedule.create({
      user: userId,
      title,
      timezone,
      pattern,
      items,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    });

    return res.status(201).json({ success: true, schedule });
  } catch (error) {
    console.error('Lỗi tạo schedule:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.getMySchedules = async (req, res) => {
  try {
    const userId = req.user.id;
    const schedules = await StudySchedule.find({ user: userId, isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, schedules });
  } catch (error) {
    console.error('Lỗi lấy schedules:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const payload = req.body || {};

    const schedule = await StudySchedule.findOne({ _id: id, user: userId });
    if (!schedule) return res.status(404).json({ success: false, message: 'Không tìm thấy schedule' });

    // Optional validations
    if (payload.items) {
      for (const it of payload.items) {
        if (typeof it.dayOfWeek !== 'number' || it.dayOfWeek < 0 || it.dayOfWeek > 6) {
          return res.status(400).json({ success: false, message: 'dayOfWeek phải từ 0-6'});
        }
        if (!isTimeStrValid(it.startTime) || !isTimeStrValid(it.endTime)) {
          return res.status(400).json({ success: false, message: 'startTime/endTime phải định dạng HH:mm'});
        }
      }
    }

    Object.assign(schedule, payload);
    await schedule.save();
    return res.status(200).json({ success: true, schedule });
  } catch (error) {
    console.error('Lỗi cập nhật schedule:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const schedule = await StudySchedule.findOne({ _id: id, user: userId });
    if (!schedule) return res.status(404).json({ success: false, message: 'Không tìm thấy schedule' });

    schedule.isActive = false;
    await schedule.save();
    return res.status(200).json({ success: true, message: 'Đã xoá (ngưng hoạt động) lịch học' });
  } catch (error) {
    console.error('Lỗi xoá schedule:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};


