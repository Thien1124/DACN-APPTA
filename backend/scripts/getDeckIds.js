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
     ('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
     ('✅ Connected!\n');

     ('📦 Getting all public decks...\n');
    const decks = await Deck.find({ isPublic: true })
      .select('_id title category level totalCards')
      .limit(10);

    if (decks.length === 0) {
       ('❌ No public decks found!');
       ('💡 Run: node scripts/seedFlashcards.js');
      return;
    }

     (`✅ Found ${decks.length} public decks:\n`);
    
    decks.forEach((deck, index) => {
       (`${index + 1}. ${deck.title}`);
       (`   ID: ${deck._id}`);
       (`   Category: ${deck.category} | Level: ${deck.level}`);
       (`   Cards: ${deck.totalCards}`);
       (`   Preview URL: http://localhost:1124/api/decks/${deck._id}/preview`);
       ('');
    });

     ('🧪 TEST URLS FOR POSTMAN:\n');
     ('Preview:');
     (`GET http://localhost:1124/api/decks/${decks[0]._id}/preview\n`);
    
     ('Reviews:');
     (`GET http://localhost:1124/api/decks/${decks[0]._id}/reviews\n`);
    
     ('Create Review (need token):');
     (`POST http://localhost:1124/api/decks/${decks[0]._id}/reviews`);
     ('Body: { "rating": 5, "comment": "Great deck!" }\n');

  } catch (error) {
  } finally {
    await mongoose.disconnect();
     ('👋 Disconnected');
  }
}

getDeckIds();
