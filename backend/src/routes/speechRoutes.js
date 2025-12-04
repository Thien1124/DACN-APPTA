const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const speechService = require('../services/speechService');

// ✅ Config multer để upload audio
const storage = multer.memoryStorage();
const audioUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

/**
 * @route   POST /api/speech/analyze-speaking
 * @desc    Analyze pronunciation for speaking exercise
 * @access  Private
 */
router.post(
  '/analyze-speaking',
  protect,
  audioUpload.single('audio'),
  async (req, res) => {
    try {
      const { targetText } = req.body;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng upload file audio'
        });
      }
      
      if (!targetText) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu targetText'
        });
      }
      
      const audioBuffer = req.file.buffer;
      
       ('🎤 Analyzing speech:', {
        userId: req.user._id,
        targetText,
        audioSize: audioBuffer.length,
        mimeType: req.file.mimetype
      });
      
      // ✅ Gọi service để phân tích
      const result = await speechService.analyzeSpeaking(
        audioBuffer,
        targetText,
        {
          userId: req.user._id,
          language: 'en-US'
        }
      );
      
       ('📊 Analysis result:', result);
      
      res.json({
        success: true,
        analysis: {
          pronunciationScore: result.pronunciationScore,
          accuracyScore: result.accuracyScore,
          fluencyScore: result.fluencyScore,
          completenessScore: result.completenessScore,
          passed: result.pronunciationScore >= 50,
          transcription: result.transcription,
          expectedText: targetText,
          confidence: result.confidence,
          match: result.match,
          overallFeedback: generateFeedback(result.pronunciationScore),
          detailedFeedback: result.detailedFeedback || []
        }
      });
      
    } catch (error) {
      console.error('❌ Analyze speaking error:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi phân tích giọng nói: ' + error.message
      });
    }
  }
);

// Helper function
function generateFeedback(score) {
  if (score >= 90) return 'Xuất sắc! Phát âm rất tốt! 🎉';
  if (score >= 70) return 'Tốt lắm! Tiếp tục luyện tập. 👍';
  if (score >= 50) return 'Khá tốt, nhưng vẫn cần cải thiện. 💪';
  return 'Cần luyện tập thêm. Hãy nghe kỹ và phát âm lại. 📚';
}

module.exports = router;
