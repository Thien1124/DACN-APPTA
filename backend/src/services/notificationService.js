const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendNotificationEmail } = require('./emailService');

/**
 * Tạo thông báo mới
 * @param {Object} params
 * @param {String|Array} params.userId - ID của user hoặc array của userIds
 * @param {String} params.type - Loại thông báo (enum)
 * @param {String} params.title - Tiêu đề
 * @param {String} params.message - Nội dung
 * @param {Object} params.data - Dữ liệu bổ sung
 * @param {String} params.priority - LOW | NORMAL | HIGH | URGENT
 * @param {Boolean} params.sendEmail - Có gửi email không
 * @param {String} params.actionUrl - URL để redirect
 * @param {Date} params.expiresAt - Thời gian hết hạn
 */
const createNotification = async ({
  userId,
  type,
  title,
  message,
  data = null,
  priority = 'NORMAL',
  sendEmail = false,
  actionUrl = null,
  expiresAt = null
}) => {
  try {
    // Nếu userId là array, tạo nhiều notifications
    const userIds = Array.isArray(userId) ? userId : [userId];

    const notifications = [];

    for (const uid of userIds) {
      const notification = new Notification({
        userId: uid,
        type,
        title,
        message,
        data,
        priority,
        channels: {
          inApp: true,
          email: sendEmail
        },
        actionUrl,
        expiresAt
      });

      await notification.save();
      notifications.push(notification);

      // Gửi email nếu được yêu cầu
      if (sendEmail) {
        try {
          const user = await User.findById(uid).select('email name');
          if (user && user.email) {
            await sendNotificationEmail({
              to: user.email,
              name: user.name,
              title,
              message,
              actionUrl
            });

            notification.channels.emailSent = true;
            notification.channels.emailSentAt = new Date();
            await notification.save();

            console.log(`📧 Email notification sent to ${user.email}`);
          }
        } catch (emailError) {
          console.error('❌ Failed to send notification email:', emailError);
        }
      }

      console.log(`🔔 Notification created: ${type} for user ${uid}`);
    }

    return notifications.length === 1 ? notifications[0] : notifications;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

/**
 * Gửi thông báo hoàn thành bài test
 */
const sendTestCompletedNotification = async ({ userId, testId, testName, score, passed }) => {
  const type = passed ? 'TEST_PASSED' : 'TEST_FAILED';
  const icon = passed ? '🎉' : '📝';
  
  return createNotification({
    userId,
    type,
    title: passed ? 'Chúc mừng! Bạn đã vượt qua bài test!' : 'Kết quả bài test',
    message: `${icon} ${testName} - Điểm: ${score}%. ${passed ? 'Xuất sắc!' : 'Hãy tiếp tục cố gắng!'}`,
    data: {
      testId,
      testName,
      score,
      passed
    },
    priority: 'HIGH',
    sendEmail: true,
    actionUrl: `/tests/${testId}/results`
  });
};

/**
 * Gửi thông báo hoàn thành bài học
 */
const sendLessonCompletedNotification = async ({ userId, lessonId, lessonName, courseId }) => {
  return createNotification({
    userId,
    type: 'LESSON_COMPLETED',
    title: 'Hoàn thành bài học!',
    message: `✅ Bạn đã hoàn thành: ${lessonName}`,
    data: {
      lessonId,
      lessonName,
      courseId
    },
    priority: 'NORMAL',
    sendEmail: false,
    actionUrl: `/lessons/${lessonId}`
  });
};

/**
 * Gửi thông báo hoàn thành khóa học
 */
const sendCourseCompletedNotification = async ({ userId, courseId, courseName, completionRate }) => {
  return createNotification({
    userId,
    type: 'COURSE_COMPLETED',
    title: '🎓 Chúc mừng! Bạn đã hoàn thành khóa học!',
    message: `Bạn đã hoàn thành ${courseName} với tỷ lệ ${completionRate}%. Tuyệt vời!`,
    data: {
      courseId,
      courseName,
      completionRate
    },
    priority: 'HIGH',
    sendEmail: true,
    actionUrl: `/courses/${courseId}/certificate`
  });
};

/**
 * Gửi thông báo đạt achievement
 */
const sendAchievementUnlockedNotification = async ({ userId, achievementId, achievementName, description }) => {
  return createNotification({
    userId,
    type: 'ACHIEVEMENT_UNLOCKED',
    title: '🏆 Mở khóa thành tích mới!',
    message: `Chúc mừng! Bạn đã đạt được: ${achievementName} - ${description}`,
    data: {
      achievementId,
      achievementName,
      description
    },
    priority: 'HIGH',
    sendEmail: false,
    actionUrl: `/profile/achievements`
  });
};

/**
 * Gửi thông báo lên cấp độ
 */
const sendLevelUpNotification = async ({ userId, oldLevel, newLevel, rewards }) => {
  return createNotification({
    userId,
    type: 'LEVEL_UP',
    title: '⬆️ Lên cấp độ!',
    message: `Chúc mừng! Bạn đã lên cấp ${newLevel}! ${rewards ? `Phần thưởng: ${rewards}` : ''}`,
    data: {
      oldLevel,
      newLevel,
      rewards
    },
    priority: 'HIGH',
    sendEmail: true,
    actionUrl: `/profile`
  });
};

/**
 * Gửi thông báo cập nhật hệ thống
 */
const sendSystemUpdateNotification = async ({ title, message, userIds = 'all', priority = 'NORMAL' }) => {
  // Nếu userIds === 'all', gửi cho tất cả users
  if (userIds === 'all') {
    const users = await User.find({ isActive: true }).select('_id');
    userIds = users.map(u => u._id);
  }

  return createNotification({
    userId: userIds,
    type: 'SYSTEM_UPDATE',
    title,
    message,
    priority,
    sendEmail: priority === 'HIGH' || priority === 'URGENT',
    actionUrl: '/updates'
  });
};

/**
 * Gửi thông báo nhắc nhở học tập
 */
const sendStudyReminderNotification = async ({ userId, message = 'Đã đến giờ học rồi! 📚' }) => {
  return createNotification({
    userId,
    type: 'STUDY_REMINDER',
    title: '⏰ Nhắc nhở học tập',
    message,
    priority: 'NORMAL',
    sendEmail: true,
    actionUrl: '/dashboard',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Hết hạn sau 24h
  });
};

/**
 * Gửi thông báo chào mừng (sau khi đăng ký)
 */
const sendWelcomeNotification = async ({ userId, userName }) => {
  return createNotification({
    userId,
    type: 'WELCOME',
    title: `👋 Chào mừng ${userName} đến với English Master!`,
    message: 'Chúng tôi rất vui khi bạn tham gia. Hãy bắt đầu hành trình học tiếng Anh của bạn ngay hôm nay!',
    priority: 'HIGH',
    sendEmail: true,
    actionUrl: '/getting-started'
  });
};

/**
 * Đánh dấu đã đọc
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    userId: userId
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification.markAsRead();
};

/**
 * Đánh dấu tất cả đã đọc
 */
const markAllAsRead = async (userId) => {
  return Notification.updateMany(
    { userId: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

/**
 * Xóa notification
 */
const deleteNotification = async (notificationId, userId) => {
  return Notification.findOneAndDelete({
    _id: notificationId,
    userId: userId
  });
};

/**
 * Xóa tất cả notifications đã đọc
 */
const deleteReadNotifications = async (userId) => {
  return Notification.deleteMany({
    userId: userId,
    isRead: true
  });
};

module.exports = {
  createNotification,
  sendTestCompletedNotification,
  sendLessonCompletedNotification,
  sendCourseCompletedNotification,
  sendAchievementUnlockedNotification,
  sendLevelUpNotification,
  sendSystemUpdateNotification,
  sendStudyReminderNotification,
  sendWelcomeNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications
};