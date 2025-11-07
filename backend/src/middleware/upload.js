const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads/avatars nếu chưa có
const uploadDir = 'uploads/avatars';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Đã tạo thư mục: ${uploadDir}`);
}

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file: userId_timestamp.extension
    const userId = req.user._id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${ext}`;
    cb(null, filename);
  }
});

// Kiểm tra file type (cho phép ảnh và Excel files)
const fileFilter = (req, file, cb) => {
  // Cho phép các file ảnh
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
  const isImage = allowedImageTypes.test(file.mimetype);

  // Cho phép các file Excel
  const allowedExcelTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel' // .xls
  ];
  const excelExtname = /xlsx|xls/.test(path.extname(file.originalname).toLowerCase());
  const isExcel = allowedExcelTypes.includes(file.mimetype);

  if ((isImage && extname) || (isExcel && excelExtname)) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, GIF, WEBP) hoặc file Excel (XLSX, XLS)'));
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;