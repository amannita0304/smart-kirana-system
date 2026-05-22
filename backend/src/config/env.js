const path = require('path');
const dotenv = require('dotenv');

// Load environment variables once at application bootstrap
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Parse a positive integer from env with a safe fallback.
 */
const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

/**
 * Required variables for a bootable API instance.
 */
const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];

/**
 * Validate required environment variables before server startup.
 * @throws {Error} When one or more required variables are missing.
 */
const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const uri = process.env.MONGODB_URI.trim();
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePositiveInt(process.env.PORT, 5000),
  mongodbUri: process.env.MONGODB_URI?.trim(),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET?.trim(),
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  db: {
    maxPoolSize: parsePositiveInt(process.env.MONGODB_MAX_POOL_SIZE, 10),
    minPoolSize: parsePositiveInt(process.env.MONGODB_MIN_POOL_SIZE, 2),
    serverSelectionTimeoutMS: parsePositiveInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS, 5000),
    socketTimeoutMS: parsePositiveInt(process.env.MONGODB_SOCKET_TIMEOUT_MS, 45000),
    connectRetries: parsePositiveInt(process.env.MONGODB_CONNECT_RETRIES, 3),
    connectRetryDelayMS: parsePositiveInt(process.env.MONGODB_CONNECT_RETRY_DELAY_MS, 3000),
  },
};

const isProduction = env.nodeEnv === 'production';
const isDevelopment = env.nodeEnv === 'development';

module.exports = {
  env,
  validateEnv,
  isProduction,
  isDevelopment,
};
