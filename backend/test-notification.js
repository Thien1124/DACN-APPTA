const mongoose = require('mongoose');
require('dotenv').config();
const { sendTestCompletedNotification } = require('./src/services/notificationService');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Thay YOUR_USER_ID bằng ID thật
    await sendTestCompletedNotification({
      userId: '678b6b0a05974b4f88424816',
      testId: 'test123',
      testName: 'Grammar Test Level 1',
      score: 85,
      passed: true
    });

    console.log('✅ Test notification sent');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });