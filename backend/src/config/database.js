const mongoose = require('mongoose');
const { env, isProduction } = require('./env');
const { DB_READY_STATE, DB_STATUS_LABEL } = require('../constants/database.constants');
const logger = require('../utils/logger');

let listenersRegistered = false;

/**
 * Delay helper for connection retry backoff.
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Production-oriented Mongoose driver options.
 */
const getMongooseOptions = () => ({
  maxPoolSize: env.db.maxPoolSize,
  minPoolSize: env.db.minPoolSize,
  serverSelectionTimeoutMS: env.db.serverSelectionTimeoutMS,
  socketTimeoutMS: env.db.socketTimeoutMS,
  // Disable auto-indexing in production for predictable deploy performance
  autoIndex: !isProduction,
});

/**
 * Register lifecycle listeners once to avoid duplicate handlers on hot reload.
 */
const registerConnectionListeners = () => {
  if (listenersRegistered) return;
  listenersRegistered = true;

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection lost');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB runtime connection error', { message: error.message });
  });
};

/**
 * Configure global Mongoose behavior.
 */
const configureMongoose = () => {
  mongoose.set('strictQuery', true);
};

/**
 * Attempt MongoDB connection with bounded retries.
 * @returns {Promise<typeof mongoose>} Connected mongoose instance.
 * @throws {Error} When all retry attempts fail.
 */
const connectWithRetry = async () => {
  const { connectRetries, connectRetryDelayMS } = env.db;
  let lastError;

  for (let attempt = 1; attempt <= connectRetries; attempt += 1) {
    try {
      const connection = await mongoose.connect(env.mongodbUri, getMongooseOptions());

      logger.info('MongoDB connected successfully', {
        host: connection.connection.host,
        database: connection.connection.name,
        attempt,
      });

      return connection;
    } catch (error) {
      lastError = error;
      logger.error('MongoDB connection attempt failed', {
        attempt,
        maxAttempts: connectRetries,
        message: error.message,
      });

      if (attempt < connectRetries) {
        logger.warn('Retrying MongoDB connection', {
          nextAttemptInMs: connectRetryDelayMS,
        });
        await wait(connectRetryDelayMS);
      }
    }
  }

  throw new Error(
    `MongoDB connection failed after ${connectRetries} attempts: ${lastError?.message || 'Unknown error'}`
  );
};

/**
 * Connect to MongoDB if not already connected.
 * @returns {Promise<typeof mongoose>}
 */
const connectDatabase = async () => {
  configureMongoose();
  registerConnectionListeners();

  if (mongoose.connection.readyState === DB_READY_STATE.CONNECTED) {
    logger.warn('MongoDB connect skipped: already connected');
    return mongoose;
  }

  if (mongoose.connection.readyState === DB_READY_STATE.CONNECTING) {
    logger.warn('MongoDB connect skipped: connection already in progress');
    return mongoose;
  }

  return connectWithRetry();
};

/**
 * Gracefully close the active MongoDB connection.
 * @returns {Promise<void>}
 */
const disconnectDatabase = async () => {
  const { readyState } = mongoose.connection;

  if (readyState === DB_READY_STATE.DISCONNECTED) {
    logger.info('MongoDB disconnect skipped: already disconnected');
    return;
  }

  if (readyState === DB_READY_STATE.DISCONNECTING) {
    logger.warn('MongoDB disconnect skipped: already disconnecting');
    return;
  }

  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected gracefully');
  } catch (error) {
    logger.error('Failed to close MongoDB connection', { message: error.message });
    throw error;
  }
};

/**
 * Expose current database connection metadata for health checks and ops tooling.
 */
const getDatabaseStatus = () => {
  const { readyState, host, name } = mongoose.connection;

  return {
    status: DB_STATUS_LABEL[readyState] || 'unknown',
    readyState,
    host: host || null,
    name: name || null,
    isConnected: readyState === DB_READY_STATE.CONNECTED,
  };
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus,
};
