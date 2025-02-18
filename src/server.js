require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database.config');
const i18next = require('./config/i18n');
const errorMiddleware = require('./middleware/error.middleware');
const responseEnhancer = require('./utils/response.helper');
const { info, error, debug } = require('./utils/logger');

const app = express();

// Kết nối database
connectDB();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(responseEnhancer);

// i18n middleware
app.use((req, res, next) => {
    const lng = req.headers['accept-language'] || req.query.lng || 'en';
    req.language = lng;
    i18next.changeLanguage(lng);
    next();
});

// Response handler
app.response.success = function(data) {
    return this.status(200).json({
        success: true,
        data
    });
};

// Routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Dev routes & Swagger
if (process.env.NODE_ENV === 'development') {
    const devRoutes = require('./routes/dev.routes');
    const swaggerUi = require('swagger-ui-express');
    const swaggerSpec = require('./config/swagger.config');
    
    app.use('/api/dev', devRoutes);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    debug('Development routes enabled');
    debug('Swagger documentation enabled');
}

// Error handling
app.use(errorMiddleware);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    info(`Server is running on port ${PORT}`);
    info(`Environment: ${process.env.NODE_ENV}`);
    if (process.env.NODE_ENV === 'development') {
        info(`API Documentation: http://localhost:${PORT}/api-docs`);
    }
});

// Xử lý lỗi không được bắt
process.on('unhandledRejection', (err) => {
    error('Unhandled Rejection:', err);
    // Đóng server một cách an toàn
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    error('Uncaught Exception:', err);
    // Đóng server một cách an toàn
    process.exit(1);
}); 