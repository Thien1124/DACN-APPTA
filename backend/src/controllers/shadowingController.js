const shadowingService = require('../services/shadowingService');
const multer = require('multer');
const path = require('path');

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/shadowing/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'recording-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /webm|ogg|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file audio!'));
    }
  }
}).single('audio');

/**
 * ===============================================
 * EXERCISE MANAGEMENT
 * ===============================================
 */

/**
 * Create new shadowing exercise
 * @route   POST /api/shadowing/exercises
 * @access  Private
 */
exports.createExercise = async (req, res) => {
  try {
    const exerciseData = req.body;
    const exercise = await shadowingService.createExercise(req.user._id, exerciseData);
    
    res.status(201).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error('Create exercise error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi tạo bài tập'
    });
  }
};

/**
 * Get exercise by ID
 * @route   GET /api/shadowing/exercises/:exerciseId
 * @access  Private
 */
exports.getExercise = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const exercise = await shadowingService.getExerciseById(exerciseId);
    
    // Check access permission
    if (!exercise.isPublic && exercise.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập bài tập này'
      });
    }
    
    res.json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error('Get exercise error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy bài tập'
    });
  }
};

/**
 * Get exercises by deck
 * @route   GET /api/shadowing/exercises/deck/:deckId
 * @access  Private
 */
exports.getExercisesByDeck = async (req, res) => {
  try {
    const { deckId } = req.params;
    const exercises = await shadowingService.getExercisesByDeck(deckId, req.user._id);
    
    res.json({
      success: true,
      data: exercises
    });
  } catch (error) {
    console.error('Get exercises by deck error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài tập'
    });
  }
};

/**
 * Get user's exercises
 * @route   GET /api/shadowing/exercises
 * @access  Private
 */
exports.getUserExercises = async (req, res) => {
  try {
    const options = {
      difficulty: req.query.difficulty,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };
    
    const result = await shadowingService.getUserExercises(req.user._id, options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get user exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách bài tập'
    });
  }
};

/**
 * Update exercise
 * @route   PUT /api/shadowing/exercises/:exerciseId
 * @access  Private
 */
exports.updateExercise = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const updates = req.body;
    
    const exercise = await shadowingService.updateExercise(
      exerciseId,
      req.user._id,
      updates
    );
    
    res.json({
      success: true,
      data: exercise
    });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật bài tập'
    });
  }
};

/**
 * Delete exercise
 * @route   DELETE /api/shadowing/exercises/:exerciseId
 * @access  Private
 */
exports.deleteExercise = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const result = await shadowingService.deleteExercise(exerciseId, req.user._id);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi xóa bài tập'
    });
  }
};

/**
 * ===============================================
 * ATTEMPT MANAGEMENT
 * ===============================================
 */

/**
 * Start new attempt
 * @route   POST /api/shadowing/exercises/:exerciseId/start
 * @access  Private
 */
exports.startAttempt = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { playbackSpeed } = req.body;
    
    const result = await shadowingService.startAttempt(
      req.user._id,
      exerciseId,
      { playbackSpeed }
    );
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Start attempt error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi bắt đầu luyện tập'
    });
  }
};

/**
 * Update playback speed
 * @route   PUT /api/shadowing/attempts/:attemptId/speed
 * @access  Private
 */
exports.updateSpeed = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { speed } = req.body;
    
    if (!speed || speed < 0.5 || speed > 2.0) {
      return res.status(400).json({
        success: false,
        message: 'Tốc độ phải từ 0.5x đến 2.0x'
      });
    }
    
    const result = await shadowingService.updatePlaybackSpeed(
      attemptId,
      req.user._id,
      speed
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Update speed error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi cập nhật tốc độ'
    });
  }
};

/**
 * Set A-B repeat markers
 * @route   POST /api/shadowing/attempts/:attemptId/ab-repeat
 * @access  Private
 */
exports.setABRepeat = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { startTime, endTime } = req.body;
    
    if (startTime === undefined || endTime === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin startTime hoặc endTime'
      });
    }
    
    const result = await shadowingService.setABRepeat(
      attemptId,
      req.user._id,
      startTime,
      endTime
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Set A-B repeat error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi thiết lập A-B repeat'
    });
  }
};

/**
 * Clear A-B repeat
 * @route   DELETE /api/shadowing/attempts/:attemptId/ab-repeat
 * @access  Private
 */
exports.clearABRepeat = async (req, res) => {
  try {
    const { attemptId } = req.params;
    
    const result = await shadowingService.clearABRepeat(attemptId, req.user._id);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Clear A-B repeat error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi xóa A-B repeat'
    });
  }
};

/**
 * Submit recording
 * @route   POST /api/shadowing/attempts/:attemptId/record
 * @access  Private
 */
exports.submitRecording = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    try {
      const { attemptId } = req.params;
      const { segmentIndex } = req.body;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu file audio'
        });
      }
      
      // Read audio file
      const fs = require('fs').promises;
      const audioBuffer = await fs.readFile(req.file.path);
      
      const result = await shadowingService.submitRecording(
        attemptId,
        req.user._id,
        audioBuffer,
        segmentIndex ? parseInt(segmentIndex) : null
      );
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Submit recording error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Lỗi khi phân tích bản ghi âm'
      });
    }
  });
};

/**
 * Complete attempt
 * @route   POST /api/shadowing/attempts/:attemptId/complete
 * @access  Private
 */
exports.completeAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { timeSpent } = req.body;
    
    const result = await shadowingService.completeAttempt(
      attemptId,
      req.user._id,
      timeSpent
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Complete attempt error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Lỗi khi hoàn thành luyện tập'
    });
  }
};

/**
 * Get attempt by ID
 * @route   GET /api/shadowing/attempts/:attemptId
 * @access  Private
 */
exports.getAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await shadowingService.getAttemptById(attemptId, req.user._id);
    
    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    console.error('Get attempt error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Không tìm thấy lượt luyện tập'
    });
  }
};

/**
 * Get user's attempts
 * @route   GET /api/shadowing/attempts
 * @access  Private
 */
exports.getUserAttempts = async (req, res) => {
  try {
    const options = {
      exerciseId: req.query.exerciseId,
      status: req.query.status,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };
    
    const result = await shadowingService.getUserAttempts(req.user._id, options);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get user attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử luyện tập'
    });
  }
};

/**
 * ===============================================
 * STATISTICS & PROGRESS
 * ===============================================
 */

/**
 * Get user statistics
 * @route   GET /api/shadowing/stats
 * @access  Private
 */
exports.getStats = async (req, res) => {
  try {
    const options = {
      exerciseId: req.query.exerciseId,
      startDate: req.query.startDate
    };
    
    const stats = await shadowingService.getUserStats(req.user._id, options);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê'
    });
  }
};

/**
 * Get progress over time
 * @route   GET /api/shadowing/progress
 * @access  Private
 */
exports.getProgress = async (req, res) => {
  try {
    const { exerciseId } = req.query;
    
    const progress = await shadowingService.getProgressOverTime(
      req.user._id,
      exerciseId || null
    );
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy tiến độ'
    });
  }
};
