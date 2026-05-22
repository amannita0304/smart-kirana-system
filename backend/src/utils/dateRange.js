/**
 * Build MongoDB date range filter from query period or custom dates.
 */
const getDateRange = (query = {}) => {
  const now = new Date();
  let startDate;
  let endDate = new Date(now.setHours(23, 59, 59, 999));

  const { period, startDate: customStart, endDate: customEnd } = query;

  if (customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (period) {
    case 'weekly': {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;
    }
    case 'monthly': {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    }
    case 'yearly': {
      startDate = new Date(today.getFullYear(), 0, 1);
      break;
    }
    case 'daily':
    default: {
      startDate = today;
      break;
    }
  }

  return { startDate, endDate };
};

module.exports = { getDateRange };
