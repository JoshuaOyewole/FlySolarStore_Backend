const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("../utils/appError");

const authenticate = async (req, res, next) => {
  try {
    let token;
    // Get token from cookies
     if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    console.log("Auth Token:", token);
    if (!token) {
      console.log("No token found");
      return next(new AppError("Access denied. No token provided.", 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return next(new AppError("User not found. Token invalid.", 401));
      }

      if (!user.isActive) {
        return next(new AppError("Account is deactivated.", 401));
      }

      // Check if user is locked
      if (user.isLocked()) {
        return next(new AppError("Account is temporarily locked.", 423));
      }

      req.user = user;
      next();
    } catch (error) {
      return next(new AppError("Invalid token.", 401));
    }
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("Access denied. Insufficient permissions.", 403)
      );
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    // Get token from cookies
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }


    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (user && user.isActive && !user.isLocked()) {
          req.user = user;

        }
      } catch (error) {
        // Token invalid, continue without user
        console.log("OptionalAuth - Token verification failed:", error.message);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
};
