const { error: logError } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log error
    logError(err.message, {
        path: req.path,
        method: req.method,
        body: req.body,
        error: err
    });

    // Default error response
    const response = {
        code: err.code || 500,
        success: false,
        message: err.message || 'Có lỗi xảy ra',
        error: err.error || null
    };

    // Hide error details in production
    if (process.env.NODE_ENV === 'production' && response.code === 500) {
        response.message = 'Có lỗi xảy ra';
        response.error = null;
    }

    res.status(200).json(response);
};

module.exports = errorHandler; 