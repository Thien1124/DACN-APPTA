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
     ('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
     ('✅ Connected!\n');

    // 1. Lấy deck đầu tiên
     ('1️⃣ Getting first deck...');
    const deck = await Deck.findOne({ isPublic: true });
    if (!deck) {
       ('❌ No public deck found. Please seed data first.');
      return;
    }
     (`✅ Found deck: ${deck.title} (ID: ${deck._id})\n`);

    // 2. Lấy users để test
     ('2️⃣ Getting test users...');
    const users = await User.find().limit(3);
    if (users.length === 0) {
       ('❌ No users found. Please create users first.');
      return;
    }
     (`✅ Found ${users.length} users\n`);

    // 3. Xóa reviews cũ (nếu có)
     ('3️⃣ Cleaning old reviews...');
    await DeckReview.deleteMany({ deck: deck._id });
     ('✅ Cleaned!\n');

    // 4. Tạo reviews mẫu
     ('4️⃣ Creating sample reviews...');
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
       (`   ✅ Review ${i + 1}: ${review.rating} stars by ${users[i].fullName}`);
    }
     ('');

    // 5. Check deck rating updated
     ('5️⃣ Checking deck rating...');
    const updatedDeck = await Deck.findById(deck._id);
     (`   Rating: ${updatedDeck.rating.toFixed(2)} (${updatedDeck.ratingCount} reviews)`);
     ('');

    // 6. Test helpful votes
     ('6️⃣ Testing helpful votes...');
    const review1 = reviews[0];
    review1.helpfulUsers.push(users[1]._id);
    review1.helpfulCount = 1;
    await review1.save();
     (`   ✅ User 2 marked Review 1 as helpful`);
     (`   Helpful count: ${review1.helpfulCount}\n`);

    // 7. Get rating distribution
     ('7️⃣ Rating distribution:');
    const allReviews = await DeckReview.find({ deck: deck._id });
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    allReviews.forEach(r => distribution[r.rating]++);
     (distribution);
     ('');

    // 8. Get sample flashcards
     ('8️⃣ Getting sample flashcards...');
    const flashcards = await Flashcard.find({ deck: deck._id }).limit(3);
     (`   Found ${flashcards.length} flashcards`);
    flashcards.forEach((card, i) => {
       (`   ${i + 1}. ${card.front} - ${card.back}`);
    });
     ('');

     ('✅ All tests completed!\n');

    // Summary
     ('📊 SUMMARY:');
     (`   Deck: ${deck.title}`);
     (`   Total Reviews: ${allReviews.length}`);
     (`   Average Rating: ${updatedDeck.rating.toFixed(2)}`);
     (`   Sample Cards: ${flashcards.length}`);
     ('');

     ('🔗 Test API with:');
     (`   GET http://localhost:1124/api/decks/${deck._id}/preview`);
     (`   GET http://localhost:1124/api/decks/${deck._id}/reviews`);
     ('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
     ('👋 Disconnected from MongoDB');
  }
}

// Run test
testDeckReviews();
