const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const RefreshToken = require('../models/refresh_token.model');
const { UnauthorizedError } = require('../utils/errors');
const i18next = require('i18next');

class TokenService {
    generateAccessToken(user) {
        return jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );
    }

    async generateRefreshToken(user) {
        // Tạo refresh token
        const refreshToken = crypto.randomBytes(40).toString('hex');
        
        // Lưu vào database
        await RefreshToken.create({
            user_id: user._id,
            token: refreshToken,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        return refreshToken;
    }

    async refreshAccessToken(refreshToken) {
        // Tìm refresh token trong database
        const tokenDoc = await RefreshToken.findOne({
            token: refreshToken,
            revoked: false,
            expires_at: { $gt: new Date() }
        });

        if (!tokenDoc) {
            throw new UnauthorizedError(i18next.t('auth.invalidRefreshToken'));
        }

        // Đánh dấu token cũ là đã sử dụng
        tokenDoc.revoked = true;
        
        // Tạo refresh token mới
        const user = await User.findById(tokenDoc.user_id);
        const newAccessToken = this.generateAccessToken(user);
        const newRefreshToken = await this.generateRefreshToken(user);

        // Lưu token mới thay thế token cũ
        tokenDoc.replaced_by = newRefreshToken;
        await tokenDoc.save();

        return {
            access_token: newAccessToken,
            refresh_token: newRefreshToken
        };
    }

    async revokeRefreshToken(refreshToken) {
        await RefreshToken.updateOne(
            { token: refreshToken },
            { revoked: true }
        );
    }

    async revokeAllUserTokens(userId) {
        await RefreshToken.updateMany(
            { user_id: userId, revoked: false },
            { revoked: true }
        );
    }

    // Cleanup expired tokens
    async cleanupExpiredTokens() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await RefreshToken.deleteMany({
            expires_at: { $lt: thirtyDaysAgo }
        });
    }
}

module.exports = new TokenService(); 