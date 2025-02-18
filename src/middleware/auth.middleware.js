const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { error: logger } = require('../utils/logger');

const authMiddleware = {
    // Verify JWT token
    verifyToken: async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new UnauthorizedError('Không tìm thấy token xác thực');
            }

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select('-password');
            if (!user) {
                throw new UnauthorizedError('Token không hợp lệ');
            }

            if (user.status !== 'active') {
                throw new UnauthorizedError('Tài khoản đã bị khóa');
            }

            req.user = user;
            next();
        } catch (err) {
            if (err.name === 'JsonWebTokenError') {
                err = new UnauthorizedError('Token không hợp lệ');
            }
            if (err.name === 'TokenExpiredError') {
                err = new UnauthorizedError('Token đã hết hạn');
            }
            logger.error('Auth middleware error', { error: err });
            next(err);
        }
    },

    // Kiểm tra role
    restrictTo: (...roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                throw new ForbiddenError('Bạn không có quyền thực hiện hành động này');
            }
            next();
        };
    },

    // Kiểm tra owner của resource
    isOwner: (model) => async (req, res, next) => {
        try {
            const resource = await model.findById(req.params.id);
            if (!resource) {
                throw new NotFoundError('Không tìm thấy tài nguyên');
            }

            const isOwner = resource.user_id?.toString() === req.user._id.toString() || 
                           resource.instructor_id?.toString() === req.user._id.toString();

            if (!isOwner && req.user.role !== 'admin') {
                throw new ForbiddenError('Bạn không có quyền thực hiện hành động này');
            }

            req.resource = resource;
            next();
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authMiddleware; 