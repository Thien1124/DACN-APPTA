/**
 * Script để lấy Deck IDs cho testing
 * Chạy: node scripts/getDeckIds.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Deck = require('../src/models/Deck');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/english-master';

async function getDeckIds() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!\n');

    console.log('📦 Getting all public decks...\n');
    const decks = await Deck.find({ isPublic: true })
      .select('_id title category level totalCards')
      .limit(10);

    if (decks.length === 0) {
      console.log('❌ No public decks found!');
      console.log('💡 Run: node scripts/seedFlashcards.js');
      return;
    }

    console.log(`✅ Found ${decks.length} public decks:\n`);
    
    decks.forEach((deck, index) => {
      console.log(`${index + 1}. ${deck.title}`);
      console.log(`   ID: ${deck._id}`);
      console.log(`   Category: ${deck.category} | Level: ${deck.level}`);
      console.log(`   Cards: ${deck.totalCards}`);
      console.log(`   Preview URL: http://localhost:1124/api/decks/${deck._id}/preview`);
      console.log('');
    });

    console.log('🧪 TEST URLS FOR POSTMAN:\n');
    console.log('Preview:');
    console.log(`GET http://localhost:1124/api/decks/${decks[0]._id}/preview\n`);
    
    console.log('Reviews:');
    console.log(`GET http://localhost:1124/api/decks/${decks[0]._id}/reviews\n`);
    
    console.log('Create Review (need token):');
    console.log(`POST http://localhost:1124/api/decks/${decks[0]._id}/reviews`);
    console.log('Body: { "rating": 5, "comment": "Great deck!" }\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected');
  }
}

getDeckIds();
