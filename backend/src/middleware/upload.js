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

// Kiểm tra file type (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

// Cấu hình multer cho avatar
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  },
  fileFilter: fileFilter
});

// ===== CSV/TSV Upload Middleware =====

// Cấu hình cho CSV/TSV (memory storage - không lưu file)
const csvStorage = multer.memoryStorage();

// Kiểm tra file type cho CSV/TSV
const csvFileFilter = (req, file, cb) => {
  const allowedTypes = /csv|tsv|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimeTypes = [
    'text/csv',
    'text/tab-separated-values',
    'text/plain',
    'application/vnd.ms-excel', // Some browsers send this for CSV
  ];
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file CSV, TSV hoặc TXT'));
  }
};

// Cấu hình multer cho CSV/TSV
const csvUpload = multer({
  storage: csvStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB cho CSV/TSV
  },
  fileFilter: csvFileFilter
});

// ===== Audio Upload Middleware =====

// Cấu hình cho audio (memory storage - xử lý trong controller)
const audioStorage = multer.memoryStorage();

// Kiểm tra file type cho audio
const audioFileFilter = (req, file, cb) => {
  const allowedTypes = /mp3|wav|webm|ogg|m4a/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/mp4',
    'audio/x-m4a',
    'video/webm', // WebM can be video or audio
  ];
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file audio (MP3, WAV, WebM, OGG, M4A)'));
  }
};

// Cấu hình multer cho audio
const audioUpload = multer({
  storage: audioStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB cho audio
  },
  fileFilter: audioFileFilter
});

module.exports = upload;
module.exports.csvUpload = csvUpload;
module.exports.audioUpload = audioUpload;