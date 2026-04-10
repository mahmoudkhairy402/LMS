const AppError = require("../utils/appError");

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((item) => item.message).join(", ");
      return next(new AppError(details, 400));
    }

    req.body = value;
    return next();
  };
}

module.exports = validate;
