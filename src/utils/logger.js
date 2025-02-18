const winston = require('winston');
const { format } = winston;

// Custom format cho log
const logFormat = format.printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
});

// Cấu hình winston logger
const logger = winston.createLogger({
    format: format.combine(
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    transports: [
        // Log thông tin vào console
        new winston.transports.Console({
            format: format.combine(
                format.colorize(),
                logFormat
            )
        }),
        // Log errors vào file
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            format: logFormat
        }),
        // Log tất cả vào file
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            format: logFormat
        })
    ]
});

// Export các methods cần thiết
module.exports = {
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    info: logger.info.bind(logger),
    debug: logger.debug.bind(logger),
    success: {
        error: (message, meta = {}) => logger.error(message, meta),
        warn: (message, meta = {}) => logger.warn(message, meta),
        info: (message, meta = {}) => logger.info(message, meta),
        debug: (message, meta = {}) => logger.debug(message, meta)
    }
}; 