const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Đường dẫn tới model User của bạn

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Không có token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Đảm bảo bạn có JWT_SECRET trong .env

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(401).json({ success: false, message: 'Token không hợp lệ' });
  }
};

module.exports = authenticate;
