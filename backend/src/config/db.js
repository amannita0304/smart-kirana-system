/**
 * Backward-compatible entry point for database connection.
 * Prefer importing from ./database in new modules.
 */
const { connectDatabase, disconnectDatabase, getDatabaseStatus } = require('./database');

module.exports = connectDatabase;
module.exports.connectDatabase = connectDatabase;
module.exports.disconnectDatabase = disconnectDatabase;
module.exports.getDatabaseStatus = getDatabaseStatus;
