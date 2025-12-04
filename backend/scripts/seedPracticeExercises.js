// backend/scripts/seedPracticeExercises.js
const mongoose = require('mongoose');
const PracticeExercise = require('../src/models/PracticeExercise');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const exercises = [
  // Multiple Choice
  {
    category: 'grammar',
    question: 'What is the plural of "mouse"?',
    type: 'multiple_choice',
    choices: ['mouses', 'mice', 'mices'],
    correctAnswer: 'mice',
    explanation: 'The plural of "mouse" is "mice" (irregular plural)',
    level: 'A2',
    difficulty: 'easy',
    points: 10
  },
  {
    category: 'grammar',
    question: 'She ___ a teacher.',
    type: 'fill_blank',
    choices: ['is', 'are', 'am'],
    correctAnswer: 'is',
    explanation: 'Use "is" with third person singular (she/he/it)',
    level: 'A1',
    difficulty: 'easy',
    points: 10
  },
  // Translate
  {
    category: 'vocabulary',
    question: 'Translate to English: "Tôi thích trà"',
    type: 'translate',
    correctAnswer: 'I like tea',
    explanation: 'Simple present tense: subject + verb + object',
    level: 'A1',
    difficulty: 'easy',
    points: 15
  },
  // Match Pairs
  {
    category: 'vocabulary',
    question: 'Match food to Vietnamese',
    type: 'match_pairs',
    left: ['Apple', 'Bread', 'Water'],
    right: ['Bánh mì', 'Nước', 'Táo'],
    correctAnswer: { 'Apple': 'Táo', 'Bread': 'Bánh mì', 'Water': 'Nước' },
    explanation: 'Match English food words with their Vietnamese translations',
    level: 'A1',
    difficulty: 'easy',
    points: 15
  },
  // Listening
  {
    category: 'listening',
    question: 'Listen and write what you hear',
    type: 'listen_write',
    audio: 'thank you',
    audioText: 'thank you',
    correctAnswer: 'thank you',
    explanation: 'Common polite expression in English',
    level: 'A1',
    difficulty: 'easy',
    points: 15
  },
  // Advanced
  {
    category: 'grammar',
    question: 'If I ___ (have) time, I will come.',
    type: 'fill_blank',
    choices: ['have', 'had', 'will have'],
    correctAnswer: 'have',
    explanation: 'First conditional: If + present simple, ... will + infinitive',
    level: 'B1',
    difficulty: 'medium',
    points: 20
  }
];

const seedExercises = async () => {
  try {
    await PracticeExercise.deleteMany({});
     ('🗑️  Deleted old exercises');

    await PracticeExercise.insertMany(exercises);
     (`✅ Seeded ${exercises.length} practice exercises`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedExercises();