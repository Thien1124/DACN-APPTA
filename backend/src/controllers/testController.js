const Test = require('../models/Test');
const Exercise = require('../models/Exercise');

// Lấy tất cả bài test
exports.getAllTests = async (req, res) => {
  try {
    const tests = await Test.find()
      .populate('course', 'title')
      .populate('unit', 'title');
    
    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài test',
      error: error.message
    });
  }
};

// Lấy bài test theo ID
exports.getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('course', 'title')
      .populate('unit', 'title')
      .populate('exercises');
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin bài test',
      error: error.message
    });
  }
};

// Lấy bài test theo khóa học
exports.getTestsByCourse = async (req, res) => {
  try {
    const tests = await Test.find({ course: req.params.courseId })
      .populate('course', 'title')
      .populate('unit', 'title');
    
    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài test theo khóa học',
      error: error.message
    });
  }
};

// Lấy bài test theo unit
exports.getTestsByUnit = async (req, res) => {
  try {
    const tests = await Test.find({ unit: req.params.unitId })
      .populate('course', 'title')
      .populate('unit', 'title');
    
    res.status(200).json({
      success: true,
      count: tests.length,
      data: tests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài test theo unit',
      error: error.message
    });
  }
};

// Tạo bài test mới
exports.createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);
    
    res.status(201).json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo bài test mới',
      error: error.message
    });
  }
};

// Cập nhật bài test
exports.updateTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật bài test',
      error: error.message
    });
  }
};

// Xóa bài test
exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    await test.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Bài test đã được xóa thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bài test',
      error: error.message
    });
  }
};

// Thêm bài tập vào bài test
exports.addExerciseToTest = async (req, res) => {
  try {
    const { testId, exerciseId } = req.params;
    
    // Kiểm tra bài test tồn tại
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    // Kiểm tra bài tập tồn tại
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập với ID này'
      });
    }
    
    // Kiểm tra xem bài tập đã có trong bài test chưa
    if (test.exercises.includes(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: 'Bài tập này đã có trong bài test'
      });
    }
    
    // Thêm bài tập vào bài test
    test.exercises.push(exerciseId);
    await test.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã thêm bài tập vào bài test thành công',
      data: test
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể thêm bài tập vào bài test',
      error: error.message
    });
  }
};

// Xóa bài tập khỏi bài test
exports.removeExerciseFromTest = async (req, res) => {
  try {
    const { testId, exerciseId } = req.params;
    
    // Kiểm tra bài test tồn tại
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    // Kiểm tra xem bài tập có trong bài test không
    if (!test.exercises.includes(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: 'Bài tập này không có trong bài test'
      });
    }
    
    // Xóa bài tập khỏi bài test
    test.exercises = test.exercises.filter(
      exercise => exercise.toString() !== exerciseId
    );
    await test.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa bài tập khỏi bài test thành công',
      data: test
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bài tập khỏi bài test',
      error: error.message
    });
  }
};

// Thay đổi trạng thái xuất bản của bài test
exports.togglePublishTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    
    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài test với ID này'
      });
    }
    
    test.isPublished = !test.isPublished;
    await test.save();
    
    res.status(200).json({
      success: true,
      data: test
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể thay đổi trạng thái xuất bản của bài test',
      error: error.message
    });
  }
};