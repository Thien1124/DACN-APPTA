const SpeakingVideo = require('../models/SpeakingVideo');
const SpeakingAttempt = require('../models/SpeakingAttempt');
const User = require('../models/User');
const { logAudit, getIpAddress, getUserAgent } = require('../services/auditService');
const speechService = require('../services/speechService');
const stringSimilarity = require('string-similarity');

/**
 * ========== CAKE-STYLE SPEAKING PRACTICE ==========
 * Luyện speaking theo từng câu với phụ đề song ngữ
 */

/**
 * Tính toán điểm cho từng câu (Cake-style)
 */
const calculateSentenceScore = (originalSentence, transcribedSentence) => {
  if (!originalSentence || !transcribedSentence) {
    return { 
      score: 0, 
      details: { correctWords: 0, totalWords: 0, wordScores: [] } 
    };
  }

  // Chuẩn hóa văn bản
  const normalize = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const originalNorm = normalize(originalSentence);
  const transcribedNorm = normalize(transcribedSentence);

  const originalWords = originalNorm.split(' ');
  const transcribedWords = transcribedNorm.split(' ');

  // Tính similarity tổng thể
  const similarity = stringSimilarity.compareTwoStrings(originalNorm, transcribedNorm);
  
  // Tính điểm từng từ (Cake-style word-level scoring)
  const wordScores = originalWords.map((word, index) => {
    const transcribedWord = transcribedWords[index];
    
    if (!transcribedWord) {
      return { word, score: 0, status: 'missing' };
    }
    
    // So sánh từ
    const wordSimilarity = stringSimilarity.compareTwoStrings(word, transcribedWord);
    const score = Math.round(wordSimilarity * 100);
    
    return {
      word,
      score,
      status: score >= 80 ? 'correct' : score >= 50 ? 'partial' : 'incorrect'
    };
  });

  // Đếm từ đúng
  const correctWords = wordScores.filter(w => w.status === 'correct').length;
  const accuracyScore = Math.round((correctWords / originalWords.length) * 100);

  return {
    score: accuracyScore,
    details: {
      correctWords,
      totalWords: originalWords.length,
      similarityPercentage: Math.round(similarity * 100),
      wordScores
    }
  };
};

/**
 * Tạo feedback cho câu (Cake-style)
 */
const generateSentenceFeedback = (score) => {
  if (score >= 95) {
    return '🎉 Perfect! Phát âm xuất sắc!';
  } else if (score >= 85) {
    return '👏 Excellent! Rất tốt!';
  } else if (score >= 70) {
    return '👍 Good! Khá tốt, hãy tiếp tục!';
  } else if (score >= 50) {
    return '💪 Keep trying! Cố gắng thêm nhé!';
  } else {
    return '📚 Try again! Hãy nghe lại và thử lại!';
  }
};

/**
 * User: Submit bài speaking cho 1 câu (Cake-style)
 * POST /api/speaking/cake/submit-sentence
 */
const submitSentencePractice = async (req, res) => {
  try {
    const { videoId, sentenceIndex } = req.body;

    // Validation
    if (!videoId || sentenceIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp videoId và sentenceIndex'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload file audio'
      });
    }

    // Kiểm tra video tồn tại
    const video = await SpeakingVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    // Kiểm tra sentence index hợp lệ
    if (!video.sentences || sentenceIndex >= video.sentences.length) {
      return res.status(400).json({
        success: false,
        message: 'Sentence index không hợp lệ'
      });
    }

    const sentence = video.sentences[sentenceIndex];
    const audioUrl = `/uploads/speaking/${req.file.filename}`;

    // Tạo attempt với trạng thái processing
    const attempt = await SpeakingAttempt.create({
      user: req.user._id,
      video: videoId,
      audioUrl,
      attemptType: 'sentence',
      sentenceIndex,
      originalSentence: sentence.english,
      status: 'processing'
    });

    // Xử lý async - không block response
    processSentenceAudio(attempt._id, req.file.path, sentence.english);

    res.status(201).json({
      success: true,
      message: 'Đang xử lý audio của bạn...',
      data: { attemptId: attempt._id }
    });
  } catch (error) {
    console.error('[ERROR] Submit sentence practice:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi submit bài speaking'
    });
  }
};

/**
 * Xử lý audio cho 1 câu (async)
 */
