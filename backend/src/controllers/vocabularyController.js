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

// @desc    Lấy từ vựng đã học của user (cho Worldbank)
// @route   GET /api/vocabularies/learned
// @access  Private
exports.getLearnedVocabularies = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Tìm tất cả từ vựng mà user đã học
    const vocabularies = await Vocabulary.find({
      'learnedBy.user': userId
    })
    .populate('lesson', 'title')
    .sort({ 'learnedBy.learnedAt': -1 }); // Sắp xếp theo thời gian học gần nhất
    
    // Transform data cho frontend
    const transformedVocabs = vocabularies.map(vocab => {
      const userProgress = vocab.learnedBy.find(learn => 
        learn.user.toString() === userId.toString()
      );
      
      return {
        id: vocab._id,
        word: vocab.word,
        meaning: vocab.translation, // ✅ Map translation -> meaning
        pronunciation: vocab.phonetic,
        example: vocab.example,
        exampleTranslation: vocab.exampleTranslation,
        imageUrl: vocab.imageUrl,
        audioUrl: vocab.audioUrl,
        lesson: vocab.lesson,
        difficulty: vocab.difficulty,
        isLearned: true,
        isStarred: userProgress?.starred || false, // ✅ Lấy starred từ user progress
        learnedAt: userProgress?.learnedAt,
        reviewCount: userProgress?.reviewCount || 0,
        mastery: userProgress?.mastery || 0,
        tags: [] // ✅ Có thể thêm tags sau
      };
    });
    
    res.status(200).json({
      success: true,
      count: transformedVocabs.length,
      data: transformedVocabs
    });
  } catch (error) {
    console.error('❌ Error getting learned vocabularies:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách từ vựng đã học',
      error: error.message
    });
  }
};

// @desc    Đánh dấu từ vựng đã học
// @route   POST /api/vocabularies/:id/learn
// @access  Private
exports.markAsLearned = async (req, res) => {
  try {
    const vocabId = req.params.id;
    const userId = req.user.id;
    
    const vocabulary = await Vocabulary.findById(vocabId);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng'
      });
    }
    
    // Kiểm tra đã học chưa
    const existingLearn = vocabulary.learnedBy.find(learn => 
      learn.user.toString() === userId.toString()
    );
    
    if (existingLearn) {
      return res.status(400).json({
        success: false,
        message: 'Từ vựng này đã được đánh dấu là đã học'
      });
    }
    
    // Thêm vào danh sách đã học
    vocabulary.learnedBy.push({
      user: userId,
      learnedAt: new Date(),
      reviewCount: 0,
      mastery: 20, // Bắt đầu với 20% mastery
      starred: false
    });
    
    await vocabulary.save();
    
    console.log(`✅ Marked vocabulary "${vocabulary.word}" as learned for user ${userId}`);
    
    res.status(200).json({
      success: true,
      message: 'Đã đánh dấu từ vựng là đã học',
      data: vocabulary
    });
  } catch (error) {
    console.error('❌ Error marking vocabulary as learned:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể đánh dấu từ vựng đã học',
      error: error.message
    });
  }
};

// @desc    Đánh dấu/bỏ đánh dấu từ vựng
// @route   POST /api/vocabularies/:id/star
// @access  Private
exports.toggleStarVocabulary = async (req, res) => {
  try {
    const vocabId = req.params.id;
    const userId = req.user.id;
    const { starred } = req.body;
    
    const vocabulary = await Vocabulary.findById(vocabId);
    
    if (!vocabulary) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy từ vựng'
      });
    }
    
    // Tìm user progress
    const userProgress = vocabulary.learnedBy.find(learn => 
      learn.user.toString() === userId.toString()
    );
    
    if (!userProgress) {
      return res.status(400).json({
        success: false,
        message: 'Từ vựng này chưa được học'
      });
    }
    
    // Update starred status
    userProgress.starred = starred;
    await vocabulary.save();
    
    console.log(`${starred ? '⭐' : '☆'} Toggled star for vocabulary "${vocabulary.word}"`);
    
    res.status(200).json({
      success: true,
      message: starred ? 'Đã đánh dấu từ vựng' : 'Đã bỏ đánh dấu từ vựng',
      data: vocabulary
    });
  } catch (error) {
    console.error('❌ Error toggling star:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái đánh dấu',
      error: error.message
    });
  }
};