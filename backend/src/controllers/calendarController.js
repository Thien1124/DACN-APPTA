const GoogleIntegration = require('../models/GoogleIntegration');
const StudySchedule = require('../models/StudySchedule');

/**
 * ==========================================
 * TASK 21: Google Calendar Sync (Stub-friendly)
 * ==========================================
 * Endpoints:
 * - POST /api/calendar/connect
 * - GET  /api/calendar/status
 * - POST /api/calendar/sync
 */

/**
 * Kết nối Google bằng cách lưu token (stub để test API nhanh)
 * 
 * API Test:
 * POST /api/calendar/connect
 * Body: { "accessToken": "...", "refreshToken": "...", "tokenExpiry": "2025-12-31T00:00:00.000Z", "calendarId": "primary" }
 */
exports.connect = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accessToken, refreshToken, tokenExpiry, calendarId } = req.body;

    let integ = await GoogleIntegration.findOne({ user: userId }).select('+accessToken +refreshToken');
    if (!integ) integ = new GoogleIntegration({ user: userId });

    if (accessToken) integ.accessToken = accessToken;
    if (refreshToken) integ.refreshToken = refreshToken;
    if (tokenExpiry) integ.tokenExpiry = new Date(tokenExpiry);
    if (calendarId) integ.calendarId = calendarId;

    await integ.save();
    return res.status(200).json({ success: true, message: 'Đã lưu token Google (stub)', status: integ });
  } catch (error) {
    console.error('Lỗi connect Google:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Kiểm tra trạng thái kết nối Google
 * 
 * API Test:
 * GET /api/calendar/status
 */
exports.status = async (req, res) => {
  try {
    const userId = req.user.id;
    const integ = await GoogleIntegration.findOne({ user: userId });
    if (!integ) return res.status(200).json({ success: true, connected: false });
    return res.status(200).json({ success: true, connected: true, calendarId: integ.calendarId, tokenExpiry: integ.tokenExpiry });
  } catch (error) {
    console.error('Lỗi status Google:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Đồng bộ lịch học sang Google Calendar (Stub tạo cấu trúc sự kiện)
 * 
 * API Test:
 * POST /api/calendar/sync
 * Body: { "scheduleId": "..." }
 */
exports.sync = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scheduleId } = req.body;

    const integ = await GoogleIntegration.findOne({ user: userId }).select('+accessToken +refreshToken');
    if (!integ || !integ.accessToken) {
      return res.status(400).json({ success: false, message: 'Chưa kết nối Google. Gọi /api/calendar/connect trước.' });
    }

    const schedule = await StudySchedule.findOne({ _id: scheduleId, user: userId });
    if (!schedule) return res.status(404).json({ success: false, message: 'Không tìm thấy schedule' });

    // Stub: chuyển items -> events structure
    const events = schedule.items.map((it, idx) => ({
      summary: `${schedule.title} - ${it.focus || 'Study'}`,
      dayOfWeek: it.dayOfWeek,
      startTime: it.startTime,
      endTime: it.endTime,
      timezone: schedule.timezone
    }));

    // Ở bản thực, gọi Google Calendar API để tạo/update events ở đây
    schedule.googleCalendar = schedule.googleCalendar || {};
    schedule.googleCalendar.calendarId = integ.calendarId || 'primary';
    schedule.googleCalendar.eventIds = events.map((_, i) => `stub-event-${Date.now()}-${i}`);
    schedule.googleCalendar.lastSyncedAt = new Date();
    await schedule.save();

    return res.status(200).json({ success: true, syncedEvents: events, calendar: schedule.googleCalendar });
  } catch (error) {
    console.error('Lỗi sync Calendar:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};


