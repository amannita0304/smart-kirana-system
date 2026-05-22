/**
 * Consistent API response helpers.
 */
const sendSuccess = (res, data = {}, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    ...data,
  });
};

const sendPaginated = (res, { data, page, limit, total }) => {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  });
};

module.exports = { sendSuccess, sendPaginated };
