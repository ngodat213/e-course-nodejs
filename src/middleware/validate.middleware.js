const { BadRequestError } = require("../utils/errors");

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const { error } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        // Transform validation errors to object
        const errors = error.details.reduce((acc, err) => {
          acc[err.path[0]] = err.message.replace(/['"]/g, '');
          return acc;
        }, {});

        throw new BadRequestError("Dữ liệu không hợp lệ", errors);
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { validateRequest };