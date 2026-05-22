const { getDatabaseStatus } = require('../config/database');

/**
 * Lightweight readiness endpoint for uptime checks and load balancers.
 */
const getHealth = async (req, res) => {
  const database = getDatabaseStatus();

  res.status(200).json({
    success: true,
    message: 'Smart Kirana API is running',
    database,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };
