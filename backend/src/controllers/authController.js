const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const { sendOTPEmail, sendPasswordResetOTP } = require('../services/emailService');

/**
 * Chuyển đổi chuỗi thời gian hết hạn thành milliseconds
 */
const parseExpireToMs = (expire) => {
  if (!expire) return 1 * 24 * 60 * 60 * 1000;
  if (typeof expire === 'number') return expire * 1000;
  
  const s = String(expire).trim();
  if (/^\d+$/.test(s)) return Number(s) * 1000;

  const match = s.match(/^(\d+)(d|h|m|s)$/i);
  if (!match) return 1 * 24 * 60 * 60 * 1000;
  
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: return 1 * 24 * 60 * 60 * 1000;
  }
};

/**
 * Tạo JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'default-secret-key',
    { expiresIn: process.env.JWT_EXPIRE || '1d' }
  );
};

/**
 * API đăng ký người dùng mới
 */
const register = async (req, res) => {
  try {
    const { name, email, password, age } = req.body;

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email đã được sử dụng' 
        });
      }
    }

    const userData = {
      name: name.trim(),
      email: email || undefined,
      password,
      isActive: false,
      emailVerified: false
    };

    if (age !== undefined && age !== null && age !== '') {
      const ageNumber = Number(age);
      if (!Number.isNaN(ageNumber)) {
        userData.age = ageNumber;
      }
    }

    const user = await User.create(userData);

    if (email) {
      const otp = user.generateOTP();
      await user.save();
      
      try {
        await sendOTPEmail(email, otp, user.name);
        console.log(`OTP đã gửi đến ${email}: ${otp}`);
      } catch (emailError) {
        console.error('Lỗi gửi email:', emailError);
        return res.status(201).json({
          success: true,
          message: 'Đăng ký thành công nhưng không thể gửi email. Vui lòng yêu cầu gửi lại OTP.',
          data: {
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              needsVerification: true
            }
          }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: email 
        ? 'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.' 
        : 'Đăng ký thành công!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          needsVerification: !!email
        }
      }
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);

    if (error && error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        errors 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Đã xảy ra lỗi khi đăng ký' 
    });
  }
};

/**
 * API xác thực OTP (cho đăng ký)
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và mã OTP'
      });
    }

    const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt +otp.attempts');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với email này'
      });
    }

    if (user.isActive && user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản đã được kích hoạt rồi'
      });
    }

    const result = user.verifyOTP(otp);

    if (!result.success) {
      await user.save();
      return res.status(400).json(result);
    }

    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Xác thực thành công! Tài khoản của bạn đã được kích hoạt.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Lỗi verify OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xác thực OTP'
    });
  }
};

/**
 * API gửi lại OTP (cho đăng ký)
 */
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với email này'
      });
    }

    if (user.isActive && user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Tài khoản đã được kích hoạt rồi'
      });
    }

    const otp = user.generateOTP();
    await user.save();

    await sendOTPEmail(email, otp, user.name);
    console.log(`OTP mới đã gửi đến ${email}: ${otp}`);

    res.json({
      success: true,
      message: 'Mã OTP mới đã được gửi đến email của bạn'
    });
  } catch (error) {
    console.error('Lỗi gửi lại OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi gửi lại OTP'
    });
  }
};

/**
 * API đăng nhập người dùng
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và mật khẩu'
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP.',
        data: {
          needsVerification: true,
          email: user.email,
          userId: user._id
        }
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    const token = generateToken(user._id);

    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          avatar: user.avatar,
          role: user.role,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          provider: user.provider,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đăng nhập'
    });
  }
};

/**
 * API đăng xuất (Token Blacklist)
 */
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy token'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');

    const existingToken = await TokenBlacklist.findOne({ token });
    
    if (existingToken) {
      return res.status(400).json({
        success: false,
        message: 'Token đã được đăng xuất trước đó'
      });
    }

    await TokenBlacklist.create({
      token,
      userId: req.user._id,
      expiresAt: new Date(decoded.exp * 1000)
    });

    console.log(`User ${req.user.email} đã đăng xuất - Token added to blacklist`);

    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đăng xuất'
    });
  }
};

/**
 * API quên mật khẩu - Gửi OTP
 * 
 * Endpoint: POST /api/auth/forgot-password
 * Body: { email }
 * 
 * Quy trình:
 * 1. Kiểm tra email có tồn tại không
 * 2. Kiểm tra tài khoản có phải local không (không phải OAuth)
 * 3. Tạo OTP reset password (10 phút)
 * 4. Gửi OTP qua email
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email'
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với email này'
      });
    }

    // Kiểm tra tài khoản OAuth (không có password)
    if (user.provider !== 'local') {
      return res.status(400).json({
        success: false,
        message: `Tài khoản này đăng nhập bằng ${user.provider}. Không thể đặt lại mật khẩu.`
      });
    }

    // Tạo OTP reset password (10 phút)
    const otp = user.generatePasswordResetOTP();
    await user.save();

    // Gửi email
    await sendPasswordResetOTP(email, otp, user.name);

    res.json({
      success: true,
      message: 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
      data: {
        email: user.email
      }
    });
  } catch (error) {
    console.error('Lỗi forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xử lý yêu cầu'
    });
  }
};

/**
 * API reset mật khẩu - Verify OTP và đổi password
 * 
 * Endpoint: POST /api/auth/reset-password
 * Body: { email, otp, newPassword, confirmPassword }
 * 
 * Quy trình:
 * 1. Tìm user bằng email
 * 2. Verify OTP reset password
 * 3. Validate password mới
 * 4. Cập nhật password
 * 5. Clear OTP reset
 */
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // Validate input
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ email, OTP và mật khẩu mới'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp'
      });
    }

    // Tìm user và select passwordResetOTP
    const user = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+passwordResetOTP.code +passwordResetOTP.expiresAt +passwordResetOTP.attempts +password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với email này'
      });
    }

    // Verify OTP
    const result = user.verifyPasswordResetOTP(otp);

    if (!result.success) {
      await user.save(); // Lưu số lần thử
      return res.status(400).json(result);
    }

    // Đổi password
    user.password = newPassword;
    user.updatedAt = Date.now();
    await user.save();

    console.log(`User ${email} đã đặt lại mật khẩu thành công`);

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.'
    });
  } catch (error) {
    console.error('Lỗi reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đặt lại mật khẩu'
    });
  }
};

/**
 * Xử lý callback OAuth
 */
const oauthSuccessRedirect = (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth`
      );
    }

    const token = generateToken(user._id);

    const isProduction = process.env.NODE_ENV === 'production';
    const secure = isProduction;
    const sameSite = secure ? 'None' : 'Lax';
    const maxAge = parseExpireToMs(process.env.JWT_EXPIRE || '1d');

    res.cookie('token', token, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge
    });

    const redirectBase = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.redirect(`${redirectBase}/oauth-success`);
    
  } catch (err) {
    console.error('Lỗi xử lý OAuth redirect:', err);
    return res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=oauth`
    );
  }
};

module.exports = { 
  register,
  login,
  logout,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  oauthSuccessRedirect
};