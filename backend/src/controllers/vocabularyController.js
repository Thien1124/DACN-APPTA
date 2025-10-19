const Vocabulary = require('../models/Vocabulary');

// @desc    Lấy tất cả từ vựng
// @route   GET /api/vocabularies
// @access  Private/Admin
exports.getAllVocabularies = async (req, res) => {
  try {
    const vocabularies = await Vocabulary.find()
      .sort({ createdAt: -1 })
      .populate('lesson', 'title');
    
    res.status(200).json({
      success: true,
      count: vocabularies.length,
      data: vocabularies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách từ vựng',
      error: error.message
    });
  }
};

// @desc    Lấy tất cả từ vựng theo bài học
// @route   GET /api/lessons/:lessonId/vocabularies
// @access  Private/Admin
exports.getVocabulariesByLesson = async (req, res) => {
  try {
    const vocabularies = await Vocabulary.find({ lesson: req.params.lessonId });
    
    res.status(200).json({
      success: true,
      count: vocabularies.length,
      data: vocabularies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách từ vựng theo bài học',
      error: error.message
    });
  }
};

// @desc    Lấy một từ vựng theo ID
// @route   GET /api/vocabularies/:id
// @access  Private/Admin
exports.getVocabularyById = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id)
      .populate('lesson', 'title')
      .populate({
        path: 'lesson',
        populate: {
          path: 'unit',
          select: 'title',
          populate: {
            path: 'course',
            select: 'title'
          }
        }
      });
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: vocabulary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin từ vựng',
      error: error.message
    });
  }
};

// @desc    Tạo từ vựng mới
// @route   POST /api/vocabularies
// @access  Private/Admin
exports.createVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.create(req.body);
    
    res.status(201).json({
      success: true,
      data: vocabulary
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo từ vựng',
      error: error.message
    });
  }
};

// @desc    Cập nhật từ vựng
// @route   PUT /api/vocabularies/:id
// @access  Private/Admin
exports.updateVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: vocabulary
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật từ vựng',
      error: error.message
    });
  }
};

// @desc    Xóa từ vựng
// @route   DELETE /api/vocabularies/:id
// @access  Private/Admin
exports.deleteVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.findById(req.params.id);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng với ID này'
      });
    }
    
    await vocabulary.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Từ vựng đã được xóa'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa từ vựng',
      error: error.message
    });
  }
};

// @desc    Tạo nhiều từ vựng cùng lúc
// @route   POST /api/vocabularies/bulk
// @access  Private/Admin
exports.createBulkVocabularies = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu phải là một mảng các từ vựng'
      });
    }

    const vocabularies = await Vocabulary.insertMany(req.body);
    
    res.status(201).json({
      success: true,
      count: vocabularies.length,
      data: vocabularies
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo danh sách từ vựng',
      error: error.message
    });
  }
};