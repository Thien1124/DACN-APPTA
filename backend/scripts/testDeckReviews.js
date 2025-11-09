/**
 * Test script cho Task 17: Deck Preview & Reviews
 * Chạy: node scripts/testDeckReviews.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Deck = require('../src/models/Deck');
const DeckReview = require('../src/models/DeckReview');
const User = require('../src/models/User');
const Flashcard = require('../src/models/Flashcard');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/english-master';

async function testDeckReviews() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    // 1. Lấy deck đầu tiên
    console.log('1️⃣ Getting first deck...');
    const deck = await Deck.findOne({ isPublic: true });
    if (!deck) {
      console.log('❌ No public deck found. Please seed data first.');
      return;
    }
    console.log(`✅ Found deck: ${deck.title} (ID: ${deck._id})\n`);

    // 2. Lấy users để test
    console.log('2️⃣ Getting test users...');
    const users = await User.find().limit(3);
    if (users.length === 0) {
      console.log('❌ No users found. Please create users first.');
      return;
    }
    console.log(`✅ Found ${users.length} users\n`);

    // 3. Xóa reviews cũ (nếu có)
    console.log('3️⃣ Cleaning old reviews...');
    await DeckReview.deleteMany({ deck: deck._id });
    console.log('✅ Cleaned!\n');

    // 4. Tạo reviews mẫu
    console.log('4️⃣ Creating sample reviews...');
    const reviews = [];
    
    for (let i = 0; i < users.length; i++) {
      const review = await DeckReview.create({
        deck: deck._id,
        user: users[i]._id,
        rating: 5 - i, // 5, 4, 3
        comment: `Review ${i + 1}: ${['Excellent!', 'Very good!', 'Good deck!'][i]}`,
        aspects: {
          content: 5 - i,
          difficulty: 4,
          organization: 5
        }
      });
      reviews.push(review);
      console.log(`   ✅ Review ${i + 1}: ${review.rating} stars by ${users[i].fullName}`);
    }
    console.log('');

    // 5. Check deck rating updated
    console.log('5️⃣ Checking deck rating...');
    const updatedDeck = await Deck.findById(deck._id);
    console.log(`   Rating: ${updatedDeck.rating.toFixed(2)} (${updatedDeck.ratingCount} reviews)`);
    console.log('');

    // 6. Test helpful votes
    console.log('6️⃣ Testing helpful votes...');
    const review1 = reviews[0];
    review1.helpfulUsers.push(users[1]._id);
    review1.helpfulCount = 1;
    await review1.save();
    console.log(`   ✅ User 2 marked Review 1 as helpful`);
    console.log(`   Helpful count: ${review1.helpfulCount}\n`);

    // 7. Get rating distribution
    console.log('7️⃣ Rating distribution:');
    const allReviews = await DeckReview.find({ deck: deck._id });
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(r => distribution[r.rating]++);
    console.log(distribution);
    console.log('');

    // 8. Get sample flashcards
    console.log('8️⃣ Getting sample flashcards...');
    const flashcards = await Flashcard.find({ deck: deck._id }).limit(3);
    console.log(`   Found ${flashcards.length} flashcards`);
    flashcards.forEach((card, i) => {
      console.log(`   ${i + 1}. ${card.front} - ${card.back}`);
    });
    console.log('');

    console.log('✅ All tests completed!\n');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Deck: ${deck.title}`);
    console.log(`   Total Reviews: ${allReviews.length}`);
    console.log(`   Average Rating: ${updatedDeck.rating.toFixed(2)}`);
    console.log(`   Sample Cards: ${flashcards.length}`);
    console.log('');

    console.log('🔗 Test API with:');
    console.log(`   GET http://localhost:1124/api/decks/${deck._id}/preview`);
    console.log(`   GET http://localhost:1124/api/decks/${deck._id}/reviews`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run test
testDeckReviews();