const processSentenceAudio = async (attemptId, audioPath, originalSentence) => {
  try {
    console.log(`[INFO] Processing sentence audio for attempt ${attemptId}`);

    // 1. Transcribe audio
    const transcriptionResult = await speechService.transcribeAudio(audioPath);
    
    if (!transcriptionResult.success) {
      throw new Error('Transcription failed');
    }

    const transcription = transcriptionResult.text;
    const duration = transcriptionResult.duration || 0;

    // 2. Tính điểm cho câu (Cake-style)
    const scoreResult = calculateSentenceScore(originalSentence, transcription);

    // 3. Tính các điểm khác
    const accuracyScore = scoreResult.score;
    const pronunciationScore = Math.min(100, accuracyScore + Math.floor(Math.random() * 10));
    const fluencyScore = Math.max(50, Math.min(100, accuracyScore + Math.floor(Math.random() * 15)));

    // 4. Tính overall score
    const overallScore = Math.round(
      (accuracyScore * 0.5) +  // 50% accuracy
      (pronunciationScore * 0.3) + // 30% pronunciation
      (fluencyScore * 0.2)  // 20% fluency
    );

    // 5. Tính XP (thấp hơn vì chỉ 1 câu)
    const xpEarned = Math.max(5, Math.round(overallScore / 5));

    // 6. Generate feedback
    const feedback = generateSentenceFeedback(overallScore);

    // 7. Update attempt
    const attempt = await SpeakingAttempt.findByIdAndUpdate(
      attemptId,
      {
        transcription,
        accuracyScore,
        pronunciationScore,
        fluencyScore,
        overallScore,
        comparison: {
          ...scoreResult.details,
          missedWords: scoreResult.details.wordScores
            .filter(w => w.status === 'missing')
            .map(w => w.word),
          extraWords: []
        },
        feedback,
        duration,
        xpEarned,
        status: 'completed'
      },
      { new: true }
    );

    // 8. Award XP to user
    await User.findByIdAndUpdate(
      attempt.user,
      { $inc: { xp: xpEarned } }
    );

    console.log(`[SUCCESS] Processed sentence attempt ${attemptId} - Score: ${overallScore}`);
  } catch (error) {
    console.error('[ERROR] Process sentence audio:', error);
    
    // Update attempt status to failed
    await SpeakingAttempt.findByIdAndUpdate(attemptId, {
      status: 'failed',
      feedback: 'Không thể xử lý audio. Vui lòng thử lại.'
    });
  }
};

/**
 * User: Lấy progress cho video (Cake-style)
 * GET /api/speaking/cake/progress/:videoId
 */
const getVideoProgress = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await SpeakingVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    // Lấy tất cả attempts của user cho video này
    const attempts = await SpeakingAttempt.find({
      user: req.user._id,
      video: videoId,
      attemptType: 'sentence',
      status: 'completed'
    }).sort({ sentenceIndex: 1, createdAt: -1 });

    // Tạo progress map: sentenceIndex -> best attempt
    const progressMap = {};
    attempts.forEach(attempt => {
      const index = attempt.sentenceIndex;
      if (!progressMap[index] || attempt.overallScore > progressMap[index].overallScore) {
        progressMap[index] = {
          sentenceIndex: index,
          bestScore: attempt.overallScore,
          attemptId: attempt._id,
          completed: true,
          stars: attempt.overallScore >= 90 ? 3 : attempt.overallScore >= 75 ? 2 : 1
        };
      }
    });

    // Tạo array progress cho tất cả sentences
    const sentenceProgress = video.sentences.map((sentence, index) => ({
      sentenceIndex: index,
      english: sentence.english,
      vietnamese: sentence.vietnamese,
      completed: !!progressMap[index],
      bestScore: progressMap[index]?.bestScore || 0,
      stars: progressMap[index]?.stars || 0
    }));

    // Tính overall progress
    const completedSentences = Object.keys(progressMap).length;
    const totalSentences = video.sentences.length;
    const overallProgress = Math.round((completedSentences / totalSentences) * 100);
    const averageScore = completedSentences > 0
      ? Math.round(Object.values(progressMap).reduce((sum, p) => sum + p.bestScore, 0) / completedSentences)
      : 0;

    res.json({
      success: true,
      data: {
        videoId,
        videoTitle: video.title,
        sentenceProgress,
        stats: {
          totalSentences,
          completedSentences,
          overallProgress,
          averageScore
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Get video progress:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy tiến độ'
    });
  }
};

/**
 * Admin: Tạo video với sentences (Cake-style)
 * POST /api/speaking/cake/create-with-sentences
 */
