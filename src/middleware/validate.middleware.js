const { BadRequestError } = require('../utils/errors');

const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }));
                throw new BadRequestError('Dữ liệu không hợp lệ', errors);
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = { validateRequest }; 