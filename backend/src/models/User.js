const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên'],
    trim: true,
    minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
    maxlength: [50, 'Tên không được quá 50 ký tự']
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [function() { return this.provider === 'local'; }, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false
  },
  age: {
    type: Number,
    min: [0, 'Tuổi phải lớn hơn hoặc bằng 0'],
    max: [120, 'Tuổi phải nhỏ hơn hoặc bằng 120'],
    validate: {
      validator: Number.isInteger,
      message: 'Tuổi phải là số nguyên'
    }
  },

  // OAuth fields
  provider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  providerId: {
    type: String,
    index: true,
    sparse: true
  },
  avatar: {
    type: String
  },
  emailVerified: {
    type: Boolean,
    default: false
  },

  // OTP for registration
  otp: {
    code: { 
      type: String, 
      select: false
    },
    expiresAt: { 
      type: Date, 
      select: false
    },
    attempts: { 
      type: Number, 
      default: 0, 
      select: false
    }
  },

  // OTP for password reset
  passwordResetOTP: {
    code: { 
      type: String, 
      select: false
    },
    expiresAt: { 
      type: Date, 
      select: false
    },
    attempts: { 
      type: Number, 
      default: 0, 
      select: false
    }
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware: Hash password trước khi save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method: So sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method: Tạo mã OTP ngẫu nhiên 6 số (cho đăng ký)
userSchema.methods.generateOTP = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 phút
  
  this.otp = {
    code: code,
    expiresAt: expiresAt,
    attempts: 0
  };
  
  return code;
};

// Method: Tạo mã OTP cho reset password (10 phút)
userSchema.methods.generatePasswordResetOTP = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
  
  this.passwordResetOTP = {
    code: code,
    expiresAt: expiresAt,
    attempts: 0
  };
  
  return code;
};

// Method: Xác thực mã OTP (cho đăng ký)
userSchema.methods.verifyOTP = function(inputCode) {
  if (!this.otp || !this.otp.code) {
    return { 
      success: false, 
      message: 'Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại.' 
    };
  }
  
  if (new Date() > this.otp.expiresAt) {
    return { 
      success: false, 
      message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.' 
    };
  }
  
  if (this.otp.attempts >= 5) {
    return { 
      success: false, 
      message: 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu gửi lại OTP mới.' 
    };
  }
  
  if (this.otp.code !== inputCode.toString()) {
    this.otp.attempts += 1;
    return { 
      success: false, 
      message: `Mã OTP không đúng. Bạn còn ${5 - this.otp.attempts} lần thử.` 
    };
  }
  
  // OTP đúng
  this.otp = undefined;
  this.isActive = true;
  this.emailVerified = true;
  
  return { 
    success: true, 
    message: 'Xác thực thành công! Tài khoản của bạn đã được kích hoạt.' 
  };
};

// Method: Xác thực mã OTP reset password
userSchema.methods.verifyPasswordResetOTP = function(inputCode) {
  if (!this.passwordResetOTP || !this.passwordResetOTP.code) {
    return { 
      success: false, 
      message: 'Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại.' 
    };
  }
  
  if (new Date() > this.passwordResetOTP.expiresAt) {
    return { 
      success: false, 
      message: 'Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.' 
    };
  }
  
  if (this.passwordResetOTP.attempts >= 5) {
    return { 
      success: false, 
      message: 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu gửi lại OTP mới.' 
    };
  }
  
  if (this.passwordResetOTP.code !== inputCode.toString()) {
    this.passwordResetOTP.attempts += 1;
    return { 
      success: false, 
      message: `Mã OTP không đúng. Bạn còn ${5 - this.passwordResetOTP.attempts} lần thử.` 
    };
  }
  
  // OTP đúng - xóa OTP reset
  this.passwordResetOTP = undefined;
  
  return { 
    success: true, 
    message: 'Xác thực OTP thành công.' 
  };
};

// Validation: Phải có email nếu là tài khoản local
userSchema.pre('validate', function(next) {
  if (this.provider === 'local' && !this.email) {
    this.invalidate('email', 'Vui lòng cung cấp email');
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;