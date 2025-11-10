const Exercise = require('../models/Exercise');
const Lesson = require('../models/Lesson');
const xlsx = require('xlsx'); // ✅ Đảm bảo import ở đầu file

// @desc    Lấy tất cả bài tập
// @route   GET /api/exercises
// @access  Private/Admin
exports.getAllExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find()
      .sort({ createdAt: -1 })
      .populate('lesson', 'title');
    
    res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài tập',
      error: error.message
    });
  }
};

// @desc    Lấy tất cả bài tập theo bài học
// @route   GET /api/lessons/:lessonId/exercises
// @access  Private/Admin
exports.getExercisesByLesson = async (req, res) => {
  try {
    const exercises = await Exercise.find({ lesson: req.params.lessonId });
    
    res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách bài tập theo bài học',
      error: error.message
    });
  }
};

// @desc    Lấy một bài tập theo ID
// @route   GET /api/exercises/:id
// @access  Private/Admin
exports.getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id)
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
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin bài tập',
      error: error.message
    });
  }
};

// @desc    Tạo bài tập mới
// @route   POST /api/exercises
// @access  Private/Admin
exports.createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    
    res.status(201).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo bài tập',
      error: error.message
    });
  }
};

// @desc    Cập nhật bài tập
// @route   PUT /api/exercises/:id
// @access  Private/Admin
exports.updateExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập với ID này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể cập nhật bài tập',
      error: error.message
    });
  }
};

// @desc    Xóa bài tập
// @route   DELETE /api/exercises/:id
// @access  Private/Admin
exports.deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);
    
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài tập với ID này'
      });
    }
    
    await exercise.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'Bài tập đã được xóa'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa bài tập',
      error: error.message
    });
  }
};

// @desc    Tạo nhiều bài tập cùng lúc
// @route   POST /api/exercises/bulk
// @access  Private/Admin
exports.createBulkExercises = async (req, res) => {
  try {
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu phải là một mảng các bài tập'
      });
    }

    const exercises = await Exercise.insertMany(req.body);
    
    res.status(201).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Không thể tạo danh sách bài tập',
      error: error.message
    });
  }
};

// @desc    Import exercises từ Excel
// @route   POST /api/exercises/import
// @access  Private/Admin
exports.importExercisesFromExcel = async (req, res) => {
  try {
    console.log('🚀 Starting Excel import...');
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải lên file Excel'
      });
    }

    console.log('📄 File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // ✅ Kiểm tra file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      console.log('❌ Invalid file type:', req.file.mimetype);
      return res.status(400).json({
        success: false,
        message: 'Chỉ chấp nhận file Excel (.xlsx hoặc .xls)'
      });
    }

    // Đọc file Excel với error handling
    let workbook;
    try {
      workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      console.log('📊 Workbook loaded successfully');
    } catch (readError) {
      console.error('❌ XLSX read error:', readError);
      return res.status(400).json({
        success: false,
        message: 'File Excel không hợp lệ hoặc bị hỏng',
        error: readError.message
      });
    }

    console.log('📋 Sheet names:', workbook.SheetNames);
    
    if (workbook.SheetNames.length === 0) {
      console.log('❌ No sheets in workbook');
      return res.status(400).json({
        success: false,
        message: 'File Excel không có sheet nào'
      });
    }

    const sheetName = workbook.SheetNames[0];
    console.log('📋 Using sheet:', sheetName);
    
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      console.log('❌ Worksheet is null');
      return res.status(400).json({
        success: false,
        message: 'Sheet đầu tiên trong file Excel trống'
      });
    }

    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    console.log('📋 Parsed data rows:', jsonData.length);

    if (jsonData.length === 0) {
      console.log('❌ No data in Excel file');
      return res.status(400).json({
        success: false,
        message: 'File Excel không có dữ liệu'
      });
    }

    // ✅ Log sample data để debug
    console.log('📋 First row sample:', JSON.stringify(jsonData[0], null, 2));
    console.log('📋 Column headers:', Object.keys(jsonData[0]));

    // Validate và transform data
    const exercises = [];
    const errors = [];

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel rows start at 2 (header at 1)

      try {
        console.log(`🔍 Processing row ${rowNumber}:`, row);

        // Validate required fields
        if (!row['Lesson ID'] || !row['Question'] || !row['Type']) {
          const missing = [];
          if (!row['Lesson ID']) missing.push('Lesson ID');
          if (!row['Question']) missing.push('Question');
          if (!row['Type']) missing.push('Type');
          
          errors.push(`Row ${rowNumber}: Missing required fields (${missing.join(', ')})`);
          continue;
        }

        // Base exercise object
        const exercise = {
          lesson: row['Lesson ID'],
          question: row['Question'],
          type: row['Type'].toLowerCase().trim(),
          difficulty: row['Difficulty']?.toLowerCase() || 'medium',
          points: parseInt(row['Points']) || 10,
          explanation: row['Explanation'] || ''
        };

        console.log(`✅ Base exercise for row ${rowNumber}:`, exercise);

        // Handle multiple-choice type
        if (exercise.type === 'multiple-choice') {
          const options = [];
          for (let j = 1; j <= 4; j++) {
            const optionText = row[`Option ${j}`];
            if (optionText) {
              options.push({
                text: optionText.trim(),
                isCorrect: row['Correct Answer'] === optionText.trim()
              });
            }
          }

          if (options.length < 2) {
            errors.push(`Row ${rowNumber}: Multiple choice needs at least 2 options`);
            continue;
          }

          exercise.options = options;
          console.log(`📝 Options for row ${rowNumber}:`, options);
        }

        // Handle fill-in-blank, translation types
        if (exercise.type === 'fill-in-blank' || exercise.type === 'translation') {
          if (!row['Correct Answer']) {
            errors.push(`Row ${rowNumber}: Missing correct answer`);
            continue;
          }
          exercise.correctAnswer = row['Correct Answer'].trim();
        }

        exercises.push(exercise);
        console.log(`✅ Exercise added for row ${rowNumber}`);
      } catch (error) {
        console.error(`❌ Error processing row ${rowNumber}:`, error);
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    console.log(`📊 Processing complete: ${exercises.length} valid, ${errors.length} errors`);

    // Insert valid exercises
    let createdCount = 0;
    if (exercises.length > 0) {
      try {
        console.log('💾 Inserting exercises to database...');
        const created = await Exercise.insertMany(exercises, { ordered: false });
        createdCount = created.length;
        console.log(`✅ Inserted ${createdCount} exercises`);
      } catch (insertError) {
        console.error('❌ Database insert error:', insertError);
        errors.push(`Database error: ${insertError.message}`);
      }
    }

    const result = {
      success: true,
      message: `Imported ${createdCount} exercises successfully`,
      data: {
        total: jsonData.length,
        created: createdCount,
        failed: errors.length,
        errors: errors
      }
    };

    console.log('🎉 Import result:', result);
    res.status(200).json(result);

  } catch (error) {
    console.error('💥 Unexpected import error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi không mong muốn khi import',
      error: error.message
    });
  }
};

