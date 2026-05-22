const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

/**
 * Generate signed JWT for authenticated sessions.
 */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpire,
  });

module.exports = generateToken;
