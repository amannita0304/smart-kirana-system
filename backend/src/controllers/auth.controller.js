const User = require('../models/User');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route   POST /api/auth/register
 * @desc    Register new shop owner
 */
const register = asyncHandler(async (req, res) => {
  const { shopName, ownerName, email, phone, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email is already registered', 409);
  }

  const user = await User.create({
    shopName,
    ownerName,
    email,
    phone,
    password,
  });

  const token = generateToken(user._id);

  sendSuccess(res, {
    message: 'Registration successful',
    token,
    user: {
      id: user._id,
      shopName: user.shopName,
      ownerName: user.ownerName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  }, 201);
});

/**
 * @route   POST /api/auth/login
 * @desc    Login shop owner
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  const token = generateToken(user._id);

  sendSuccess(res, {
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      shopName: user.shopName,
      ownerName: user.ownerName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 */
const getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, { user: req.user });
});

module.exports = { register, login, getMe };
