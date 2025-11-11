const mongoose = require('mongoose');

/**
 * StudySchedule - Lịch học tuần/tháng (Task 21)
 */
const scheduleItemSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0-6 (Sun-Sat)
    min: 0,
    max: 6,
    required: true
  },
  startTime: {
    type: String, // HH:mm
    required: true
  },
  endTime: {
    type: String, // HH:mm
    required: true
  },
  focus: {
    type: String // ví dụ: vocab, grammar, listening
  },
  notes: {
    type: String
  }
}, { _id: false });

const studyScheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  title: {
    type: String,
    default: 'Weekly Study Plan'
  },

  timezone: {
    type: String,
    default: 'Asia/Ho_Chi_Minh'
  },

  pattern: {
    type: String, // weekly | monthly
    enum: ['weekly', 'monthly'],
    default: 'weekly'
  },

  items: [scheduleItemSchema],

  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },

  // Google Calendar sync
  googleCalendar: {
    calendarId: { type: String },
    eventIds: [{ type: String }],
    lastSyncedAt: { type: Date }
  },

  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

studyScheduleSchema.index({ user: 1, isActive: 1 });

const StudySchedule = mongoose.model('StudySchedule', studyScheduleSchema);

module.exports = StudySchedule;


