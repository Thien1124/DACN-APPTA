const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const typeRacerController = require('../controllers/typeRacerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// ✅ Public route for TypeRacer (không cần admin)
router.get('/typeracer/random', protect, typeRacerController.getRandomForTypeRacer);

// Tất cả routes đều yêu cầu đăng nhập và quyền admin
router.use(protect);
router.use(authorize('admin'));

// ✅ Đặt route template TRƯỚC route :id
router.get('/template', exerciseController.downloadExcelTemplate);

// Routes chính
router
  .route('/')
  .get(exerciseController.getAllExercises)
  .post(exerciseController.createExercise);

// ✅ Import route
router.post(
  '/import',
  upload.single('file'),
  exerciseController.importExercisesFromExcel
);

// Bulk create route
router.post('/bulk', exerciseController.createBulkExercises);

// ✅ Route :id ở cuối
router
  .route('/:id')
  .get(exerciseController.getExerciseById)
  .put(exerciseController.updateExercise)
  .delete(exerciseController.deleteExercise);

module.exports = router;