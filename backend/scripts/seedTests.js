const mongoose = require('mongoose');
require('dotenv').config();
const Test = require('../src/models/Test');
const Exercise = require('../src/models/Exercise');
const User = require('../src/models/User');
const Lesson = require('../src/models/Lesson');

const seedTests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
     ('[SUCCESS] Connected to MongoDB');

    // Tìm admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('[ERROR] No admin user found. Please create admin first.');
      process.exit(1);
    }

     ('[INFO] Found admin:', admin.email);

    // Tìm hoặc tạo lesson mẫu
    let lesson = await Lesson.findOne();
    if (!lesson) {
       ('[INFO] No lesson found, creating sample lesson...');
      
      // Tạo lesson đơn giản (cần biết Lesson schema)
      lesson = await Lesson.create({
        title: 'Basic English - Sample Lesson',
        description: 'Auto-generated lesson for test exercises',
        order: 1
        // Thêm các fields bắt buộc khác nếu có
      });
      
       ('[SUCCESS] Created sample lesson:', lesson._id);
    } else {
       ('[INFO] Using existing lesson:', lesson._id);
    }

    // Xóa dữ liệu cũ
    await Exercise.deleteMany({});
    await Test.deleteMany({});
     ('[INFO] Cleared old data');

    // Tạo exercises mẫu (đúng format theo schema)
    const exercises = await Exercise.insertMany([
      // Exercise 1: Multiple choice
      {
        question: 'What is the opposite of "hot"?',
        type: 'multiple-choice',
        options: [
          { text: 'cold', isCorrect: true },
          { text: 'warm', isCorrect: false },
          { text: 'cool', isCorrect: false },
          { text: 'freezing', isCorrect: false }
        ],
        explanation: 'The opposite of hot is cold.',
        lesson: lesson._id,
        difficulty: 'easy',
        points: 10
      },
      
      // Exercise 2: Fill in blank
      {
        question: 'I ___ a student.',
        type: 'fill-in-blank',
        correctAnswer: 'am',
        explanation: 'Use "am" with "I"',
        lesson: lesson._id,
        difficulty: 'easy',
        points: 10
      },
      
      // Exercise 3: Multiple choice (grammar)
      {
        question: 'She ___ to school every day.',
        type: 'multiple-choice',
        options: [
          { text: 'go', isCorrect: false },
          { text: 'goes', isCorrect: true },
          { text: 'going', isCorrect: false },
          { text: 'gone', isCorrect: false }
        ],
        explanation: 'Use "goes" for third person singular in present simple.',
        lesson: lesson._id,
        difficulty: 'medium',
        points: 15
      },
      
      // Exercise 4: Fill in blank
      {
        question: 'They ___ playing football now.',
        type: 'fill-in-blank',
        correctAnswer: 'are',
        explanation: 'Use "are" with "they" in present continuous.',
        lesson: lesson._id,
        difficulty: 'medium',
        points: 10
      },
      
      // Exercise 5: Multiple choice
      {
        question: 'Choose the correct article: ___ apple a day keeps the doctor away.',
        type: 'multiple-choice',
        options: [
          { text: 'A', isCorrect: false },
          { text: 'An', isCorrect: true },
          { text: 'The', isCorrect: false },
          { text: 'No article', isCorrect: false }
        ],
        explanation: 'Use "an" before words starting with vowel sounds.',
        lesson: lesson._id,
        difficulty: 'easy',
        points: 10
      },
      
      // Exercise 6: Translation
      {
        question: 'Translate to English: "Tôi thích học tiếng Anh"',
        type: 'translation',
        correctAnswer: 'I like learning English',
        explanation: 'Simple present tense translation',
        lesson: lesson._id,
        difficulty: 'medium',
        points: 20
      }
    ]);

     (`[SUCCESS] Created ${exercises.length} exercises`);

    // Tạo test mẫu - ✅ ĐÃ SỬA
    const test = await Test.create({
      title: 'Basic English Test - Level A1',
      description: 'Test your basic English skills with vocabulary and grammar questions',
      type: 'PRACTICE',
      skill: 'MIXED',
      level: 'A1',
      questions: exercises.map(ex => ex._id),  // ✅ SỬA: exercises → questions
      totalQuestions: exercises.length,
      totalPoints: exercises.reduce((sum, ex) => sum + ex.points, 0),
      passingScore: 70,
      timeLimit: 600,
      isPublic: true,      // ✅ SỬA: isPublished → isPublic
      isActive: true,      // ✅ THÊM: để test hiển thị
      attempts: -1,        // ✅ SỬA: maxAttempts → attempts
      createdBy: admin._id
    });

     ('[SUCCESS] Created test:', test.title);
     ('[INFO] Test ID:', test._id);
     ('[INFO] Total exercises:', exercises.length);
     ('[INFO] Total points:', test.totalPoints);

    // Tạo test Grammar riêng - ✅ ĐÃ SỬA
    const grammarExercises = exercises.filter(ex => 
      ex.question.includes('She') || ex.question.includes('They') || ex.question.includes('I')
    );

    const grammarTest = await Test.create({
      title: 'Grammar Practice - A1',
      description: 'Focus on basic grammar rules',
      type: 'PRACTICE',
      skill: 'GRAMMAR',
      level: 'A1',
      questions: grammarExercises.map(ex => ex._id),  // ✅ SỬA: exercises → questions
      totalQuestions: grammarExercises.length,
      totalPoints: grammarExercises.reduce((sum, ex) => sum + ex.points, 0),
      passingScore: 70,
      timeLimit: 300,
      isPublic: true,      // ✅ SỬA: isPublished → isPublic
      isActive: true,      // ✅ THÊM: để test hiển thị
      attempts: -1,        // ✅ SỬA: maxAttempts → attempts
      createdBy: admin._id
    });

     ('[SUCCESS] Created grammar test:', grammarTest.title);
     ('[INFO] Grammar test ID:', grammarTest._id);

     ('\n===========================================');
     ('[SUMMARY]');
     ('===========================================');
     ('Exercises created:', exercises.length);
     ('Tests created: 2');
     ('\nTest 1:', test.title);
     ('  - ID:', test._id);
     ('  - Questions:', test.totalQuestions);
     ('  - Points:', test.totalPoints);
     ('\nTest 2:', grammarTest.title);
     ('  - ID:', grammarTest._id);
     ('  - Questions:', grammarTest.totalQuestions);
     ('  - Points:', grammarTest.totalPoints);
     ('\n===========================================');
     ('[NEXT STEPS]');
     ('===========================================');
     ('1. Get all tests:');
     ('   GET http://localhost:1124/api/tests');
     ('\n2. Start test 1:');
     ('   POST http://localhost:1124/api/tests/' + test._id + '/start');
     ('\n3. Start test 2:');
     ('   POST http://localhost:1124/api/tests/' + grammarTest._id + '/start');
     ('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Seed error:', error);
    if (error.errors) {
      console.error('[ERROR] Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

seedTests();