const mongoose = require('mongoose');

/**
 * SpeakingVideo Model
 * Lưu trữ video speaking cho học sinh luyện tập
 */
const speakingVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  videoUrl: {
    type: String,
    required: true
  },
  
  transcript: {
    type: String,
    required: true, // Nội dung văn bản của video (để so sánh)
    trim: true
  },
  
  // ========== CAKE-STYLE: Sentence-by-sentence practice ==========
  sentences: [{
    order: { type: Number, required: true },
    english: { type: String, required: true, trim: true },
    vietnamese: { type: String, required: true, trim: true },
    startTime: { type: Number, default: 0 }, // Thời điểm câu bắt đầu trong video (giây)
    endTime: { type: Number, default: 0 }     // Thời điểm câu kết thúc
  }],
  
  duration: {
    type: Number, // Thời lượng video (giây)
    default: 0
  },
  
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  
  category: {
    type: String,
    enum: ['conversation', 'pronunciation', 'vocabulary', 'grammar', 'general'],
    default: 'general'
  },
  
  // Practice mode
  practiceMode: {
    type: String,
    enum: ['full', 'sentence'], // 'full' = thu âm toàn bộ, 'sentence' = từng câu (Cake-style)
    default: 'sentence'
  },
  
  thumbnailUrl: {
    type: String,
    default: ''
  },
  
  // Thống kê
  totalAttempts: {
    type: Number,
    default: 0
  },
  
  averageScore: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index cho tìm kiếm
speakingVideoSchema.index({ title: 'text', transcript: 'text' });
speakingVideoSchema.index({ level: 1, category: 1, isActive: 1 });

module.exports = mongoose.model('SpeakingVideo', speakingVideoSchema);
