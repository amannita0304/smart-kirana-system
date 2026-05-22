const mongoose = require('mongoose');

/**
 * Run callback inside a MongoDB transaction when supported (replica set / Atlas).
 * Falls back to non-transactional execution on standalone local MongoDB.
 *
 * @param {Function} callback - async (session | null) => result
 */
const withTransaction = async (callback) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();

    const isTransactionUnsupported =
      error.code === 20 ||
      error.message?.includes('Transaction numbers are only allowed') ||
      error.message?.includes('replica set');

    if (isTransactionUnsupported) {
      return callback(null);
    }

    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = withTransaction;