// @desc    Download Excel template
// @route   GET /api/exercises/template
// @access  Private/Admin
exports.downloadExcelTemplate = async (req, res) => {
  try {
    console.log('📄 Generating Excel template...');
    
    // Create template data - ✅ Đơn giản hóa
    const templateData = [
      {
        'Lesson ID': '673abc123def456789012345',
        'Type': 'multiple-choice',
        'Question': 'What is the capital of Vietnam?',
        'Option 1': 'Hanoi',
        'Option 2': 'Ho Chi Minh City',
        'Option 3': 'Da Nang',
        'Option 4': 'Hue',
        'Correct Answer': 'Hanoi',
        'Explanation': 'Hanoi is the capital of Vietnam',
        'Difficulty': 'easy',
        'Points': '10'
      }
    ];

    console.log('📊 Template data created:', templateData.length, 'rows');

    // Create workbook
    const ws = xlsx.utils.json_to_sheet(templateData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Exercises');

    console.log('📋 Workbook created');

    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    console.log('💾 Buffer generated, size:', buffer.length);

    // Set headers
    res.setHeader('Content-Disposition', 'attachment; filename=exercise_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Length', buffer.length);
    
    console.log('📤 Sending file...');
    res.send(buffer);

  } catch (error) {
    console.error('❌ Template download error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Không thể tải template',
      error: error.message
    });
  }
};

// frontend/src/pages/AdminExercises.jsx

// ...existing code...

const handleImportExcel = async (file) => {
  // Validate file type
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  
  if (!validTypes.includes(file.type)) {
    showToast('error', 'Lỗi', 'Vui lòng chọn file Excel (.xlsx hoặc .xls)');
    return;
  }

  // ✅ Add debug logging
  console.log('🚀 Frontend: Starting import');
  console.log('📄 File info:', {
    name: file.name,
    type: file.type,
    size: file.size
  });

  try {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('📤 Sending to server...');
    const response = await adminService.exercises.importFromExcel(formData);
    console.log('📥 Server response:', response);
    
    // ...existing success handling...

  } catch (error) {
    console.error('❌ Frontend error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    const errorMessage = error.response?.data?.message || 'Không thể import file Excel';
    showToast('error', 'Lỗi', errorMessage);
  } finally {
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};