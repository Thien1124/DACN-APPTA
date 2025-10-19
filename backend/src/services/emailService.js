const nodemailer = require('nodemailer');

/**
 * Gửi OTP qua email (cho đăng ký)
 * 
 * @param {string} email - Email người nhận
 * @param {string} otp - Mã OTP 6 số
 * @param {string} name - Tên người dùng
 */
const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    const appName = process.env.APP_NAME || 'DACN-APPTA';
    const currentYear = new Date().getFullYear();
    
    const mailOptions = {
      from: `"${appName}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Mã xác thực OTP - ${appName}`,
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác thực tài khoản</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
              padding: 40px 20px;
              line-height: 1.6;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .email-body {
              padding: 40px 30px;
              background: #ffffff;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .greeting strong {
              color: #11998e;
              font-weight: 600;
            }
            .message {
              font-size: 15px;
              color: #555;
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .otp-container {
              background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
              box-shadow: 0 10px 30px rgba(17, 153, 142, 0.3);
            }
            .otp-label {
              color: rgba(255, 255, 255, 0.9);
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 15px;
              font-weight: 500;
            }
            .otp-code {
              font-size: 48px;
              font-weight: 700;
              color: #ffffff;
              letter-spacing: 12px;
              font-family: 'Courier New', monospace;
              text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }
            .warning-box {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px 20px;
              border-radius: 8px;
              margin: 25px 0;
            }
            .warning-box p {
              color: #856404;
              font-size: 14px;
              margin: 5px 0;
            }
            .warning-box strong {
              color: #d9534f;
              font-weight: 600;
            }
            .info-list {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px 25px;
              margin: 25px 0;
            }
            .info-list li {
              color: #555;
              font-size: 14px;
              margin: 10px 0;
              padding-left: 5px;
            }
            .info-list li strong {
              color: #333;
            }
            .footer {
              background: #f8f9fa;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            .footer p {
              color: #6c757d;
              font-size: 13px;
              margin: 8px 0;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e9ecef, transparent);
              margin: 25px 0;
            }
            @media only screen and (max-width: 600px) {
              body { padding: 20px 10px; }
              .email-body { padding: 30px 20px; }
              .otp-code { font-size: 36px; letter-spacing: 8px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-body">
              <p class="greeting">Xin chào <strong>${name}</strong>,</p>
              
              <p class="message">
                Cảm ơn bạn đã đăng ký tài khoản tại <strong>${appName}</strong>. 
                Để hoàn tất quá trình đăng ký và kích hoạt tài khoản của bạn, 
                vui lòng sử dụng mã OTP bên dưới:
              </p>
              
              <div class="otp-container">
                <div class="otp-label">Mã xác thực OTP</div>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning-box">
                <p><strong>Lưu ý quan trọng:</strong></p>
                <p>Mã OTP này chỉ có hiệu lực trong <strong>1 phút</strong> kể từ khi nhận email.</p>
              </div>
              
              <ul class="info-list">
                <li>Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên ${appName}.</li>
                <li>Mã sẽ tự động hết hạn sau 1 phút.</li>
                <li>Nếu mã hết hạn, bạn có thể yêu cầu gửi lại mã mới.</li>
              </ul>
            </div>
            
            <div class="footer">
              <p><strong>${appName}</strong></p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>&copy; ${currentYear} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email OTP đã gửi thành công:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Lỗi gửi email OTP:', error.message);
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
  }
};

/**
 * Gửi OTP reset password qua email
 * 
 * @param {string} email - Email người nhận
 * @param {string} otp - Mã OTP 6 số
 * @param {string} name - Tên người dùng
 */
const sendPasswordResetOTP = async (email, otp, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    const appName = process.env.APP_NAME || 'DACN-APPTA';
    const currentYear = new Date().getFullYear();
    
    const mailOptions = {
      from: `"${appName}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Đặt lại mật khẩu - ${appName}`,
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Đặt lại mật khẩu</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              padding: 40px 20px;
              line-height: 1.6;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .email-body {
              padding: 40px 30px;
              background: #ffffff;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .greeting strong {
              color: #f5576c;
              font-weight: 600;
            }
            .message {
              font-size: 15px;
              color: #555;
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .otp-container {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
              box-shadow: 0 10px 30px rgba(245, 87, 108, 0.3);
            }
            .otp-label {
              color: rgba(255, 255, 255, 0.9);
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 15px;
              font-weight: 500;
            }
            .otp-code {
              font-size: 48px;
              font-weight: 700;
              color: #ffffff;
              letter-spacing: 12px;
              font-family: 'Courier New', monospace;
              text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }
            .warning-box {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px 20px;
              border-radius: 8px;
              margin: 25px 0;
            }
            .warning-box p {
              color: #856404;
              font-size: 14px;
              margin: 5px 0;
            }
            .warning-box strong {
              color: #d9534f;
              font-weight: 600;
            }
            .info-list {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 20px 25px;
              margin: 25px 0;
            }
            .info-list li {
              color: #555;
              font-size: 14px;
              margin: 10px 0;
              padding-left: 5px;
            }
            .info-list li strong {
              color: #333;
            }
            .footer {
              background: #f8f9fa;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            .footer p {
              color: #6c757d;
              font-size: 13px;
              margin: 8px 0;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e9ecef, transparent);
              margin: 25px 0;
            }
            @media only screen and (max-width: 600px) {
              body { padding: 20px 10px; }
              .email-body { padding: 30px 20px; }
              .otp-code { font-size: 36px; letter-spacing: 8px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-body">
              <p class="greeting">Xin chào <strong>${name}</strong>,</p>
              
              <p class="message">
                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại <strong>${appName}</strong>. 
                Để tiếp tục, vui lòng sử dụng mã OTP bên dưới:
              </p>
              
              <div class="otp-container">
                <div class="otp-label">Mã xác thực OTP</div>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning-box">
                <p><strong>Lưu ý quan trọng:</strong></p>
                <p>Mã OTP này chỉ có hiệu lực trong <strong>10 phút</strong> kể từ khi nhận email.</p>
              </div>
              
              <ul class="info-list">
                <li><strong>Bảo mật:</strong> Không chia sẻ mã này với bất kỳ ai.</li>
                <li><strong>Thời gian:</strong> Mã sẽ tự động hết hạn sau 10 phút.</li>
                <li><strong>Không phải bạn?</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</li>
              </ul>
              
              <div class="divider"></div>
              
              <p class="message" style="font-size: 14px; color: #6c757d;">
                Nếu bạn không thực hiện yêu cầu này, tài khoản của bạn vẫn an toàn. 
                Vui lòng liên hệ với chúng tôi nếu có bất kỳ thắc mắc nào.
              </p>
            </div>
            
            <div class="footer">
              <p><strong>${appName}</strong></p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>&copy; ${currentYear} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Lỗi gửi email reset password OTP:', error.message);
    throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
  }
};

// QUAN TRỌNG: Export cả 2 functions
module.exports = { 
  sendOTPEmail, 
  sendPasswordResetOTP 
};