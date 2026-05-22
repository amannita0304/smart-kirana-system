const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Run express-validator chains and forward errors to global handler.
 */
const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((err) => err.msg)
      .join(', ');
    return next(new AppError(message, 400));
  }

  next();
};

module.exports = validate;
