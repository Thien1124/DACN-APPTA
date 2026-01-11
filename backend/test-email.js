require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🔍 Testing Email Configuration...\n');
  
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
  console.log('🔑 EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET');
  console.log('📱 APP_NAME:', process.env.APP_NAME || 'English Master');
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.error('❌ Email credentials not configured in .env file!');
    process.exit(1);
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    console.log('📮 Attempting to send test email...\n');

    // Send test email
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
      to: 'hoangphong1732003@gmail.com', // Thay đổi email test nếu cần
      subject: 'Test Email - English Master',
      html: `
        <h1>✅ Email Configuration Working!</h1>
        <p>This is a test email from English Master backend.</p>
        <p>If you receive this, your email configuration is correct.</p>
        <hr>
        <p style="color: gray;">Sent at: ${new Date().toLocaleString('vi-VN')}</p>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 To:', 'hoangphong1732003@gmail.com');
    console.log('\n🎉 Email service is working correctly!');
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Gmail App Password may be invalid or expired');
    console.error('2. "Less secure app access" needs to be enabled');
    console.error('3. Network/firewall blocking SMTP');
    console.error('4. Check https://myaccount.google.com/apppasswords\n');
  }
}

testEmail();
