/**
 * Mongoose connection readyState values.
 * @see https://mongoosejs.com/docs/api/connection.html#Connection.prototype.readyState
 */
const DB_READY_STATE = {
  DISCONNECTED: 0,
  CONNECTED: 1,
  CONNECTING: 2,
  DISCONNECTING: 3,
};

const DB_STATUS_LABEL = {
  [DB_READY_STATE.DISCONNECTED]: 'disconnected',
  [DB_READY_STATE.CONNECTED]: 'connected',
  [DB_READY_STATE.CONNECTING]: 'connecting',
  [DB_READY_STATE.DISCONNECTING]: 'disconnecting',
};

module.exports = {
  DB_READY_STATE,
  DB_STATUS_LABEL,
};
