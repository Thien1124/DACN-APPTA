/**
 * Script để seed data cho Flashcard System
 * Chạy: node scripts/seedFlashcards.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Deck = require('../src/models/Deck');
const Flashcard = require('../src/models/Flashcard');
const User = require('../src/models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample flashcards data
const flashcardsData = {
  'IELTS_VOCABULARY_A1': [
    { front: 'hello', back: 'xin chào', example: 'Hello! How are you?', imageUrl: '', audioUrl: '' },
    { front: 'goodbye', back: 'tạm biệt', example: 'Goodbye! See you later.', imageUrl: '', audioUrl: '' },
    { front: 'thank you', back: 'cảm ơn', example: 'Thank you for your help.', imageUrl: '', audioUrl: '' },
    { front: 'please', back: 'làm ơn', example: 'Please help me.', imageUrl: '', audioUrl: '' },
    { front: 'sorry', back: 'xin lỗi', example: 'I am sorry for being late.', imageUrl: '', audioUrl: '' },
    { front: 'yes', back: 'có, vâng', example: 'Yes, I agree.', imageUrl: '', audioUrl: '' },
    { front: 'no', back: 'không', example: 'No, thank you.', imageUrl: '', audioUrl: '' },
    { front: 'help', back: 'giúp đỡ', example: 'Can you help me?', imageUrl: '', audioUrl: '' },
    { front: 'friend', back: 'bạn bè', example: 'He is my best friend.', imageUrl: '', audioUrl: '' },
    { front: 'family', back: 'gia đình', example: 'I love my family.', imageUrl: '', audioUrl: '' }
  ],
  'IELTS_VOCABULARY_B1': [
    { front: 'accomplish', back: 'hoàn thành, đạt được', example: 'She accomplished her goal of learning English.', imageUrl: '', audioUrl: '' },
    { front: 'achieve', back: 'đạt được', example: 'He achieved success through hard work.', imageUrl: '', audioUrl: '' },
    { front: 'acquire', back: 'có được, thu được', example: 'I want to acquire new skills.', imageUrl: '', audioUrl: '' },
    { front: 'adapt', back: 'thích nghi', example: 'We must adapt to changes.', imageUrl: '', audioUrl: '' },
    { front: 'analyze', back: 'phân tích', example: 'Let me analyze this problem.', imageUrl: '', audioUrl: '' },
    { front: 'apply', back: 'áp dụng', example: 'You can apply this method.', imageUrl: '', audioUrl: '' },
    { front: 'approach', back: 'tiếp cận, phương pháp', example: 'What is your approach to learning?', imageUrl: '', audioUrl: '' },
    { front: 'assess', back: 'đánh giá', example: 'We need to assess the situation.', imageUrl: '', audioUrl: '' },
    { front: 'benefit', back: 'lợi ích', example: 'What are the benefits of exercise?', imageUrl: '', audioUrl: '' },
    { front: 'challenge', back: 'thách thức', example: 'This is a big challenge for me.', imageUrl: '', audioUrl: '' }
  ],
  'BUSINESS_ENGLISH': [
    { front: 'negotiate', back: 'đàm phán', example: 'We need to negotiate the contract.', imageUrl: '', audioUrl: '' },
    { front: 'proposal', back: 'đề xuất', example: 'Please review my proposal.', imageUrl: '', audioUrl: '' },
    { front: 'deadline', back: 'hạn chót', example: 'The deadline is next Monday.', imageUrl: '', audioUrl: '' },
    { front: 'conference', back: 'hội nghị', example: 'We have a conference call at 3 PM.', imageUrl: '', audioUrl: '' },
    { front: 'agenda', back: 'chương trình họp', example: 'What is on the agenda?', imageUrl: '', audioUrl: '' },
    { front: 'revenue', back: 'doanh thu', example: 'Our revenue increased this quarter.', imageUrl: '', audioUrl: '' },
    { front: 'budget', back: 'ngân sách', example: 'We need to cut the budget.', imageUrl: '', audioUrl: '' },
    { front: 'merger', back: 'sáp nhập', example: 'The merger was successful.', imageUrl: '', audioUrl: '' },
    { front: 'strategy', back: 'chiến lược', example: 'What is your marketing strategy?', imageUrl: '', audioUrl: '' },
    { front: 'profit', back: 'lợi nhuận', example: 'The company made a profit.', imageUrl: '', audioUrl: '' }
  ],
  'TRAVEL_ENGLISH': [
    { front: 'reservation', back: 'đặt chỗ', example: 'I have a hotel reservation.', imageUrl: '', audioUrl: '' },
    { front: 'luggage', back: 'hành lý', example: 'Where is my luggage?', imageUrl: '', audioUrl: '' },
    { front: 'passport', back: 'hộ chiếu', example: 'Show me your passport, please.', imageUrl: '', audioUrl: '' },
    { front: 'itinerary', back: 'hành trình', example: 'Here is my travel itinerary.', imageUrl: '', audioUrl: '' },
    { front: 'destination', back: 'điểm đến', example: 'What is your destination?', imageUrl: '', audioUrl: '' },
    { front: 'departure', back: 'khởi hành', example: 'The departure time is 10 AM.', imageUrl: '', audioUrl: '' },
    { front: 'arrival', back: 'đến nơi', example: 'The arrival time is 5 PM.', imageUrl: '', audioUrl: '' },
    { front: 'accommodation', back: 'chỗ ở', example: 'We need to book accommodation.', imageUrl: '', audioUrl: '' },
    { front: 'tourist', back: 'khách du lịch', example: 'Many tourists visit this place.', imageUrl: '', audioUrl: '' },
    { front: 'souvenir', back: 'quà lưu niệm', example: 'I bought some souvenirs.', imageUrl: '', audioUrl: '' }
  ]
};

const seedFlashcards = async () => {
  try {
    await connectDB();

    console.log('🗑️  Cleaning existing data...');
    // await Flashcard.deleteMany({});
    // await Deck.deleteMany({});

    // Get or create admin user
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('⚠️  No admin user found. Creating one...');
      admin = await User.create({
        name: 'Admin',
        email: 'admin@englishmaster.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
      });
      console.log('✅ Admin user created');
    }

    console.log('📦 Creating decks and flashcards...');

    // Deck 1: IELTS A1
    const deck1 = await Deck.create({
      title: 'IELTS Vocabulary - Level A1',
      description: 'Từ vựng cơ bản cho người mới bắt đầu học tiếng Anh',
      category: 'ACADEMIC',
      level: 'A1',
      difficulty: 'BEGINNER',
      tags: ['IELTS', 'vocabulary', 'beginner', 'A1'],
      isPublished: true,
      isPublic: true,
      isFeatured: true,
      createdBy: admin._id,
      totalCards: flashcardsData.IELTS_VOCABULARY_A1.length
    });

    for (const cardData of flashcardsData.IELTS_VOCABULARY_A1) {
      await Flashcard.create({ ...cardData, deck: deck1._id });
    }
    console.log(`✅ Created deck: ${deck1.title} (${deck1.totalCards} cards)`);

    // Deck 2: IELTS B1
    const deck2 = await Deck.create({
      title: 'IELTS Vocabulary - Level B1',
      description: 'Từ vựng trung cấp cho kỳ thi IELTS',
      category: 'ACADEMIC',
      level: 'B1',
      difficulty: 'INTERMEDIATE',
      tags: ['IELTS', 'vocabulary', 'intermediate', 'B1'],
      isPublished: true,
      isPublic: true,
      isFeatured: true,
      createdBy: admin._id,
      totalCards: flashcardsData.IELTS_VOCABULARY_B1.length
    });

    for (const cardData of flashcardsData.IELTS_VOCABULARY_B1) {
      await Flashcard.create({ ...cardData, deck: deck2._id });
    }
    console.log(`✅ Created deck: ${deck2.title} (${deck2.totalCards} cards)`);

    // Deck 3: Business English
    const deck3 = await Deck.create({
      title: 'Business English Essentials',
      description: 'Từ vựng tiếng Anh thương mại cần thiết',
      category: 'BUSINESS',
      level: 'B2',
      difficulty: 'INTERMEDIATE',
      tags: ['business', 'vocabulary', 'professional'],
      isPublished: true,
      isPublic: true,
      isFeatured: false,
      createdBy: admin._id,
      totalCards: flashcardsData.BUSINESS_ENGLISH.length
    });

    for (const cardData of flashcardsData.BUSINESS_ENGLISH) {
      await Flashcard.create({ ...cardData, deck: deck3._id });
    }
    console.log(`✅ Created deck: ${deck3.title} (${deck3.totalCards} cards)`);

    // Deck 4: Travel English
    const deck4 = await Deck.create({
      title: 'Travel English - Survival Phrases',
      description: 'Từ vựng tiếng Anh du lịch thiết yếu',
      category: 'TRAVEL',
      level: 'A2',
      difficulty: 'BEGINNER',
      tags: ['travel', 'vocabulary', 'phrases'],
      isPublished: true,
      isPublic: true,
      isFeatured: false,
      createdBy: admin._id,
      totalCards: flashcardsData.TRAVEL_ENGLISH.length
    });

    for (const cardData of flashcardsData.TRAVEL_ENGLISH) {
      await Flashcard.create({ ...cardData, deck: deck4._id });
    }
    console.log(`✅ Created deck: ${deck4.title} (${deck4.totalCards} cards)`);

    // Summary
    const totalDecks = await Deck.countDocuments();
    const totalFlashcards = await Flashcard.countDocuments();

    console.log('\n🎉 Seed completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Total Decks: ${totalDecks}`);
    console.log(`   - Total Flashcards: ${totalFlashcards}`);
    console.log(`   - Admin User: ${admin.email}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedFlashcards();
