const { validateEnv } = require('./src/config/env');
const { connectDatabase, disconnectDatabase } = require('./src/config/database');
const { env } = require('./src/config/env');
const app = require('./src/app');
const logger = require('./src/utils/logger');

let server;

/**
 * Bootstraps database connection and HTTP server.
 */
const startServer = async () => {
  try {
    validateEnv();
    await connectDatabase();

    server = app.listen(env.port, () => {
      logger.info('HTTP server started', {
        port: env.port,
        environment: env.nodeEnv,
        apiPrefix: '/api',
      });
    });
  } catch (error) {
    logger.error('Server startup failed', { message: error.message });
    process.exit(1);
  }
};

/**
 * Gracefully stops HTTP server and MongoDB connection.
 */
const shutdown = async (signal) => {
  logger.warn('Shutdown signal received', { signal });

  const closeHttpServer = () =>
    new Promise((resolve, reject) => {
      if (!server) {
        resolve();
        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        logger.info('HTTP server closed');
        resolve();
      });
    });

  try {
    await closeHttpServer();
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('Graceful shutdown failed', { message: error.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});

process.on('SIGINT', () => {
  shutdown('SIGINT');
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled promise rejection', { message: error?.message || String(error) });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { message: error?.message || String(error) });
  process.exit(1);
});

startServer();
