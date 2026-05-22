/**
 * Lightweight logger for consistent server output.
 * Replace with Winston/Pino when observability requirements grow.
 */
const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const payload = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  console[level === 'error' ? 'error' : 'log'](`[${timestamp}] [${level.toUpperCase()}] ${message}${payload}`);
};

const logger = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};

module.exports = logger;
