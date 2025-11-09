const speechService = require('../services/speechService');
const Flashcard = require('../models/Flashcard');
const Deck = require('../models/Deck');
const path = require('path');
const fs = require('fs').promises;

/**
 * Get speech exercise for a flashcard
 * GET /api/speech/exercise/:flashcardId
 */
exports.getSpeechExercise = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    
    // Verify flashcard exists and user has access
    const flashcard = await Flashcard.findById(flashcardId).populate('deck');
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard không tồn tại'
      });
    }
    
    // Check if user has access to the deck
    if (!flashcard.deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại'
      });
    }
    
    const deck = flashcard.deck;
    if (deck.createdBy && deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập deck này'
      });
    }
    
    const exercise = await speechService.getSpeechExercise(flashcardId);
    
    res.json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error('Get speech exercise error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải bài tập phát âm: ' + error.message
    });
  }
};

/**
 * Submit speech for analysis
 * POST /api/speech/analyze/:flashcardId
 * Body: audio file (multipart/form-data)
 */
exports.analyzeSpeech = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    const { language = 'en-US' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file audio'
      });
    }
    
    // Verify flashcard and access
    const flashcard = await Flashcard.findById(flashcardId).populate('deck');
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard không tồn tại'
      });
    }
    
    if (!flashcard.deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại'
      });
    }
    
    const deck = flashcard.deck;
    if (deck.createdBy && deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập deck này'
      });
    }
    
    // Get audio buffer from uploaded file
    const audioBuffer = req.file.buffer;
    
    // Save audio file
    const audioDir = path.join(__dirname, '../../uploads/speech');
    await fs.mkdir(audioDir, { recursive: true });
    
    const audioFilename = `speech_${req.user._id}_${flashcardId}_${Date.now()}.webm`;
    const audioPath = path.join(audioDir, audioFilename);
    await fs.writeFile(audioPath, audioBuffer);
    
    const userAudioUrl = `/uploads/speech/${audioFilename}`;
    
    // Analyze speech
    const analysisResult = await speechService.analyzeSpeech(
      audioBuffer,
      flashcard.front,
      {
        targetIPA: flashcard.ipa,
        language,
        userId: req.user._id,
        flashcardId,
        deckId: flashcard.deck
      }
    );
    
    // Save attempt
    const attempt = await speechService.saveSpeechAttempt(
      req.user._id,
      flashcardId,
      flashcard.deck,
      userAudioUrl,
      analysisResult
    );
    
    res.json({
      success: true,
      data: {
        attempt: {
          _id: attempt._id,
          pronunciationScore: attempt.pronunciationScore,
          fluencyScore: attempt.fluencyScore,
          accuracyScore: attempt.accuracyScore,
          completenessScore: attempt.completenessScore,
          passed: attempt.passed,
          transcription: attempt.transcription,
          confidence: attempt.confidence,
          overallFeedback: attempt.overallFeedback,
          detailedFeedback: attempt.detailedFeedback,
          wordAnalysis: attempt.wordAnalysis,
          intonation: attempt.intonation,
          userAudioUrl: attempt.userAudioUrl
        }
      }
    });
  } catch (error) {
    console.error('Analyze speech error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi phân tích giọng nói: ' + error.message
    });
  }
};

/**
 * Get speech history
 * GET /api/speech/history
 */
exports.getSpeechHistory = async (req, res) => {
  try {
    const { deckId, page = 1, limit = 20, sortBy = 'completedAt', sortOrder = 'desc' } = req.query;
    
    const skip = (page - 1) * limit;
    
    const history = await speechService.getSpeechHistory(req.user._id, {
      deckId,
      limit: parseInt(limit),
      skip,
      sortBy,
      sortOrder
    });
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get speech history error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải lịch sử phát âm: ' + error.message
    });
  }
};

/**
 * Get speech statistics
 * GET /api/speech/stats
 */
exports.getSpeechStats = async (req, res) => {
  try {
    const { deckId, startDate, endDate } = req.query;
    
    const stats = await speechService.getUserSpeechStats(req.user._id, {
      deckId,
      startDate,
      endDate
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get speech stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải thống kê phát âm: ' + error.message
    });
  }
};

/**
 * Get speech attempt detail
 * GET /api/speech/attempt/:attemptId
 */
exports.getSpeechAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const attempt = await require('../models/SpeechAttempt')
      .findOne({ _id: attemptId, user: req.user._id })
      .populate('flashcard', 'front back audioUrl ipa pronunciation')
      .populate('deck', 'name');
    
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài làm'
      });
    }
    
    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Get speech attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải chi tiết bài làm: ' + error.message
    });
  }
};

/**
 * Compare pronunciation with reference
 * POST /api/speech/compare/:flashcardId
 * Body: audio file
 */
exports.comparePronunciation = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file audio'
      });
    }
    
    const flashcard = await Flashcard.findById(flashcardId);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard không tồn tại'
      });
    }
    
    const audioBuffer = req.file.buffer;
    
    // Transcribe user audio
    const { transcription, confidence } = await speechService.transcribeAudio(audioBuffer);
    
    // Analyze pronunciation
    const analysis = speechService.analyzePronunciation(
      flashcard.front,
      transcription,
      flashcard.ipa
    );
    
    res.json({
      success: true,
      data: {
        targetText: flashcard.front,
        targetIPA: flashcard.ipa,
        transcription,
        confidence,
        ...analysis,
        referenceAudioUrl: flashcard.audioUrl
      }
    });
  } catch (error) {
    console.error('Compare pronunciation error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi so sánh phát âm: ' + error.message
    });
  }
};

/**
 * Generate TTS audio for text
 * POST /api/speech/generate-audio
 * Body: { text, language }
 */
exports.generateAudio = async (req, res) => {
  try {
    const { text, language = 'en-US' } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp text'
      });
    }
    
    const audioDir = path.join(__dirname, '../../uploads/tts');
    await fs.mkdir(audioDir, { recursive: true });
    
    const audioFilename = `tts_${Date.now()}.mp3`;
    const audioPath = path.join(audioDir, audioFilename);
    
    await speechService.generateAudio(text, language, audioPath);
    
    const audioUrl = `/uploads/tts/${audioFilename}`;
    
    res.json({
      success: true,
      data: {
        text,
        language,
        audioUrl
      }
    });
  } catch (error) {
    console.error('Generate audio error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo audio: ' + error.message
    });
  }
};

/**
 * Get batch of speech exercises for a deck
 * GET /api/speech/deck/:deckId/exercises
 */
exports.getDeckSpeechExercises = async (req, res) => {
  try {
    const { deckId } = req.params;
    const { limit = 10 } = req.query;
    
    // Verify deck access
    const deck = await Deck.findById(deckId);
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck không tồn tại'
      });
    }
    
    if (deck.createdBy && deck.createdBy.toString() !== req.user._id.toString() && !deck.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập deck này'
      });
    }
    
    // Get flashcards
    const flashcards = await Flashcard.find({ deck: deckId })
      .limit(parseInt(limit))
      .select('_id front audioUrl ipa pronunciation example');
    
    const exercises = flashcards.map(fc => ({
      flashcardId: fc._id,
      targetText: fc.front,
      targetIPA: fc.ipa,
      referenceAudioUrl: fc.audioUrl,
      pronunciation: fc.pronunciation,
      example: fc.example
    }));
    
    res.json({
      success: true,
      data: {
        deckId,
        deckName: deck.name || deck.title,
        exercises,
        total: exercises.length
      }
    });
  } catch (error) {
    console.error('Get deck speech exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải bài tập phát âm: ' + error.message
    });
  }
};