const createVideoWithSentences = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      videoUrl, 
      sentences, // Array of { english, vietnamese, startTime, endTime }
      duration, 
      level, 
      category, 
      thumbnailUrl, 
      order 
    } = req.body;

    // Validation
    if (!title || !videoUrl || !sentences || !Array.isArray(sentences) || sentences.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ: title, videoUrl, sentences'
      });
    }

    // Validate sentences
    for (let i = 0; i < sentences.length; i++) {
      if (!sentences[i].english || !sentences[i].vietnamese) {
        return res.status(400).json({
          success: false,
          message: `Câu ${i + 1} thiếu english hoặc vietnamese`
        });
      }
    }

    // Tạo transcript từ sentences
    const transcript = sentences.map(s => s.english).join(' ');

    // Add order to sentences
    const sentencesWithOrder = sentences.map((s, index) => ({
      order: index,
      english: s.english.trim(),
      vietnamese: s.vietnamese.trim(),
      startTime: s.startTime || 0,
      endTime: s.endTime || 0
    }));

    const video = await SpeakingVideo.create({
      title,
      description,
      videoUrl,
      transcript,
      sentences: sentencesWithOrder,
      duration: duration || 0,
      level: level || 'beginner',
      category: category || 'conversation',
      practiceMode: 'sentence', // Cake-style
      thumbnailUrl: thumbnailUrl || '',
      order: order || 0,
      uploadedBy: req.user._id
    });

    await logAudit({
      userId: req.user._id,
      action: 'CREATE_CAKE_SPEAKING_VIDEO',
      status: 'SUCCESS',
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      details: { videoId: video._id, title, sentenceCount: sentences.length }
    });

    res.status(201).json({
      success: true,
      message: 'Tạo video Cake-style thành công',
      data: { video }
    });
  } catch (error) {
    console.error('[ERROR] Create video with sentences:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo video'
    });
  }
};

/**
 * User: Lưu kết quả local scoring (từ Web Speech API)
 * POST /api/speaking/cake/save-local-attempt
 */
const saveLocalAttempt = async (req, res) => {
  try {
    const {
      videoId,
      sentenceIndex,
      originalSentence,
      transcription,
      accuracyScore,
      pronunciationScore,
      fluencyScore,
      overallScore,
      comparison,
      feedback
    } = req.body;

    // Validation
    if (!videoId || sentenceIndex === undefined || !transcription) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }

    // Ensure the request is authenticated (we need a user to associate the attempt)
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Vui lòng đăng nhập để lưu kết quả'
      });
    }

    // Kiểm tra video tồn tại
    const video = await SpeakingVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy video'
      });
    }

    // Tính XP
    const xpEarned = Math.max(5, Math.round(overallScore / 5));

    // Tạo attempt
    const attempt = await SpeakingAttempt.create({
      user: req.user._id,
      video: videoId,
      attemptType: 'sentence',
      sentenceIndex,
      originalSentence: originalSentence || video.sentences[sentenceIndex]?.english || '',
      audioUrl: '', // Không có audio file vì dùng Web Speech API
      transcription,
      accuracyScore: accuracyScore || 0,
      pronunciationScore: pronunciationScore || 0,
      fluencyScore: fluencyScore || 0,
      overallScore: overallScore || 0,
      comparison: comparison || {},
      feedback: feedback || '',
      xpEarned,
      duration: 0,
      status: 'completed'
    });

    // Award XP to user
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { xp: xpEarned } }
    );

    // Update video stats
    await SpeakingVideo.findByIdAndUpdate(videoId, {
      $inc: { totalAttempts: 1 }
    });

    // Log audit (non-blocking)
    try {
      await logAudit({
        userId: req.user._id,
        action: 'COMPLETE_CAKE_SENTENCE',
        status: 'SUCCESS',
        ipAddress: getIpAddress(req),
        userAgent: getUserAgent(req),
        details: { 
          videoId, 
          sentenceIndex, 
          score: overallScore,
          xpEarned 
        }
      });
    } catch (auditError) {
      console.warn('[WARN] Audit log failed:', auditError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Lưu kết quả thành công',
      data: { 
        attempt,
        xpEarned
      }
    });
  } catch (error) {
    console.error('[ERROR] Save local attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lưu kết quả'
    });
  }
};

module.exports = {
  submitSentencePractice,
  getVideoProgress,
  createVideoWithSentences,
  saveLocalAttempt
};
