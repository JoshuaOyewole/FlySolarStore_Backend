const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { sendEmail } = require("../utils/email");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${
    process.env.BACKEND_URL || "http://localhost:5000"
  }/api/auth/google/callback`
);

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};
// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  // Remove password from output
  user.password = undefined;
  user.emailVerificationToken = undefined;
  user.lastLogin = undefined;
  user.dateOfBirth = undefined;
  user.createdAt = undefined;
  user.updatedAt = undefined;
  user.loginAttempts = undefined;
  user.isEmailVerified = undefined;

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      user,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = catchAsync(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { firstName, lastName, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User already exists with this email",
    });
  }

  // Prevent registration with disposable email addresses
  const disposableEmailDomains = [
    "mailinator.com",
    "tempmail.com",
    "10minutemail.com",
  ];
  const emailDomain = email.split("@")[1];

  if (disposableEmailDomains.includes(emailDomain)) {
    return res.status(400).json({
      success: false,
      message: "Registration using disposable email addresses is not allowed",
    });
  }
  // Validate password strength
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters long and contain both letters and numbers",
    });
  }

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    channel: req.body.channel || "normal",
  });

  // Generate email verification token
  const emailVerificationToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = emailVerificationToken;
  await user.save();

  // Send verification email
  try {
    await sendEmail({
      to: user.email,
      subject: "Email Verification - FlySolarStore",
      template: "emailVerification",
      data: {
        name: user.firstName,
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`,
      },
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't fail registration if email fails
  }

  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = catchAsync(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  // Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Check if account is locked
  if (user.isLocked()) {
    return res.status(423).json({
      success: false,
      message:
        "Account is temporarily locked due to too many failed login attempts",
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Account is deactivated. Please contact support.",
    });
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    // Increment login attempts
    user.loginAttempts += 1;

    // Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 30 * 60 * 1000; // 30 minutes
    }

    await user.save();
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Reset login attempts on successful login
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = catchAsync(async (req, res, next) => {
  // Clear the token cookie
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("addresses");

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = catchAsync(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No user found with that email",
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save();

  // Send reset email
  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset - FlySolarStore",
      template: "passwordReset",
      data: {
        name: user.firstName,
        resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      },
    });

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(500).json({
      success: false,
      message: "Email could not be sent",
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = catchAsync(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  const { token, password } = req.body;

  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide current and new password",
    });
  }

  // Get user with password
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordCorrect) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
const verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Verification token is required",
    });
  }

  // Find user with matching token
  const user = await User.findOne({ emailVerificationToken: token });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification token",
    });
  }

  // Check if already verified
  if (user.isEmailVerified) {
    return res.status(200).json({
      success: true,
      message: "Email already verified",
      data: {
        user: {
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: {
      user: {
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phone, dateOfBirth, gender } = req.body;

  // Get user
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }
  }

  // Handle avatar upload if file is provided
  if (req.file) {
    const cloudinary = require("../config/cloudinary");
    const streamifier = require("streamifier");

    try {
      // Delete old avatar from Cloudinary if exists
      if (user.avatar && user.avatar.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }

      // Upload new avatar to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "avatars",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      user.avatar = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    } catch (error) {
      console.error("Avatar upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload avatar image",
      });
    }
  }

  // Update fields
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (dateOfBirth) user.dateOfBirth = dateOfBirth;
  if (gender) user.gender = gender;

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      user:{
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        avatar: user.avatar,
      },
    },
  });
});

// @desc    Google OAuth - Initiate
// @route   GET /api/auth/google
// @access  Public
const googleAuth = catchAsync(async (req, res) => {
  const authorizeUrl = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    prompt: "consent",
  });

  res.redirect(authorizeUrl);
});

// @desc    Google OAuth - Callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = catchAsync(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/register?error=auth_failed`
    );
  }

  const { OAuth2Client } = require("google-auth-library");
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${
      process.env.BACKEND_URL || "http://localhost:5000"
    }/api/auth/google/callback`
  );

  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Verify and get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.channel = "social";
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        firstName: given_name || "User",
        lastName: family_name || "",
        email,
        googleId,
        channel: "social",
        password: crypto.randomBytes(32).toString("hex"), // Random password for social accounts
        isEmailVerified: true,
        avatar: picture ? { url: picture } : undefined,
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    // Redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/?auth=success`);
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/register?error=auth_failed`);
  }
});

module.exports = {
  register,
  login,
  logout,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateProfile,
  googleAuth,
  googleCallback,
};
