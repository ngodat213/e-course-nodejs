const winston = require('winston');
const path = require('path');

// Định nghĩa format chung
const commonFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Logger cho success cases
const successLogger = winston.createLogger({
    level: 'info',
    format: commonFormat,
    defaultMeta: { 
        service: 'e-course-api',
        type: 'success'
    },
    transports: [
        new winston.transports.File({ 
            filename: path.join('logs', 'success', 'success.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Logger cho error cases
const errorLogger = winston.createLogger({
    level: 'error',
    format: commonFormat,
    defaultMeta: { 
        service: 'e-course-api',
        type: 'error'
    },
    transports: [
        new winston.transports.File({ 
            filename: path.join('logs', 'error', 'error.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Thêm console transport trong môi trường development
if (process.env.NODE_ENV !== 'production') {
    const consoleFormat = winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    );

    successLogger.add(new winston.transports.Console({
        format: consoleFormat
    }));

    errorLogger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Tạo stream để sử dụng với morgan
const morganStream = {
    write: (message) => {
        if (message.includes('ERROR')) {
            errorLogger.error(message.trim());
        } else {
            successLogger.info(message.trim());
        }
    }
};

// Helper functions
const success = {
    info: (message, meta = {}) => {
        successLogger.info(message, { ...meta, timestamp: new Date() });
    },
    debug: (message, meta = {}) => {
        successLogger.debug(message, { ...meta, timestamp: new Date() });
    },
    http: (message, meta = {}) => {
        successLogger.http(message, { ...meta, timestamp: new Date() });
    }
};

const error = {
    error: (message, meta = {}) => {
        errorLogger.error(message, { ...meta, timestamp: new Date() });
    },
    warn: (message, meta = {}) => {
        errorLogger.warn(message, { ...meta, timestamp: new Date() });
    }
};

module.exports = {
    success,
    error,
    stream: morganStream
}; 