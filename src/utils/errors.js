class AppError extends Error {
    constructor(message, statusCode, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class BadRequestError extends AppError {
    constructor(message = 'Bad request', errors = []) {
        super(message, 400, errors);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}

module.exports = {
    AppError,
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError
}; 