/**
 * Script tạo sample speaking videos để test
 * Run: node backend/scripts/seedSpeakingVideos.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const SpeakingVideo = require('../src/models/SpeakingVideo');
const User = require('../src/models/User');

const sampleVideos = [
  {
    title: "Basic English Greetings - Hello & Goodbye",
    description: "Learn how to greet people in English with common phrases like Hello, Hi, Good morning, and Goodbye.",
    videoUrl: "https://www.youtube.com/watch?v=0rHaWja-LqI",
    duration: 45,
    level: "beginner",
    category: "conversation",
    practiceMode: "sentence",
    thumbnailUrl: "https://img.youtube.com/vi/0rHaWja-LqI/maxresdefault.jpg",
    sentences: [
      { order: 0, english: "Hello! How are you today?", vietnamese: "Xin chào! Hôm nay bạn thế nào?", startTime: 0, endTime: 3 },
      { order: 1, english: "I'm fine, thank you.", vietnamese: "Tôi khỏe, cảm ơn bạn.", startTime: 3, endTime: 5 },
      { order: 2, english: "Good morning!", vietnamese: "Chào buổi sáng!", startTime: 6, endTime: 8 },
      { order: 3, english: "Good afternoon!", vietnamese: "Chào buổi chiều!", startTime: 9, endTime: 11 },
      { order: 4, english: "Good evening!", vietnamese: "Chào buổi tối!", startTime: 12, endTime: 14 },
      { order: 5, english: "Goodbye!", vietnamese: "Tạm biệt!", startTime: 15, endTime: 17 },
      { order: 6, english: "See you later!", vietnamese: "Hẹn gặp lại!", startTime: 18, endTime: 20 },
      { order: 7, english: "Have a nice day!", vietnamese: "Chúc bạn một ngày tốt lành!", startTime: 21, endTime: 24 }
    ],
    order: 1
  },
  {
    title: "Introducing Yourself in English",
    description: "Practice introducing yourself with name, age, and where you're from.",
    videoUrl: "https://www.youtube.com/watch?v=KpJYFFmh1tE",
    duration: 60,
    level: "beginner",
    category: "conversation",
    practiceMode: "sentence",
    thumbnailUrl: "https://img.youtube.com/vi/KpJYFFmh1tE/maxresdefault.jpg",
    sentences: [
      { order: 0, english: "My name is John.", vietnamese: "Tên tôi là John.", startTime: 0, endTime: 3 },
      { order: 1, english: "I am twenty years old.", vietnamese: "Tôi hai mươi tuổi.", startTime: 4, endTime: 7 },
      { order: 2, english: "I am from New York.", vietnamese: "Tôi đến từ New York.", startTime: 8, endTime: 11 },
      { order: 3, english: "Nice to meet you.", vietnamese: "Rất vui được gặp bạn.", startTime: 12, endTime: 15 },
      { order: 4, english: "What is your name?", vietnamese: "Tên bạn là gì?", startTime: 16, endTime: 19 },
      { order: 5, english: "Where are you from?", vietnamese: "Bạn đến từ đâu?", startTime: 20, endTime: 23 }
    ],
    order: 2
  },
  {
    title: "Ordering Food at a Restaurant",
    description: "Learn phrases for ordering food, asking for the menu, and paying the bill.",
    videoUrl: "https://www.youtube.com/watch?v=4NkSouTUPWo",
    duration: 75,
    level: "intermediate",
    category: "conversation",
    practiceMode: "sentence",
    thumbnailUrl: "https://img.youtube.com/vi/4NkSouTUPWo/maxresdefault.jpg",
    sentences: [
      { order: 0, english: "Hello, I would like to order some food.", vietnamese: "Xin chào, tôi muốn gọi đồ ăn.", startTime: 0, endTime: 4 },
      { order: 1, english: "Can I see the menu please?", vietnamese: "Cho tôi xem thực đơn được không?", startTime: 5, endTime: 8 },
      { order: 2, english: "I'll have a burger and fries.", vietnamese: "Tôi sẽ gọi một cái burger và khoai tây chiên.", startTime: 9, endTime: 13 },
      { order: 3, english: "Could I get a glass of water?", vietnamese: "Cho tôi một cốc nước được không?", startTime: 14, endTime: 18 },
      { order: 4, english: "How much is the bill?", vietnamese: "Hóa đơn bao nhiêu tiền?", startTime: 19, endTime: 22 },
      { order: 5, english: "Thank you very much!", vietnamese: "Cảm ơn bạn rất nhiều!", startTime: 23, endTime: 26 }
    ],
    order: 3
  },
  {
    title: "Daily Routines Vocabulary",
    description: "Describe your daily routine from waking up to going to bed.",
    videoUrl: "https://www.youtube.com/watch?v=eUXkj6j6Ezw",
    duration: 90,
    level: "beginner",
    category: "vocabulary",
    practiceMode: "sentence",
    thumbnailUrl: "https://img.youtube.com/vi/eUXkj6j6Ezw/maxresdefault.jpg",
    sentences: [
      { order: 0, english: "I wake up at seven o'clock.", vietnamese: "Tôi thức dậy lúc bảy giờ.", startTime: 0, endTime: 4 },
      { order: 1, english: "I brush my teeth and take a shower.", vietnamese: "Tôi đánh răng và tắm.", startTime: 5, endTime: 9 },
      { order: 2, english: "I have breakfast at eight.", vietnamese: "Tôi ăn sáng lúc tám giờ.", startTime: 10, endTime: 14 },
      { order: 3, english: "I go to work at nine.", vietnamese: "Tôi đi làm lúc chín giờ.", startTime: 15, endTime: 19 },
      { order: 4, english: "I come home at six.", vietnamese: "Tôi về nhà lúc sáu giờ.", startTime: 20, endTime: 24 },
      { order: 5, english: "I have dinner with my family.", vietnamese: "Tôi ăn tối cùng gia đình.", startTime: 25, endTime: 29 },
      { order: 6, english: "I go to bed at ten.", vietnamese: "Tôi đi ngủ lúc mười giờ.", startTime: 30, endTime: 34 }
    ],
    order: 4
  },
  {
    title: "Making Small Talk - Weather",
    description: "Learn casual conversation about weather, a common topic for small talk.",
    videoUrl: "https://www.youtube.com/watch?v=u7HwMn7XL1c",
    duration: 60,
    level: "intermediate",
    category: "conversation",
    practiceMode: "sentence",
    thumbnailUrl: "https://img.youtube.com/vi/u7HwMn7XL1c/maxresdefault.jpg",
    sentences: [
      { order: 0, english: "What's the weather like today?", vietnamese: "Thời tiết hôm nay thế nào?", startTime: 0, endTime: 4 },
      { order: 1, english: "It's sunny and warm.", vietnamese: "Trời nắng và ấm.", startTime: 5, endTime: 8 },
      { order: 2, english: "I think it might rain later.", vietnamese: "Tôi nghĩ trời sẽ mưa sau.", startTime: 9, endTime: 13 },
      { order: 3, english: "The temperature is about twenty-five degrees.", vietnamese: "Nhiệt độ khoảng hai mươi lăm độ.", startTime: 14, endTime: 19 },
      { order: 4, english: "It's a beautiful day, isn't it?", vietnamese: "Một ngày đẹp trời phải không?", startTime: 20, endTime: 24 },
      { order: 5, english: "Yes, perfect weather for a walk.", vietnamese: "Đúng vậy, thời tiết hoàn hảo để đi dạo.", startTime: 25, endTime: 29 }
    ],
    order: 5
  }
];

const seedSpeakingVideos = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.error('❌ Admin user not found! Please create an admin user first.');
      process.exit(1);
    }

    console.log(`✅ Found admin: ${adminUser.email}`);

    // Delete existing videos
    const deleteResult = await SpeakingVideo.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing videos`);

    // Create new videos
    const videosWithUploader = sampleVideos.map(video => {
      // Generate transcript from sentences
      const transcript = video.sentences.map(s => s.english).join(' ');
      
      return {
        ...video,
        transcript,
        uploadedBy: adminUser._id,
        isActive: true,
        totalAttempts: 0,
        averageScore: 0
      };
    });

    const createdVideos = await SpeakingVideo.insertMany(videosWithUploader);
    console.log(`✅ Created ${createdVideos.length} speaking videos (Cake-style with bilingual sentences)`);

    // Display summary
    console.log('\n📊 Summary by level:');
    const beginner = createdVideos.filter(v => v.level === 'beginner').length;
    const intermediate = createdVideos.filter(v => v.level === 'intermediate').length;
    const advanced = createdVideos.filter(v => v.level === 'advanced').length;
    console.log(`  - Beginner: ${beginner}`);
    console.log(`  - Intermediate: ${intermediate}`);
    console.log(`  - Advanced: ${advanced}`);

    console.log('\n📊 Summary by category:');
    const conversation = createdVideos.filter(v => v.category === 'conversation').length;
    const pronunciation = createdVideos.filter(v => v.category === 'pronunciation').length;
    const vocabulary = createdVideos.filter(v => v.category === 'vocabulary').length;
    console.log(`  - Conversation: ${conversation}`);
    console.log(`  - Pronunciation: ${pronunciation}`);
    console.log(`  - Vocabulary: ${vocabulary}`);

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n📊 Total Sentences:', createdVideos.reduce((sum, v) => sum + (v.sentences?.length || 0), 0));
    console.log('\n📍 You can now:');
    console.log('   - Admin: Visit /admin/speaking-videos');
    console.log('   - User: Visit /speaking');
    console.log('   - Test Cake-style: Click "🍰 Cake Style" button on any video');

  } catch (error) {
    console.error('❌ Error seeding videos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

// Run the seed
seedSpeakingVideos();
