const SpeakingAttempt = require('../models/SpeakingAttempt');
const SpeakingVideo = require('../models/SpeakingVideo');
const User = require('../models/User');
const { logAudit, getIpAddress, getUserAgent } = require('../services/auditService');
const speechService = require('../services/speechService');
const stringSimilarity = require('string-similarity');

/**
 * Tính toán độ chính xác giữa 2 văn bản
 */
const calculateAccuracy = (original, transcribed) => {
  if (!original || !transcribed) return { score: 0, details: {} };

  // Chuẩn hóa văn bản
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Bỏ dấu câu
      .replace(/\s+/g, ' ')
      .trim();
  };

  const originalNorm = normalizeText(original);
  const transcribedNorm = normalizeText(transcribed);

  const originalWords = originalNorm.split(' ');
  const transcribedWords = transcribedNorm.split(' ');

  // Tính similarity
  const similarity = stringSimilarity.compareTwoStrings(originalNorm, transcribedNorm);
  const similarityPercentage = Math.round(similarity * 100);

  // Tìm từ đúng, sai, thiếu
  const correctWords = transcribedWords.filter(word => originalWords.includes(word));
  const missedWords = originalWords.filter(word => !transcribedWords.includes(word));
  const extraWords = transcribedWords.filter(word => !originalWords.includes(word));

  const accuracyScore = Math.round((correctWords.length / originalWords.length) * 100);

  return {
    score: accuracyScore,
    details: {
      correctWords: correctWords.length,
      totalWords: originalWords.length,
      missedWords: missedWords.slice(0, 10), // Giới hạn 10 từ
      extraWords: extraWords.slice(0, 10),
      similarityPercentage
    }
  };
};

/**
 * Tạo feedback dựa trên điểm số
 */
const generateFeedback = (overallScore) => {
  if (overallScore >= 90) {
    return '🎉 Xuất sắc! Phát âm của bạn rất tốt, gần như hoàn hảo!';
  } else if (overallScore >= 75) {
    return '👏 Tốt lắm! Bạn đã phát âm khá chính xác, hãy tiếp tục luyện tập!';
  } else if (overallScore >= 60) {
    return '💪 Khá tốt! Còn một số từ cần cải thiện, hãy thử lại nhé!';
  } else if (overallScore >= 40) {
    return '📚 Cần luyện tập thêm. Hãy nghe kỹ và phát âm từ từng từ!';
  } else {
    return '🎯 Hãy nghe video nhiều lần trước khi thu âm, đừng bỏ cuộc!';
  }
};

/**
 * User: Submit bài speaking
 * POST /api/speaking-attempts
 */
const submitSpeakingAttempt = async (req, res) => {
  try {
    const { videoId } = req.body;

    // Validation
    if (!videoId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp videoId'
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

    // Lưu audio URL
    const audioUrl = `/uploads/speaking/${req.file.filename}`;

    // Tạo attempt với trạng thái processing
    const attempt = await SpeakingAttempt.create({
      user: req.user._id,
      video: videoId,
      audioUrl,
      status: 'processing'
    });

    // Xử lý async - không block response
    processAudio(attempt._id, req.file.path, video.transcript);

    res.status(201).json({
      success: true,
      message: 'Đang xử lý audio của bạn...',
      data: { attemptId: attempt._id }
    });
  } catch (error) {
    console.error('[ERROR] Submit speaking attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi submit bài speaking'
    });
  }
};

/**
 * Xử lý audio và tính điểm (async)
 */
