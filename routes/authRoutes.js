const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, verifyEmail, forgotPassword, resetPassword, updatePassword, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('../validators/authValidator');
const { sendEmail } = require('../utils/email');
const catchAsync = require('../utils/catchAsync');

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

// GET /api/auth/verify-email
router.get('/verify-email', verifyEmail);

// POST /api/auth/forgot-password
router.post('/forgot-password', validateForgotPassword, forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', validateResetPassword, resetPassword);

// PUT /api/auth/update-password
router.put('/update-password', authenticate, updatePassword);

// PUT /api/auth/update-profile
router.put('/update-profile', authenticate, updateProfile);

// POST /api/auth/test-email - Test email delivery
router.post('/test-email', catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required'
    });
  }

  try {
    // First, verify SMTP connection
    const nodemailer = require('nodemailer');
    const mailerModule = nodemailer.default || nodemailer;
    
    const port = parseInt(process.env.EMAIL_PORT) || 587;
    const transporter = mailerModule.createTransport({
      host: process.env.EMAIL_HOST,
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    console.log('🔄 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    // Now send the test email
    const result = await sendEmail({
      to: email,
      subject: 'Test Email - FlySolarStore',
      template: 'test',
      data: {
        message: 'This is a test email from FlySolarStore!',
        timestamp: new Date().toISOString()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully!',
      details: {
        recipient: email,
        sentAt: new Date().toISOString(),
        smtpConfig: {
          host: process.env.EMAIL_HOST,
          port: port,
          secure: port === 465
        },
        result: result
      }
    });
  } catch (error) {
    console.error('Test email failed:', error);
    
    let helpfulMessage = 'Failed to send test email. ';
    let suggestions = [];
    
    if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      helpfulMessage += 'Cannot connect to SMTP server. ';
      suggestions.push('Check if EMAIL_HOST is correct');
      suggestions.push('Try port 587 instead of 465 (set EMAIL_PORT=587 in .env)');
      suggestions.push('Check if your firewall is blocking the connection');
      suggestions.push('Verify your network allows outbound SMTP connections');
      suggestions.push('Some networks block port 465, try using port 587 with STARTTLS');
    } else if (error.code === 'EAUTH') {
      helpfulMessage += 'Authentication failed. ';
      suggestions.push('Check EMAIL_USER and EMAIL_PASS are correct');
      suggestions.push('Enable "Less secure app access" if using Gmail');
      suggestions.push('Use app-specific password if 2FA is enabled');
    } else if (error.responseCode === 535) {
      helpfulMessage += 'Invalid credentials. ';
      suggestions.push('Verify EMAIL_USER and EMAIL_PASS in .env');
    }
    
    res.status(500).json({
      success: false,
      message: helpfulMessage,
      error: {
        code: error.code,
        message: error.message,
        command: error.command
      },
      suggestions: suggestions,
      currentConfig: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER?.substring(0, 3) + '***'
      }
    });
  }
}));

module.exports = router;