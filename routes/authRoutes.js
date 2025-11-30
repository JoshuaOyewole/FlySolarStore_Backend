const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, forgotPassword, resetPassword, updatePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('../validators/authValidator');

// POST /api/auth/register
router.post('/register', validateRegister, register);

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

// POST /api/auth/forgot-password
router.post('/forgot-password', validateForgotPassword, forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', validateResetPassword, resetPassword);

// PUT /api/auth/update-password
router.put('/update-password', authenticate, updatePassword);

module.exports = router;