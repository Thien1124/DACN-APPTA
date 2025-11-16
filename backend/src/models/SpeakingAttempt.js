const mongoose = require('mongoose');

/**
 * SpeakingAttempt Model
 * Lưu trữ các lần thử speaking của học sinh
 */
const speakingAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SpeakingVideo',
    required: true
  },
  
  audioUrl: {
    type: String,
    required: false // URL file audio học sinh thu âm (optional for Web Speech API)
  },
  
  // ========== CAKE-STYLE: Sentence-by-sentence attempts ==========
  attemptType: {
    type: String,
    enum: ['full', 'sentence'],
    default: 'sentence'
  },
  
  sentenceIndex: {
    type: Number, // Chỉ số câu (nếu là sentence practice)
    default: null
  },
  
  originalSentence: {
    type: String, // Câu tiếng Anh gốc
    default: ''
  },
  
  transcription: {
    type: String, // Văn bản nhận dạng được từ audio
    default: ''
  },
  
  accuracyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  pronunciationScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  fluencyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // So sánh chi tiết
  comparison: {
    correctWords: { type: Number, default: 0 },
    totalWords: { type: Number, default: 0 },
    missedWords: [String],
    extraWords: [String],
    similarityPercentage: { type: Number, default: 0 },
    // Cake-style: Word-level feedback
    wordScores: [{
      word: String,
      score: Number, // 0-100
      status: String // 'correct' | 'incorrect' | 'missing'
    }]
  },
  
  feedback: {
    type: String,
    default: ''
  },
  
  duration: {
    type: Number, // Thời lượng audio (giây)
    default: 0
  },
  
  xpEarned: {
    type: Number,
    default: 0
  },
  
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  }
}, {
  timestamps: true
});

// Index
speakingAttemptSchema.index({ user: 1, video: 1, createdAt: -1 });
speakingAttemptSchema.index({ user: 1, overallScore: -1 });

module.exports = mongoose.model('SpeakingAttempt', speakingAttemptSchema);
