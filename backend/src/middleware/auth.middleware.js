const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('./asyncHandler');
const { env } = require('../config/env');

/**
 * Protect routes — requires valid JWT in Authorization header.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Login required. Please sign in.', 401));
  }

  const decoded = jwt.verify(token, env.jwtSecret);

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    return next(new AppError('User not found or account deactivated', 401));
  }

  req.user = user;
  next();
});

/**
 * Restrict access by role (e.g. owner-only actions).
 */
const restrictTo = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission for this action', 403));
    }
    next();
  };

module.exports = { protect, restrictTo };
