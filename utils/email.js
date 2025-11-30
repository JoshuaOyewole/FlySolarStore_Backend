const nodemailer = require('nodemailer');

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const transporter = createTransporter();
    
    // For now, sending simple HTML email
    // In production, you'd use a template engine like Handlebars
    let html = '';
    
    if (template === 'emailVerification') {
      html = `
        <h2>Welcome to Bazaar, ${data.name}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${data.verificationLink}">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
      `;
    } else if (template === 'passwordReset') {
      html = `
        <h2>Password Reset Request</h2>
        <p>Hello ${data.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${data.resetLink}">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;
    }

    const mailOptions = {
      from: `"Bazaar" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };