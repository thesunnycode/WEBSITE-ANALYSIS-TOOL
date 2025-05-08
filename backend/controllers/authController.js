const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/v1/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    logger.info('Attempting user registration', { email, role });

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    logger.info('User registered successfully', { userId: user._id, email });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    logger.error('Registration failed', { error: error.message });
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info('Login attempt', { email });

    // Validate email & password
    if (!email || !password) {
      logger.warn('Login failed - missing credentials');
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn('Login failed - user not found', { email });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      logger.warn('Login failed - invalid password', { email });
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    logger.info('User logged in successfully', { userId: user._id, email });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token
  });
}; 