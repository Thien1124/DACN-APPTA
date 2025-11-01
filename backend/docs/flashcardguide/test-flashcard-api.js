/**
 * Test Flashcard Study System
 * File này chứa các ví dụ test API bằng fetch/axios
 */

const API_URL = 'http://localhost:1124/api';
let authToken = ''; // Lấy sau khi login

// ==================== 1. AUTHENTICATION ====================

async function login() {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  authToken = data.data.token;
  console.log('✅ Logged in, token:', authToken);
  return authToken;
}

// ==================== 2. BROWSE DECKS ====================

async function browseDecks() {
  const response = await fetch(`${API_URL}/decks/browse?category=ACADEMIC&level=B1&sort=popular&limit=10`);
  const data = await response.json();
  console.log('📚 Browse Decks:', data);
  return data.data.decks;
}

async function getFeaturedDecks() {
  const response = await fetch(`${API_URL}/decks/featured?limit=5`);
  const data = await response.json();
  console.log('⭐ Featured Decks:', data);
  return data.data;
}

async function getCategories() {
  const response = await fetch(`${API_URL}/decks/categories`);
  const data = await response.json();
  console.log('📂 Categories:', data);
  return data.data;
}

// ==================== 3. START STUDY SESSION ====================

async function startStudySession(deckId) {
  const response = await fetch(`${API_URL}/study/sessions/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      deckId: deckId,
      studyMode: 'TYPE_IN', // FLIP | TYPE_IN | MULTIPLE_CHOICE | MIXED
      sessionType: 'LEARN_NEW', // LEARN_NEW | REVIEW | PRACTICE | TEST
      cardLimit: 10
    })
  });
  
  const data = await response.json();
  console.log('🎮 Session Started:', data);
  return data.data;
}

// ==================== 4. SUBMIT ANSWERS ====================

async function submitAnswer(sessionId, flashcardId, userAnswer, isCorrect) {
  const response = await fetch(`${API_URL}/study/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      flashcardId: flashcardId,
      userAnswer: userAnswer,
      correct: isCorrect,
      skipped: false,
      responseTime: 5, // seconds
      quality: isCorrect ? 4 : 2 // 0-5 rating
    })
  });
  
  const data = await response.json();
  console.log('✅ Answer Submitted:', data);
  return data.data;
}

// ==================== 5. COMPLETE SESSION ====================

async function completeSession(sessionId) {
  const response = await fetch(`${API_URL}/study/sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  console.log('🎉 Session Completed:', data);
  return data.data;
}

// ==================== 6. GET PROGRESS & STATS ====================

async function getDeckProgress(deckId) {
  const response = await fetch(`${API_URL}/study/progress/${deckId}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  console.log('📊 Deck Progress:', data);
  return data.data;
}

async function getStudyStats() {
  const response = await fetch(`${API_URL}/study/stats`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  const data = await response.json();
  console.log('📈 Study Stats:', data);
  return data.data;
}

// ==================== 7. FULL STUDY FLOW ====================

async function fullStudyFlow() {
  try {
    // 1. Login
    console.log('\n=== Step 1: Login ===');
    await login();
    
    // 2. Browse decks
    console.log('\n=== Step 2: Browse Decks ===');
    const decks = await browseDecks();
    const selectedDeck = decks[0];
    console.log('Selected Deck:', selectedDeck.title);
    
    // 3. Start session
    console.log('\n=== Step 3: Start Study Session ===');
    const session = await startStudySession(selectedDeck._id);
    const sessionId = session.session.sessionId;
    const flashcards = session.flashcards;
    
    // 4. Study cards (simulate)
    console.log('\n=== Step 4: Studying Cards ===');
    for (let i = 0; i < flashcards.length; i++) {
      const card = flashcards[i];
      console.log(`\nCard ${i + 1}/${flashcards.length}`);
      console.log(`Front: ${card.front}`);
      console.log(`Back: ${card.back}`);
      
      // Simulate user answer (50% correct for demo)
      const isCorrect = Math.random() > 0.5;
      const userAnswer = isCorrect ? card.back : 'wrong answer';
      
      await submitAnswer(sessionId, card._id, userAnswer, isCorrect);
      console.log(`Answer: ${isCorrect ? '✅ Correct' : '❌ Wrong'}`);
      
      // Wait 1 second between cards
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 5. Complete session
    console.log('\n=== Step 5: Complete Session ===');
    const result = await completeSession(sessionId);
    
    console.log('\n🎉 Study Session Complete!');
    console.log(`Score: ${result.session.score}%`);
    console.log(`XP Earned: ${result.session.xpEarned}`);
    console.log(`Duration: ${result.session.duration}s`);
    console.log(`Max Streak: ${result.session.maxStreak}`);
    
    // 6. Check progress
    console.log('\n=== Step 6: Check Progress ===');
    await getDeckProgress(selectedDeck._id);
    await getStudyStats();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ==================== EXPORT FOR NODE.JS ====================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    login,
    browseDecks,
    getFeaturedDecks,
    getCategories,
    startStudySession,
    submitAnswer,
    completeSession,
    getDeckProgress,
    getStudyStats,
    fullStudyFlow
  };
}

// ==================== RUN TEST ====================

// Uncomment to run:
// fullStudyFlow();

console.log(`
╔════════════════════════════════════════════════════════════╗
║  Flashcard Study System - Test Examples                   ║
╚════════════════════════════════════════════════════════════╝

📝 Available functions:
   - login()
   - browseDecks()
   - getFeaturedDecks()
   - getCategories()
   - startStudySession(deckId)
   - submitAnswer(sessionId, flashcardId, userAnswer, isCorrect)
   - completeSession(sessionId)
   - getDeckProgress(deckId)
   - getStudyStats()
   - fullStudyFlow() 👈 Run full demo

💡 Usage:
   1. Update API_URL if needed
   2. Run: node test-flashcard-api.js
   3. Or import functions and use in your code

🚀 Quick Start:
   Uncomment fullStudyFlow() at the end of this file and run!
`);