const processAudio = async (attemptId, audioPath, originalTranscript) => {
  try {
     (`[INFO] Processing audio for attempt ${attemptId}`);

    // 1. Transcribe audio
    const transcriptionResult = await speechService.transcribeAudio(audioPath);
    
    if (!transcriptionResult.success) {
      throw new Error('Transcription failed');
    }

    const transcription = transcriptionResult.text;
    const duration = transcriptionResult.duration || 0;

    // 2. Tính toán độ chính xác
    const accuracyResult = calculateAccuracy(originalTranscript, transcription);

    // 3. Tính điểm pronunciation và fluency (giả lập - có thể tích hợp API chuyên dụng)
    const pronunciationScore = Math.min(100, accuracyResult.score + Math.floor(Math.random() * 10));
    const fluencyScore = Math.max(50, Math.min(100, accuracyResult.score + Math.floor(Math.random() * 15)));

    // 4. Tính overall score
    const overallScore = Math.round(
      (accuracyResult.score * 0.4) + 
      (pronunciationScore * 0.3) + 
      (fluencyScore * 0.3)
    );

    // 5. Tính XP earned
    const xpEarned = Math.max(10, Math.round(overallScore / 2));

    // 6. Generate feedback
    const feedback = generateFeedback(overallScore);

    // 7. Update attempt
    const attempt = await SpeakingAttempt.findByIdAndUpdate(
      attemptId,
      {
        transcription,
        accuracyScore: accuracyResult.score,
        pronunciationScore,
        fluencyScore,
        overallScore,
        comparison: accuracyResult.details,
        feedback,
        duration,
        xpEarned,
        status: 'completed'
      },
      { new: true }
    );

    // 8. Update video statistics
    await updateVideoStatistics(attempt.video);

    // 9. Award XP to user
    await User.findByIdAndUpdate(
      attempt.user,
      { $inc: { xp: xpEarned } }
    );

     (`[SUCCESS] Processed attempt ${attemptId} - Score: ${overallScore}`);
  } catch (error) {
    console.error('[ERROR] Process audio:', error);
    
    // Update attempt status to failed
    await SpeakingAttempt.findByIdAndUpdate(attemptId, {
      status: 'failed',
      feedback: 'Không thể xử lý audio. Vui lòng thử lại.'
    });
  }
};

/**
 * Cập nhật thống kê video
 */
const updateVideoStatistics = async (videoId) => {
  try {
    const attempts = await SpeakingAttempt.find({
      video: videoId,
      status: 'completed'
    });

    if (attempts.length === 0) return;

    const totalAttempts = attempts.length;
    const totalScore = attempts.reduce((sum, att) => sum + att.overallScore, 0);
    const averageScore = Math.round(totalScore / totalAttempts);

    await SpeakingVideo.findByIdAndUpdate(videoId, {
      totalAttempts,
      averageScore
    });
  } catch (error) {
    console.error('[ERROR] Update video statistics:', error);
  }
};

/**
 * User: Lấy kết quả attempt
 * GET /api/speaking-attempts/:id
 */
const getAttemptResult = async (req, res) => {
  try {
    const { id } = req.params;

    const attempt = await SpeakingAttempt.findById(id)
      .populate('video', 'title transcript videoUrl')
      .populate('user', 'name avatar');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy attempt'
      });
    }

    // Check quyền xem
    if (attempt.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem attempt này'
      });
    }

    res.json({
      success: true,
      data: { attempt }
    });
  } catch (error) {
    console.error('[ERROR] Get attempt result:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy kết quả'
    });
  }
};

/**
 * User: Lấy lịch sử attempts của mình
 * GET /api/speaking-attempts/my-attempts
 */
const getMyAttempts = async (req, res) => {
  try {
    const { page = 1, limit = 10, videoId } = req.query;

    const filter = { 
      user: req.user._id,
      status: 'completed'
    };
    
    if (videoId) {
      filter.video = videoId;
    }

    const attempts = await SpeakingAttempt.find(filter)
      .populate('video', 'title thumbnailUrl level category')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SpeakingAttempt.countDocuments(filter);

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Get my attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy lịch sử'
    });
  }
};

/**
 * Admin: Lấy tất cả attempts
 * GET /api/speaking-attempts/admin/all
 */
const getAllAttemptsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, videoId, userId } = req.query;

    const filter = { status: 'completed' };
    if (videoId) filter.video = videoId;
    if (userId) filter.user = userId;

    const attempts = await SpeakingAttempt.find(filter)
      .populate('user', 'name email avatar')
      .populate('video', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SpeakingAttempt.countDocuments(filter);

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('[ERROR] Get all attempts for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách attempts'
    });
  }
};

module.exports = {
  submitSpeakingAttempt,
  getAttemptResult,
  getMyAttempts,
  getAllAttemptsForAdmin
};
