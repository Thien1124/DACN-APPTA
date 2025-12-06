const mongoose = require('mongoose');
require('dotenv').config();
const Exercise = require('../src/models/Exercise');

const sampleExercises = [
  {
    question: 'Họ thích thể thao',
    type: 'translate_build',
    correctAnswer: 'They,like,sports',
    difficulty: 'easy',
    points: 10
  },
  {
    question: 'Tôi đang học tiếng Anh',
    type: 'translate_build',
    correctAnswer: 'I,am,learning,English',
    difficulty: 'easy',
    points: 10
  },
  {
    question: 'Cô ấy là một giáo viên',
    type: 'translate_build',
    correctAnswer: 'She,is,a,teacher',
    difficulty: 'easy',
    points: 10
  },
  {
    question: 'Chúng tôi sống ở Việt Nam',
    type: 'translate_build',
    correctAnswer: 'We,live,in,Vietnam',
    difficulty: 'easy',
    points: 10
  },
  {
    question: 'Anh ấy thích đọc sách',
    type: 'translate_build',
    correctAnswer: 'He,likes,reading,books',
    difficulty: 'easy',
    points: 10
  },
  {
    question: 'Tôi có một con mèo',
    type: 'translate_build',
    correctAnswer: 'I,have,a,cat',
    difficulty: 'easy',
    points: 10
  },
  {
    question: 'Bạn có thể nói tiếng Anh không?',
    type: 'translate_build',
    correctAnswer: 'Can,you,speak,English',
    difficulty: 'medium',
    points: 15
  },
  {
    question: 'Tôi muốn uống nước',
    type: 'translate_build',
    correctAnswer: 'I,want,to,drink,water',
    difficulty: 'easy',
    points: 10
  },
  {
    question: 'Họ đang chơi bóng đá',
    type: 'translate_build',
    correctAnswer: 'They,are,playing,soccer',
    difficulty: 'medium',
    points: 15
  },
  {
    question: 'Cô ấy có mái tóc dài',
    type: 'translate_build',
    correctAnswer: 'She,has,long,hair',
    difficulty: 'easy',
    points: 10
  },
  {
    question: 'Chúng tôi yêu gia đình',
    type: 'translate_build',
    correctAnswer: 'We,love,our,family',
    difficulty: 'easy',
    points: 10
  },
  {
    question: 'Anh ấy làm việc ở văn phòng',
    type: 'translate_build',
    correctAnswer: 'He,works,in,an,office',
    difficulty: 'medium',
    points: 15
  },
  {
    question: 'Tôi thức dậy lúc 7 giờ',
    type: 'translate_build',
    correctAnswer: 'I,wake,up,at,seven',
    difficulty: 'medium',
    points: 15
  },
  {
    question: 'Bạn có khỏe không?',
    type: 'translate_build',
    correctAnswer: 'Are,you,okay',
    difficulty: 'easy',
    points: 10
  },
  {
    question: 'Chúng ta đi ăn tối nào',
    type: 'translate_build',
    correctAnswer: 'Let,us,have,dinner',
    difficulty: 'medium',
    points: 15
  }
];

const seedTypeRacerExercises = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa các exercises cũ có type = translate_build
    await Exercise.deleteMany({ type: 'translate_build' });
    console.log('🗑️  Deleted old translate_build exercises');

    // Thêm exercises mới
    const created = await Exercise.insertMany(sampleExercises);
    console.log(`✅ Created ${created.length} translate_build exercises`);

    console.log('\n📋 Sample exercises:');
    created.slice(0, 3).forEach(ex => {
      console.log(`   - ${ex.question} → ${ex.correctAnswer.split(',').join(' ')}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedTypeRacerExercises();
