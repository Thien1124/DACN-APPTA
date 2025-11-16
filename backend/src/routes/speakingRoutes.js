const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const speakingVideoController = require('../controllers/speakingVideoController');
const speakingAttemptController = require('../controllers/speakingAttemptController');
const cakeSpeakingController = require('../controllers/cakeSpeakingController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../../uploads/speaking');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer cho audio upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'speaking-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|ogg|webm|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file audio: mp3, wav, ogg, webm, m4a'));
    }
  }
});

// ========== VIDEO ROUTES ==========

// Admin routes
router.post('/videos', protect, authorize('admin'), speakingVideoController.createSpeakingVideo);
router.get('/videos/admin', protect, authorize('admin'), speakingVideoController.getAllVideosForAdmin);
router.put('/videos/:id', protect, authorize('admin'), speakingVideoController.updateSpeakingVideo);
router.delete('/videos/:id', protect, authorize('admin'), speakingVideoController.deleteSpeakingVideo);

// User routes
router.get('/videos', protect, speakingVideoController.getAllVideosForUser);
router.get('/videos/:id', protect, speakingVideoController.getVideoById);
router.get('/videos/:id/attempts', protect, speakingVideoController.getUserAttempts);

// ========== ATTEMPT ROUTES ==========

// User routes
router.post('/attempts', protect, upload.single('audio'), speakingAttemptController.submitSpeakingAttempt);
router.get('/attempts/my-attempts', protect, speakingAttemptController.getMyAttempts);
router.get('/attempts/:id', protect, speakingAttemptController.getAttemptResult);

// Admin routes
router.get('/attempts/admin/all', protect, authorize('admin'), speakingAttemptController.getAllAttemptsForAdmin);

// ========== CAKE-STYLE ROUTES ==========

// Admin: Create video with sentences
router.post('/cake/create-with-sentences', protect, authorize('admin'), cakeSpeakingController.createVideoWithSentences);

// User: Submit sentence practice
router.post('/cake/submit-sentence', protect, upload.single('audio'), cakeSpeakingController.submitSentencePractice);

// User: Save local attempt (Web Speech API)
router.post('/cake/save-local-attempt', protect, cakeSpeakingController.saveLocalAttempt);

// User: Get video progress
router.get('/cake/progress/:videoId', protect, cakeSpeakingController.getVideoProgress);

module.exports = router;
